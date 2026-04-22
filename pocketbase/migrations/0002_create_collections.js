migrate(
  (app) => {
    const usersId = '_pb_users_auth_'

    const suppliers = new Collection({
      name: 'suppliers',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: usersId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'nome', type: 'text', required: true },
        { name: 'email', type: 'email' },
        { name: 'telefone', type: 'text' },
        { name: 'endereco', type: 'text' },
        { name: 'ativo', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(suppliers)

    const products = new Collection({
      name: 'products',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: usersId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'nome', type: 'text', required: true },
        { name: 'descricao', type: 'text' },
        { name: 'sku', type: 'text' },
        { name: 'unidade', type: 'text' },
        { name: 'preco_referencia', type: 'number' },
        { name: 'ativo', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(products)

    const quotations = new Collection({
      name: 'quotations',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: usersId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'supplier_id', type: 'relation', collectionId: suppliers.id, maxSelect: 1 },
        {
          name: 'arquivo_original',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'application/pdf',
            'text/html',
          ],
        },
        { name: 'tipo_arquivo', type: 'select', values: ['excel', 'pdf', 'html'], maxSelect: 1 },
        { name: 'data_cotacao', type: 'date' },
        {
          name: 'status',
          type: 'select',
          values: ['pendente', 'processada', 'erro'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(quotations)

    const quotation_items = new Collection({
      name: 'quotation_items',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'quotation_id',
          type: 'relation',
          required: true,
          collectionId: quotations.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'produto_nome', type: 'text', required: true },
        { name: 'quantidade', type: 'number' },
        { name: 'preco_unitario', type: 'number' },
        { name: 'preco_total', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(quotation_items)

    const purchase_orders = new Collection({
      name: 'purchase_orders',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: usersId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'numero_po', type: 'text', required: true },
        { name: 'data_emissao', type: 'date' },
        { name: 'supplier_id', type: 'relation', collectionId: suppliers.id, maxSelect: 1 },
        {
          name: 'status',
          type: 'select',
          values: ['rascunho', 'enviado', 'respondido', 'finalizado'],
          maxSelect: 1,
        },
        { name: 'total', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(purchase_orders)

    const audit_logs = new Collection({
      name: 'audit_logs',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: '',
      deleteRule: '',
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: usersId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'acao', type: 'text', required: true },
        { name: 'tabela_afetada', type: 'text' },
        { name: 'registro_id', type: 'text' },
        { name: 'detalhes', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(audit_logs)

    const erp_needs = new Collection({
      name: 'erp_needs',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: usersId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'description', type: 'text', required: true },
        { name: 'min_stock', type: 'number' },
        { name: 'max_stock', type: 'number' },
        { name: 'required_quantity', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(erp_needs)

    const supplier_items = new Collection({
      name: 'supplier_items',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: usersId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'supplier_id', type: 'relation', collectionId: suppliers.id, maxSelect: 1 },
        { name: 'description', type: 'text', required: true },
        { name: 'price', type: 'number' },
        { name: 'pack_size', type: 'number' },
        { name: 'source', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(supplier_items)

    const matched_needs = new Collection({
      name: 'matched_needs',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: usersId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'erp_id',
          type: 'relation',
          required: true,
          collectionId: erp_needs.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'matches_json', type: 'json' },
        {
          name: 'selected_item_id',
          type: 'relation',
          collectionId: supplier_items.id,
          maxSelect: 1,
        },
        { name: 'suggested_quantity', type: 'number' },
        { name: 'confirmed', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_matched_needs_erp ON matched_needs (erp_id)'],
    })
    app.save(matched_needs)

    const selic_rates = new Collection({
      name: 'selic_rates',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: usersId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'rate', type: 'number', required: true },
        { name: 'valid_from', type: 'date', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(selic_rates)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('selic_rates'))
    app.delete(app.findCollectionByNameOrId('matched_needs'))
    app.delete(app.findCollectionByNameOrId('supplier_items'))
    app.delete(app.findCollectionByNameOrId('erp_needs'))
    app.delete(app.findCollectionByNameOrId('audit_logs'))
    app.delete(app.findCollectionByNameOrId('purchase_orders'))
    app.delete(app.findCollectionByNameOrId('quotation_items'))
    app.delete(app.findCollectionByNameOrId('quotations'))
    app.delete(app.findCollectionByNameOrId('products'))
    app.delete(app.findCollectionByNameOrId('suppliers'))
  },
)
