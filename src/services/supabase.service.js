const { createClient } = require('@supabase/supabase-js');

let supabase = null;
const init = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) return null;
  if (!supabase) supabase = createClient(url, key);
  return supabase;
};

/**
 * Expected table: payment_mock
 * Columns (all lowercase in Supabase): paymentreference (text, PK), companyid (int), saldo (numeric), getbehavior (text), registerbehavior (text)
 */
const normalizeRow = (row) => {
  if (!row) return null;
  return {
    paymentReference: row.paymentreference ?? row.paymentReference,
    companyID:        row.companyid        ?? row.companyID,
    saldo:            row.saldo,
    getBehavior:      row.getbehavior      ?? row.getBehavior      ?? 'success',
    registerBehavior: row.registerbehavior ?? row.registerBehavior ?? 'success',
  };
};

const findReference = async (paymentReference) => {
  const client = init();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from('payment_mock')
      .select('*')
      .eq('paymentreference', paymentReference)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return normalizeRow(data);
  } catch (err) {
    console.error('supabase findReference error', err.message || err);
    return null;
  }
};

const listAll = async () => {
  const client = init();
  if (!client) return null;
  try {
    const { data, error } = await client.from('payment_mock').select('*');
    if (error) throw error;
    return (data || []).map(normalizeRow);
  } catch (err) {
    console.error('supabase listAll error', err.message || err);
    return null;
  }
};

module.exports = { init, findReference, listAll };
