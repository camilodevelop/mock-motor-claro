const http = require('http');

const ENDPOINT = 'http://localhost:3000/RegisterPayment_Project/Services/Proxy_Pipelines/BankPaymentManagement_PS';

function soap(body) {
  return new Promise((resolve, reject) => {
    const envelope = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://claro.com.co/BankPayment"><soapenv:Header/><soapenv:Body>${body}</soapenv:Body></soapenv:Envelope>`;
    const url = new URL(ENDPOINT);
    const req = http.request({ hostname: url.hostname, port: url.port, path: url.pathname, method: 'POST', headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'Content-Length': Buffer.byteLength(envelope) } }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.write(envelope);
    req.end();
  });
}

function extract(xml, tag) {
  const m = xml.match(new RegExp(`<[^>]*${tag}[^>]*>([^<]*)<`));
  return m ? m[1] : '—';
}

async function run() {
  // Mock list
  const list = await new Promise((resolve) => {
    http.get('http://localhost:3000/__mock/list', (res) => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
    });
  });
  console.log('=== MOCK LIST (Supabase) ===');
  JSON.parse(list).forEach(r => console.log(` ref=${r.paymentReference} | companyID=${r.companyID} | saldo=${r.saldo} | get=${r.getBehavior} | reg=${r.registerBehavior}`));

  const tests = [
    { label: 'GetRef ref=3162276583 companyID=1 → saldo 85000',    op: 'GetReferenceInformation', body: `<tns:GetReferenceInformationRequest><username>aliado_test</username><password>claro123</password><bankCode>013</bankCode><companyID>1</companyID><paymentReference>3162276583</paymentReference><receptionDate>2026-04-27T12:00:00</receptionDate></tns:GetReferenceInformationRequest>`, tags: ['isValidReferenceInformation','paymentAmount','errorCode','errorMessage'] },
    { label: 'GetRef ref=316227658 companyID=1 → saldo 20000',     op: 'GetReferenceInformation', body: `<tns:GetReferenceInformationRequest><username>aliado_test</username><password>claro123</password><bankCode>013</bankCode><companyID>1</companyID><paymentReference>316227658</paymentReference><receptionDate>2026-04-27T12:00:00</receptionDate></tns:GetReferenceInformationRequest>`, tags: ['isValidReferenceInformation','paymentAmount','errorCode','errorMessage'] },
    { label: 'GetRef ref=1234 companyID=2 → saldo 120000',         op: 'GetReferenceInformation', body: `<tns:GetReferenceInformationRequest><username>aliado_test</username><password>claro123</password><bankCode>013</bankCode><companyID>2</companyID><paymentReference>1234</paymentReference><receptionDate>2026-04-27T12:00:00</receptionDate></tns:GetReferenceInformationRequest>`, tags: ['isValidReferenceInformation','paymentAmount','errorCode','errorMessage'] },
    { label: 'GetRef ref=123 companyID=2 → saldo 120000',          op: 'GetReferenceInformation', body: `<tns:GetReferenceInformationRequest><username>aliado_test</username><password>claro123</password><bankCode>013</bankCode><companyID>2</companyID><paymentReference>123</paymentReference><receptionDate>2026-04-27T12:00:00</receptionDate></tns:GetReferenceInformationRequest>`, tags: ['isValidReferenceInformation','paymentAmount','errorCode','errorMessage'] },
    { label: 'GetRef ref=INEXISTENTE → error 01',                  op: 'GetReferenceInformation', body: `<tns:GetReferenceInformationRequest><username>aliado_test</username><password>claro123</password><bankCode>013</bankCode><companyID>1</companyID><paymentReference>INEXISTENTE</paymentReference><receptionDate>2026-04-27T12:00:00</receptionDate></tns:GetReferenceInformationRequest>`, tags: ['isValidReferenceInformation','errorCode','errorMessage'] },
    { label: 'RegPay ref=1111 companyID=1 → success',             op: 'RegisterPayment',         body: `<tns:RegisterPaymentRequest><username>aliado_test</username><password>claro123</password><bankCode>013</bankCode><companyID>1</companyID><paymentReference>1111</paymentReference><bankPaymentID>PAY-004</bankPaymentID><paymentDate>2026-04-27T12:00:00</paymentDate><paymentAmount>30000</paymentAmount><paymentMethod>PSE</paymentMethod></tns:RegisterPaymentRequest>`, tags: ['isValidConfirmation','errorCode','errorMessage'] },
    { label: 'RegPay ref=3162276583 → success',                    op: 'RegisterPayment',         body: `<tns:RegisterPaymentRequest><username>aliado_test</username><password>claro123</password><bankCode>013</bankCode><companyID>1</companyID><paymentReference>3162276583</paymentReference><bankPaymentID>PAY-001</bankPaymentID><paymentDate>2026-04-27T12:00:00</paymentDate><paymentAmount>85000</paymentAmount><paymentMethod>PSE</paymentMethod></tns:RegisterPaymentRequest>`, tags: ['isValidConfirmation','errorCode','errorMessage'] },
    { label: 'RegPay ref=316227658 → registerbehavior=01',         op: 'RegisterPayment',         body: `<tns:RegisterPaymentRequest><username>aliado_test</username><password>claro123</password><bankCode>013</bankCode><companyID>1</companyID><paymentReference>316227658</paymentReference><bankPaymentID>PAY-002</bankPaymentID><paymentDate>2026-04-27T12:00:00</paymentDate><paymentAmount>20000</paymentAmount><paymentMethod>PSE</paymentMethod></tns:RegisterPaymentRequest>`, tags: ['isValidConfirmation','errorCode','errorMessage'] },
    { label: 'RegPay ref=123 companyID=2 → registerbehavior=02',   op: 'RegisterPayment',         body: `<tns:RegisterPaymentRequest><username>aliado_test</username><password>claro123</password><bankCode>013</bankCode><companyID>2</companyID><paymentReference>123</paymentReference><bankPaymentID>PAY-003</bankPaymentID><paymentDate>2026-04-27T12:00:00</paymentDate><paymentAmount>120000</paymentAmount><paymentMethod>PSE</paymentMethod></tns:RegisterPaymentRequest>`, tags: ['isValidConfirmation','errorCode','errorMessage'] },
    { label: 'RegPay auth inválida → error 99',                    op: 'RegisterPayment',         body: `<tns:RegisterPaymentRequest><username>aliado_test</username><password>WRONGPASS</password><bankCode>013</bankCode><companyID>1</companyID><paymentReference>3162276583</paymentReference><bankPaymentID>PAY-X</bankPaymentID><paymentDate>2026-04-27T12:00:00</paymentDate><paymentAmount>85000</paymentAmount><paymentMethod>PSE</paymentMethod></tns:RegisterPaymentRequest>`, tags: ['isValidConfirmation','errorCode','errorMessage'] },
  ];

  console.log('\n=== PRUEBAS SOAP ===');
  for (const t of tests) {
    const xml = await soap(t.body);
    const result = t.tags.map(tag => `${tag}=${extract(xml, tag)}`).join(' | ');
    console.log(`\n[${t.label}]\n  → ${result}`);
  }
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
