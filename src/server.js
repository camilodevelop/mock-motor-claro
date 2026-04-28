require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const soap = require('soap');
const service = require('./soap/bank-payment.soap.service');

const app = express();

// JSON body parser for mock config endpoints
app.use(express.json());

// expose mock data management endpoints
const mockData = require('./data/payment.mock.data');
const supabaseService = require('./services/supabase.service');

app.get('/__mock/list', async (req, res) => {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
    const rows = await supabaseService.listAll();
    if (rows === null) return res.status(500).json({ error: 'supabase error' });
    return res.json(rows);
  }
  return res.json(mockData);
});

app.post('/__mock/config', (req, res) => {
  const { paymentReference, getBehavior, registerBehavior } = req.body || {};
  if (!paymentReference) return res.status(400).json({ error: 'paymentReference required' });
  const idx = mockData.findIndex(r => r.paymentReference === paymentReference);
  if (idx === -1) return res.status(404).json({ error: 'reference not found' });
  if (getBehavior !== undefined) mockData[idx].getBehavior = getBehavior;
  if (registerBehavior !== undefined) mockData[idx].registerBehavior = registerBehavior;
  return res.json({ ok: true, item: mockData[idx] });
});

// Read WSDL
const wsdlPath = path.join(__dirname, 'soap', 'bank-payment.wsdl.xml');
const wsdlXml = fs.readFileSync(wsdlPath, 'utf8');

const endpoint = '/RegisterPayment_Project/Services/Proxy_Pipelines/BankPaymentManagement_PS';

// Parse raw body for SOAP
app.use(express.raw({ type: '*/*', limit: '10mb' }));

// Serve static example UI
app.use(express.static(path.join(__dirname, '..', 'public')));

const port = process.env.PORT || 3000;

// Reemplazar __SERVICE_URL__ con la URL pública real (o localhost en dev)
const publicHost = process.env.PUBLIC_URL
  ? process.env.PUBLIC_URL.replace(/\/$/, '')
  : `http://localhost:${port}`;
const resolvedWsdl = wsdlXml.replace('__SERVICE_URL__', `${publicHost}${endpoint}`);

// Initialize SOAP listener
soap.listen(app, endpoint, service.soapServiceObject, resolvedWsdl);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
  console.log(`WSDL available at ${publicHost}${endpoint}?wsdl`);
});
