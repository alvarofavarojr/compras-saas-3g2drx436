migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    let adminId
    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'admin@farmacia.com.br')
      adminId = admin.id
    } catch (_) {
      const record = new Record(users)
      record.setEmail('admin@farmacia.com.br')
      record.setPassword('Skip@Pass123')
      record.setVerified(true)
      record.set('name', 'Admin Farmácia')
      record.set('role', 'admin')
      record.set('ativo', true)
      app.save(record)
      adminId = record.id
    }

    const suppliers = app.findCollectionByNameOrId('suppliers')
    const supplierData = [
      {
        nome: 'Ação Magistral',
        email: 'contato@acaomagistral.com',
        telefone: '11999999999',
        ativo: true,
      },
      {
        nome: 'Fornecedor A',
        email: 'vendas@fornecedora.com',
        telefone: '11888888888',
        ativo: true,
      },
      {
        nome: 'Fornecedor B',
        email: 'vendas@fornecedorb.com',
        telefone: '11777777777',
        ativo: true,
      },
    ]

    for (const s of supplierData) {
      try {
        app.findFirstRecordByData('suppliers', 'nome', s.nome)
      } catch (_) {
        const record = new Record(suppliers)
        record.set('user_id', adminId)
        record.set('nome', s.nome)
        record.set('email', s.email)
        record.set('telefone', s.telefone)
        record.set('ativo', s.ativo)
        app.save(record)
      }
    }

    const products = app.findCollectionByNameOrId('products')
    const productData = [
      {
        nome: 'Paracetamol 500mg',
        descricao: 'Caixa com 50',
        sku: 'PRC-500',
        unidade: 'cx',
        preco_referencia: 15.5,
        ativo: true,
      },
      {
        nome: 'Amoxicilina 500mg',
        descricao: 'Caixa com 30',
        sku: 'AMX-500',
        unidade: 'cx',
        preco_referencia: 22.0,
        ativo: true,
      },
      {
        nome: 'Ibuprofeno 400mg',
        descricao: 'Caixa com 20',
        sku: 'IBU-400',
        unidade: 'cx',
        preco_referencia: 12.3,
        ativo: true,
      },
      {
        nome: 'Dipirona 500mg',
        descricao: 'Frasco 10ml',
        sku: 'DIP-500',
        unidade: 'fr',
        preco_referencia: 5.9,
        ativo: true,
      },
      {
        nome: 'Vitamina C 1g',
        descricao: 'Tubo com 10',
        sku: 'VITC-1G',
        unidade: 'tb',
        preco_referencia: 18.9,
        ativo: true,
      },
    ]

    for (const p of productData) {
      try {
        app.findFirstRecordByData('products', 'sku', p.sku)
      } catch (_) {
        const record = new Record(products)
        record.set('user_id', adminId)
        record.set('nome', p.nome)
        record.set('descricao', p.descricao)
        record.set('sku', p.sku)
        record.set('unidade', p.unidade)
        record.set('preco_referencia', p.preco_referencia)
        record.set('ativo', p.ativo)
        app.save(record)
      }
    }
  },
  (app) => {},
)
