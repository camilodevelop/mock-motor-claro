# BankPayment SOAP Mock (Claro Colombia)

Mock SOAP service exposing BankPayment operations `GetReferenceInformation` and `RegisterPayment`.

Installation

```bash
git clone <repo>
cd motor
npm install
```

Run

```bash
npm run dev    # development with nodemon
npm start      # production
```

WSDL URL

http://localhost:3000/RegisterPayment_Project/Services/Proxy_Pipelines/BankPaymentManagement_PS?wsdl

SOAP Endpoint

http://localhost:3000/RegisterPayment_Project/Services/Proxy_Pipelines/BankPaymentManagement_PS

Mock credentials

- username: `aliado_test`
- password: `claro123`
- bankCode: `013`

Mock data

- Mobile reference:
  - paymentReference: `000000000000001234567890`
  - companyID: `1`
  - saldo: `85000`
- Fixed home reference:
  - paymentReference: `000000000000000024797900`
  - companyID: `2`
  - saldo: `120000`
- Salesforce/Inspira:
  - paymentReference: `0000000000258393040070`
  - companyID: `3`
  - saldo: `56000`

Examples

GetReferenceInformation - SOAP Envelope

```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://claro.com.co/BankPayment">
  <soapenv:Header/>
  <soapenv:Body>
    <tns:GetReferenceInformationRequest>
      <username>aliado_test</username>
      <password>claro123</password>
      <bankCode>013</bankCode>
      <companyID>1</companyID>
      <paymentReference>000000000000001234567890</paymentReference>
      <receptionDate>2026-04-27T12:00:00</receptionDate>
    </tns:GetReferenceInformationRequest>
  </soapenv:Body>
</soapenv:Envelope>
```

RegisterPayment - SOAP Envelope

```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://claro.com.co/BankPayment">
  <soapenv:Header/>
  <soapenv:Body>
    <tns:RegisterPaymentRequest>
      <username>aliado_test</username>
      <password>claro123</password>
      <bankCode>013</bankCode>
      <bankPaymentID>BP123456789</bankPaymentID>
      <paymentReference>000000000000001234567890</paymentReference>
      <companyID>1</companyID>
      <invoice>INV-001</invoice>
      <paymentAccountingDate>2026-04-27</paymentAccountingDate>
      <paymentReceptionDate>2026-04-27</paymentReceptionDate>
      <paymentAmount>85000</paymentAmount>
      <paymentMethod>1</paymentMethod>
    </tns:RegisterPaymentRequest>
  </soapenv:Body>
</soapenv:Envelope>
```

curl examples

GetReferenceInformation

```bash
curl -s -X POST \
  -H "Content-Type: text/xml;charset=UTF-8" \
  --data @- \
  http://localhost:3000/RegisterPayment_Project/Services/Proxy_Pipelines/BankPaymentManagement_PS <<'SOAP'
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://claro.com.co/BankPayment">
  <soapenv:Header/>
  <soapenv:Body>
    <tns:GetReferenceInformationRequest>
      <username>aliado_test</username>
      <password>claro123</password>
      <bankCode>013</bankCode>
      <companyID>1</companyID>
      <paymentReference>000000000000001234567890</paymentReference>
      <receptionDate>2026-04-27T12:00:00</receptionDate>
    </tns:GetReferenceInformationRequest>
  </soapenv:Body>
</soapenv:Envelope>
SOAP
```

RegisterPayment

```bash
curl -s -X POST \
  -H "Content-Type: text/xml;charset=UTF-8" \
  --data @- \
  http://localhost:3000/RegisterPayment_Project/Services/Proxy_Pipelines/BankPaymentManagement_PS <<'SOAP'
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://claro.com.co/BankPayment">
  <soapenv:Header/>
  <soapenv:Body>
    <tns:RegisterPaymentRequest>
      <username>aliado_test</username>
      <password>claro123</password>
      <bankCode>013</bankCode>
      <bankPaymentID>BP123456789</bankPaymentID>
      <paymentReference>000000000000001234567890</paymentReference>
      <companyID>1</companyID>
      <invoice>INV-001</invoice>
      <paymentAccountingDate>2026-04-27</paymentAccountingDate>
      <paymentReceptionDate>2026-04-27</paymentReceptionDate>
      <paymentAmount>85000</paymentAmount>
      <paymentMethod>1</paymentMethod>
    </tns:RegisterPaymentRequest>
  </soapenv:Body>
</soapenv:Envelope>
SOAP
```

SoapUI

- Import the WSDL URL above into SoapUI and invoke the operations.

Error cases

- Autenticación incorrecta
  - Use wrong username/password/bankCode. Response `errorCode` = `03` and message `Falla en la autenticación`.
- Referencia inexistente
  - Use a paymentReference not in mock data. For GetReferenceInformation returns `errorCode` = `01`.
- Transacción duplicada
  - Call RegisterPayment twice with same `bankPaymentID` and `bankCode`. Second call returns `errorCode` = `01` and message `Transacción ya procesada`.

Supabase integration (optional)

- The mock can use a Supabase table instead of the local `src/data/payment.mock.data.js` file.
- Create a table named `payment_mock` with columns: `paymentReference` (text primary key), `companyID` (int), `saldo` (numeric), `getBehavior` (text), `registerBehavior` (text).
- Set these environment variables before running the server:

```bash
export SUPABASE_URL="https://<your-project>.supabase.co"
export SUPABASE_KEY="<your-service-key>"
npm run dev
```

- When `SUPABASE_URL` and `SUPABASE_KEY` are present the service will fetch reference rows from Supabase and respect their `getBehavior`/`registerBehavior` values.
