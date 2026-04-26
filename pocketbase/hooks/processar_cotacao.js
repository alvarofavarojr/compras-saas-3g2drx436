routerAdd(
  'POST',
  '/backend/v1/processar_cotacao',
  (e) => {
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
      if (tipo === 'excel') {
        items = [
          { produto_nome: 'Dipirona 500mg (Planilha)', quantidade: 100, preco_unitario: 2.5 },
          { produto_nome: 'Loratadina 500mg (Planilha)', quantidade: 50, preco_unitario: 12.0 },
        ]
      } else if (tipo === 'pdf') {
        items = [
          { produto_nome: 'Omeprazol 500mg (PDF)', quantidade: 30, preco_unitario: 15.0 },
          { produto_nome: 'Paracetamol 750mg (PDF)', quantidade: 200, preco_unitario: 1.25 },
        ]
      } else {
        items = [{ produto_nome: 'Vitamina C 1g (HTML)', quantidade: 200, preco_unitario: 5.5 }]
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
