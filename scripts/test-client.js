const soap = require('soap');

const wsdl = 'http://localhost:3000/RegisterPayment_Project/Services/Proxy_Pipelines/BankPaymentManagement_PS?wsdl';

async function run() {
  try {
    const client = await soap.createClientAsync(wsdl);
    console.log('SOAP client created');

    // GetReferenceInformation
    const getArgs = {
      username: 'aliado_test',
      password: 'claro123',
      bankCode: '013',
      companyID: 1,
      paymentReference: '000000000000001234567890',
      receptionDate: new Date().toISOString()
    };
    const [getRes] = await client.GetReferenceInformationAsync(getArgs);
    console.log('GetReferenceInformation result:');
    console.log(JSON.stringify(getRes, null, 2));

    // RegisterPayment
    const regArgs = {
      username: 'aliado_test',
      password: 'claro123',
      bankCode: '013',
      bankPaymentID: 'BP-TEST-001',
      paymentReference: '000000000000001234567890',
      companyID: 1,
      invoice: 'INV-TEST-001',
      paymentAccountingDate: new Date().toISOString(),
      paymentReceptionDate: new Date().toISOString(),
      paymentAmount: 85000,
      paymentMethod: 1
    };
    const [regRes] = await client.RegisterPaymentAsync(regArgs);
    console.log('RegisterPayment first call result:');
    console.log(JSON.stringify(regRes, null, 2));

    // RegisterPayment duplicate
    const [regRes2] = await client.RegisterPaymentAsync(regArgs);
    console.log('RegisterPayment duplicate call result:');
    console.log(JSON.stringify(regRes2, null, 2));

  } catch (err) {
    console.error('Test client error', err);
    process.exit(1);
  }
}

run();
