/**
 * seed-supabase.js
 * Inserta en la tabla payment_mock 2 registros por cada escenario posible
 * de GetReferenceInformation y RegisterPayment.
 *
 * Uso: node scripts/seed-supabase.js
 * Requiere variables SUPABASE_URL y SUPABASE_KEY (cargadas desde .env).
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY;

if (!url || !key) {
  console.error('❌  Faltan SUPABASE_URL o SUPABASE_KEY en el .env');
  process.exit(1);
}

const client = createClient(url, key);

/**
 * Escenarios cubiertos
 * ─────────────────────────────────────────────────────────────────
 * GetReferenceInformation
 *   OK       → getbehavior=success, companyID coincide  → isValid=true, saldo
 *   GET-01   → getbehavior=01                           → errorCode 01 (Factura no disponible)
 *   GET-02   → getbehavior=02                           → errorCode 02 (Error interno)
 *   GET-04   → companyID diferente en BD                → errorCode 04 (companyID no coincide)
 *
 * RegisterPayment
 *   REG-OK   → registerbehavior=success                 → isValid=true
 *   REG-01   → registerbehavior=01                      → errorCode 01 (Transacción ya procesada)
 *   REG-02   → registerbehavior=02                      → errorCode 02 (Error interno)
 *   REG-05   → registerbehavior=05                      → errorCode 05 (Información no válida)
 * ─────────────────────────────────────────────────────────────────
 * Nota: errorCode 03 (auth) y duplicado en memoria se disparan por
 * credenciales/bankPaymentID repetido, no por datos en BD.
 */
const rows = [
  // ── GET: exitoso ─────────────────────────────────────────────
  { paymentreference: 'GET-OK-001', companyid: 1, saldo: 55000,  getbehavior: 'success', registerbehavior: 'success' },
  { paymentreference: 'GET-OK-002', companyid: 1, saldo: 72000,  getbehavior: 'success', registerbehavior: 'success' },

  // ── GET: error 01 – Factura no disponible ────────────────────
  { paymentreference: 'GET-01-001', companyid: 1, saldo: 0,      getbehavior: '01',      registerbehavior: 'success' },
  { paymentreference: 'GET-01-002', companyid: 1, saldo: 0,      getbehavior: '01',      registerbehavior: 'success' },

  // ── GET: error 02 – Error interno ────────────────────────────
  { paymentreference: 'GET-02-001', companyid: 1, saldo: 0,      getbehavior: '02',      registerbehavior: 'success' },
  { paymentreference: 'GET-02-002', companyid: 1, saldo: 0,      getbehavior: '02',      registerbehavior: 'success' },

  // ── GET: error 04 – companyID no coincide ────────────────────
  // Consultar con companyID=1 disparará el error (la BD tiene companyID=2)
  { paymentreference: 'GET-04-001', companyid: 2, saldo: 48000,  getbehavior: 'success', registerbehavior: 'success' },
  { paymentreference: 'GET-04-002', companyid: 2, saldo: 63000,  getbehavior: 'success', registerbehavior: 'success' },

  // ── REG: exitoso ─────────────────────────────────────────────
  { paymentreference: 'REG-OK-001', companyid: 1, saldo: 90000,  getbehavior: 'success', registerbehavior: 'success' },
  { paymentreference: 'REG-OK-002', companyid: 1, saldo: 115000, getbehavior: 'success', registerbehavior: 'success' },

  // ── REG: error 01 – Transacción ya procesada ─────────────────
  { paymentreference: 'REG-01-001', companyid: 1, saldo: 30000,  getbehavior: 'success', registerbehavior: '01' },
  { paymentreference: 'REG-01-002', companyid: 1, saldo: 45000,  getbehavior: 'success', registerbehavior: '01' },

  // ── REG: error 02 – Error interno ────────────────────────────
  { paymentreference: 'REG-02-001', companyid: 1, saldo: 60000,  getbehavior: 'success', registerbehavior: '02' },
  { paymentreference: 'REG-02-002', companyid: 1, saldo: 80000,  getbehavior: 'success', registerbehavior: '02' },

  // ── REG: error 05 – Información no válida ────────────────────
  { paymentreference: 'REG-05-001', companyid: 1, saldo: 25000,  getbehavior: 'success', registerbehavior: '05' },
  { paymentreference: 'REG-05-002', companyid: 1, saldo: 35000,  getbehavior: 'success', registerbehavior: '05' },
];

async function seed() {
  console.log(`\n📦  Insertando ${rows.length} registros en payment_mock...\n`);

  const { data, error } = await client
    .from('payment_mock')
    .upsert(rows, { onConflict: 'paymentreference' })
    .select('paymentreference, getbehavior, registerbehavior');

  if (error) {
    console.error('❌  Error al insertar:', error.message);
    process.exit(1);
  }

  console.log('✅  Registros insertados/actualizados:\n');
  const pad = (s, n) => String(s).padEnd(n);
  console.log(`  ${pad('paymentreference', 16)} ${pad('getbehavior', 12)} registerbehavior`);
  console.log(`  ${'-'.repeat(48)}`);
  data.forEach(r => {
    console.log(`  ${pad(r.paymentreference, 16)} ${pad(r.getbehavior, 12)} ${r.registerbehavior}`);
  });

  console.log('\n📋  Guía de uso:\n');
  const guide = [
    ['GET exitoso',               'GET-OK-001 / GET-OK-002',  'companyID=1', 'isValid=true + saldo'],
    ['GET error 01 (no existe)',  'GET-01-001 / GET-01-002',  'companyID=1', 'errorCode=01'],
    ['GET error 02 (interno)',    'GET-02-001 / GET-02-002',  'companyID=1', 'errorCode=02'],
    ['GET error 04 (companyID)',  'GET-04-001 / GET-04-002',  'companyID=1', 'errorCode=04 (BD tiene companyID=2)'],
    ['REG exitoso',               'REG-OK-001 / REG-OK-002',  'companyID=1', 'isValid=true'],
    ['REG error 01 (duplicado)',  'REG-01-001 / REG-01-002',  'companyID=1', 'errorCode=01'],
    ['REG error 02 (interno)',    'REG-02-001 / REG-02-002',  'companyID=1', 'errorCode=02'],
    ['REG error 05 (inválido)',   'REG-05-001 / REG-05-002',  'companyID=1', 'errorCode=05'],
    ['GET/REG error 03 (auth)',   '(cualquier ref)',           'password=WRONG', 'errorCode=03'],
  ];
  guide.forEach(([scenario, refs, extra, result]) => {
    console.log(`  • ${scenario}`);
    console.log(`      refs: ${refs}`);
    console.log(`      ${extra} → ${result}`);
  });

  console.log('');
  process.exit(0);
}

seed();
