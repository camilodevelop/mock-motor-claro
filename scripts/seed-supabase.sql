-- seed-supabase.sql
-- Ejecutar en: Supabase → SQL Editor
-- Inserta 2 registros por cada escenario posible de GetReferenceInformation y RegisterPayment.
-- Usa UPSERT para no fallar si ya existen.

INSERT INTO public.payment_mock (paymentreference, companyid, saldo, getbehavior, registerbehavior)
VALUES
  -- ── GetReferenceInformation: exitoso ──────────────────────────────────────
  -- Consultar con companyID=1 → isValid=true + saldo
  ('GET-OK-001', 1,  55000, 'success', 'success'),
  ('GET-OK-002', 1,  72000, 'success', 'success'),

  -- ── GetReferenceInformation: error 01 – Factura no disponible ─────────────
  -- getbehavior='01' fuerza errorCode=01 sin importar el companyID
  ('GET-01-001', 1,      0, '01',      'success'),
  ('GET-01-002', 1,      0, '01',      'success'),

  -- ── GetReferenceInformation: error 02 – Error interno ────────────────────
  ('GET-02-001', 1,      0, '02',      'success'),
  ('GET-02-002', 1,      0, '02',      'success'),

  -- ── GetReferenceInformation: error 04 – companyID no coincide ────────────
  -- La BD tiene companyID=2 → consultar con companyID=1 dispara errorCode=04
  ('GET-04-001', 2,  48000, 'success', 'success'),
  ('GET-04-002', 2,  63000, 'success', 'success'),

  -- ── RegisterPayment: exitoso ──────────────────────────────────────────────
  ('REG-OK-001', 1,  90000, 'success', 'success'),
  ('REG-OK-002', 1, 115000, 'success', 'success'),

  -- ── RegisterPayment: error 01 – Transacción ya procesada ─────────────────
  ('REG-01-001', 1,  30000, 'success', '01'),
  ('REG-01-002', 1,  45000, 'success', '01'),

  -- ── RegisterPayment: error 02 – Error interno ────────────────────────────
  ('REG-02-001', 1,  60000, 'success', '02'),
  ('REG-02-002', 1,  80000, 'success', '02'),

  -- ── RegisterPayment: error 05 – Información no válida ────────────────────
  ('REG-05-001', 1,  25000, 'success', '05'),
  ('REG-05-002', 1,  35000, 'success', '05')

ON CONFLICT (paymentreference) DO UPDATE SET
  companyid        = EXCLUDED.companyid,
  saldo            = EXCLUDED.saldo,
  getbehavior      = EXCLUDED.getbehavior,
  registerbehavior = EXCLUDED.registerbehavior;

-- Verificar resultado
SELECT paymentreference, companyid, saldo, getbehavior, registerbehavior
FROM public.payment_mock
WHERE paymentreference LIKE 'GET-%' OR paymentreference LIKE 'REG-%'
ORDER BY paymentreference;
