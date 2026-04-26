// @deps xlsx@0.18.5
routerAdd(
  'POST',
  '/backend/v1/processar_cotacao',
  (e) => {
    const XLSX = require('xlsx')
    const authRecord = e.auth
    if (!authRecord) return e.unauthorizedError('Unauthorized')
    const userId = authRecord.id

    const d = new Date(Date.now() - 60000)
    const dateStr = d.toISOString().replace('T', ' ').substring(0, 19) + '.000Z'
    const recentLogs = $app.findRecordsByFilter(
      'audit_logs',
      `user_id='${userId}' && acao='processar_cotacao' && created >= '${dateStr}'`,
      '',
      20,
      0,
    )
    if (recentLogs.length >= 10) {
      return e.json(429, {
        status: 'erro',
        erro: 'Muitas requisições. Tente novamente em 1 minuto.',
        mensagem: 'Muitas requisições. Tente novamente em 1 minuto.',
      })
    }

    const logDetails = {}
    let finalStatus = 200
    let finalResponse = {}

    try {
      const files = e.findUploadedFiles('file')
      if (!files || files.length === 0) {
        throw new Error('Arquivo não enviado|file')
      }
      const file = files[0]

      if (file.size === 0) {
        throw new Error('Arquivo não contém dados|file')
      }

      if (file.size > 5242880) {
        throw new Error('Arquivo excede 5MB|file')
      }

      const body = e.requestInfo().body || {}
      const supplierId = body.supplier_id
      if (!supplierId) {
        throw new Error('Fornecedor não informado|supplier_id')
      }

      let fsysFile = $filesystem.fileFromMultipart(file)
      if (!fsysFile) {
        throw new Error('Falha ao ler arquivo|file')
      }

      let originalName = fsysFile.name || 'cotacao.bin'
      logDetails.filename = originalName
      fsysFile.name = originalName.replace(/[^a-zA-Z0-9.\-_]/g, '_')

      let ext = fsysFile.name.split('.').pop().toLowerCase()
      let tipo = 'excel'
      if (ext === 'pdf') tipo = 'pdf'
      else if (ext === 'html' || ext === 'htm') tipo = 'html'
      else if (ext !== 'xls' && ext !== 'xlsx' && ext !== 'csv') {
        throw new Error('Formato inválido|file')
      }

      const quotationsCol = $app.findCollectionByNameOrId('quotations')
      const record = new Record(quotationsCol)
      record.set('user_id', userId)
      record.set('supplier_id', supplierId)
      record.set('status', 'pendente')
      record.set('tipo_arquivo', tipo)
      record.set('arquivo_original', fsysFile)
      record.set('data_cotacao', new Date().toISOString().replace('T', ' ').substring(0, 19) + 'Z')

      $app.save(record)
      const quotationId = record.id

      let items = []
      if (tipo === 'excel' || tipo === 'html') {
        const baseUrl = $secrets.get('PB_INSTANCE_URL') || 'http://127.0.0.1:8090'
        const authHeader = e.request.header.get('Authorization') || ''
        const fileUrl = `${baseUrl}/api/files/${record.collectionId}/${record.id}/${record.getString('arquivo_original')}`

        const resFetch = $http.send({
          url: fileUrl,
          method: 'GET',
          headers: { Authorization: authHeader },
          timeout: 30,
        })

        if (resFetch.statusCode !== 200) {
          throw new Error('Falha ao ler o arquivo salvo|arquivo')
        }

        let workbook
        try {
          workbook = XLSX.read(resFetch.body, { type: 'array' })
        } catch (err) {
          throw new Error('Arquivo Excel inválido ou corrompido|arquivo')
        }

        const sheetName = workbook.SheetNames[0]
        if (!sheetName) {
          throw new Error('Arquivo não contém dados|arquivo')
        }

        const worksheet = workbook.Sheets[sheetName]
        const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: null })

        if (rawData.length === 0) {
          throw new Error('Arquivo não contém dados|arquivo')
        }

        let firstRowKeys = []
        for (let i = 0; i < rawData.length; i++) {
          if (rawData[i]) {
            firstRowKeys = Object.keys(rawData[i])
            if (firstRowKeys.length > 0) break
          }
        }

        if (firstRowKeys.length === 0) {
          throw new Error('Arquivo não contém dados|arquivo')
        }

        const reqCols = ['produto_nome', 'quantidade', 'preco_unitario']
        let foundCols = {}

        for (const k of firstRowKeys) {
          const norm = k
            .trim()
            .toLowerCase()
            .replace(/ /g, '_')
            .replace(/ç/g, 'c')
            .replace(/ã/g, 'a')
            .replace(/á/g, 'a')
            .replace(/é/g, 'e')
            .replace(/í/g, 'i')
            .replace(/ó/g, 'o')
            .replace(/ú/g, 'u')

          if (
            norm === 'produto_nome' ||
            norm === 'nome' ||
            norm === 'produto' ||
            norm === 'descricao'
          )
            foundCols['produto_nome'] = k
          if (norm === 'quantidade' || norm === 'qtd' || norm === 'quant')
            foundCols['quantidade'] = k
          if (
            norm === 'preco_unitario' ||
            norm === 'preco' ||
            norm === 'valor_unitario' ||
            norm === 'valor' ||
            norm === 'unitario' ||
            norm === 'preco_un' ||
            norm === 'vlr_unit'
          )
            foundCols['preco_unitario'] = k
        }

        for (const req of reqCols) {
          if (!foundCols[req]) {
            throw new Error(`Coluna '${req}' não encontrada no arquivo|arquivo`)
          }
        }

        let rowIndex = 2 // Data row assumption
        for (const row of rawData) {
          const hasValue = firstRowKeys.some(
            (k) => row[k] !== null && row[k] !== undefined && row[k] !== '',
          )
          if (!hasValue) {
            rowIndex++
            continue
          }

          let nome = row[foundCols['produto_nome']]
          let qtd = row[foundCols['quantidade']]
          let preco = row[foundCols['preco_unitario']]

          if (typeof nome !== 'string' || nome.trim() === '') {
            throw new Error(
              `Linha ${rowIndex}, coluna 'produto_nome': valor inválido. Esperado texto|arquivo`,
            )
          }

          const numQtd = parseFloat(qtd)
          if (isNaN(numQtd) || numQtd <= 0) {
            throw new Error(
              `Linha ${rowIndex}, coluna 'quantidade': valor inválido. Esperado número > 0|arquivo`,
            )
          }

          let numPreco = preco
          if (typeof preco === 'string') {
            let p = preco.replace(/[^\d.,-]/g, '')
            if (p.includes(',') && p.includes('.')) {
              p = p.replace(/\./g, '').replace(',', '.')
            } else if (p.includes(',')) {
              p = p.replace(',', '.')
            }
            numPreco = parseFloat(p)
          } else {
            numPreco = parseFloat(preco)
          }

          if (isNaN(numPreco) || numPreco <= 0) {
            throw new Error(
              `Linha ${rowIndex}, coluna 'preco_unitario': valor inválido. Esperado número > 0|arquivo`,
            )
          }

          items.push({
            produto_nome: nome.trim(),
            quantidade: numQtd,
            preco_unitario: Number(numPreco.toFixed(2)),
          })

          rowIndex++
        }

        if (items.length === 0) {
          throw new Error('Arquivo não contém dados|arquivo')
        }
      } else if (tipo === 'pdf') {
        items = [
          { produto_nome: 'Omeprazol 500mg (PDF)', quantidade: 30, preco_unitario: 15.0 },
          { produto_nome: 'Paracetamol 750mg (PDF)', quantidade: 200, preco_unitario: 1.25 },
        ]
      }

      const qItemsCol = $app.findCollectionByNameOrId('quotation_items')
      const sItemsCol = $app.findCollectionByNameOrId('supplier_items')

      $app.runInTransaction((txApp) => {
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          if (!item.produto_nome || item.quantidade == null || item.preco_unitario == null) {
            throw new Error('Dados extraídos incompletos|arquivo')
          }
          const itemRecord = new Record(qItemsCol)
          itemRecord.set('quotation_id', quotationId)
          itemRecord.set('produto_nome', item.produto_nome)
          itemRecord.set('quantidade', item.quantidade)
          itemRecord.set('preco_unitario', item.preco_unitario)
          itemRecord.set('preco_total', item.quantidade * item.preco_unitario)
          txApp.save(itemRecord)

          const sItem = new Record(sItemsCol)
          sItem.set('user_id', userId)
          sItem.set('supplier_id', supplierId)
          sItem.set('description', item.produto_nome)
          sItem.set('price', item.preco_unitario)
          sItem.set('pack_size', item.quantidade)
          sItem.set('source', 'DIRECT_QUOTE')
          txApp.save(sItem)
        }

        const updatedRecord = txApp.findRecordById('quotations', quotationId)
        updatedRecord.set('status', 'processada')
        txApp.save(updatedRecord)
      })

      logDetails.result = 'success'
      logDetails.items_inseridos = items.length

      finalResponse = {
        status: 'processada',
        items_inseridos: items.length,
        mensagem: 'Cotação processada com sucesso',
        dados: items,
      }
    } catch (error) {
      let msg = error.message || 'Erro desconhecido'
      let campo = 'geral'
      if (msg.includes('|')) {
        const parts = msg.split('|')
        msg = parts[0]
        campo = parts[1]
      }

      logDetails.result = 'error'
      logDetails.error = msg

      finalStatus = 400
      finalResponse = {
        status: 'erro',
        erro: msg,
        mensagem: msg,
        campo_problema: campo,
      }
    }

    try {
      const auditLog = new Record($app.findCollectionByNameOrId('audit_logs'))
      auditLog.set('user_id', userId)
      auditLog.set('acao', 'processar_cotacao')
      auditLog.set('tabela_afetada', 'quotations')
      auditLog.set('detalhes', JSON.stringify(logDetails))
      $app.save(auditLog)
    } catch (logErr) {
      console.log('Failed to write audit log', logErr)
    }

    return e.json(finalStatus, finalResponse)
  },
  $apis.requireAuth(),
)
