migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.add(
      new SelectField({
        name: 'role',
        values: ['admin', 'gerente_compras', 'farmaceutico'],
        maxSelect: 1,
      }),
    )
    users.fields.add(
      new BoolField({
        name: 'ativo',
      }),
    )
    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.removeByName('role')
    users.fields.removeByName('ativo')
    app.save(users)
  },
)
