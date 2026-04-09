DO $BODY$
DECLARE
  v_user_id uuid;
BEGIN
  -- Seed user 1 (idempotent: skip if email already exists)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'alvaro@farmaciarhamus.com.br') THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'alvaro@farmaciarhamus.com.br',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Alvaro"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'alvaro@farmaciarhamus.com.br' LIMIT 1;
  END IF;

  -- Seed Suppliers
  INSERT INTO public.suppliers (id, user_id, name, created_at) VALUES
    ('SUP-001', v_user_id, 'Distribuidora Central', NOW()),
    ('SUP-002', v_user_id, 'Farma Atacado', NOW())
  ON CONFLICT (id) DO NOTHING;

  -- Seed ERP Needs
  INSERT INTO public.erp_needs (id, user_id, description, min_stock, max_stock, required_quantity, created_at) VALUES
    ('ERP-001', v_user_id, 'Paracetamol 500mg - Cx 20', 10, 50, 25, NOW()),
    ('ERP-002', v_user_id, 'Ibuprofeno 400mg - Cx 10', 5, 30, 15, NOW())
  ON CONFLICT (id) DO NOTHING;

  -- Seed Supplier Items
  INSERT INTO public.supplier_items (id, user_id, supplier_id, description, price, pack_size, source, created_at) VALUES
    ('ITEM-001', v_user_id, 'SUP-001', 'Paracetamol 500mg Caixa c/ 20', 12.50, 1, 'Manual', NOW()),
    ('ITEM-002', v_user_id, 'SUP-002', 'Paracetamol Generico 500mg', 11.00, 1, 'Manual', NOW()),
    ('ITEM-003', v_user_id, 'SUP-001', 'Ibuprofeno 400mg Cx 10', 8.90, 1, 'Manual', NOW())
  ON CONFLICT (id) DO NOTHING;

  -- Seed Matched Needs
  INSERT INTO public.matched_needs (erp_id, user_id, matches_json, selected_item_id, suggested_quantity, confirmed, created_at) VALUES
    ('ERP-001', v_user_id, '[{"item_id": "ITEM-001", "score": 0.95}, {"item_id": "ITEM-002", "score": 0.88}]'::jsonb, 'ITEM-001', 25, true, NOW()),
    ('ERP-002', v_user_id, '[{"item_id": "ITEM-003", "score": 0.99}]'::jsonb, 'ITEM-003', 15, false, NOW())
  ON CONFLICT (erp_id) DO NOTHING;

END $BODY$;
