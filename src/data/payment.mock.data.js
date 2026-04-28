module.exports = [
  {
    // Referencia móvil
    paymentReference: '3162276583',
    companyID: 1,
    saldo: 85000,
    // behavior overrides: 'success' or error codes as strings
    getBehavior: 'success',
    registerBehavior: 'success'
  },
    {
    // Referencia móvil
    paymentReference: '316227658',
    companyID: 1,
    saldo: 20000,
    // behavior overrides: 'success' or error codes as strings
    getBehavior: 'success',
    registerBehavior: '01'
  },
  {
    // Referencia fija hogar
    paymentReference: '1234',
    companyID: 2,
    saldo: 120000,
    getBehavior: 'success',
    registerBehavior: 'success'
  },
    {
    // Referencia fija hogar
    paymentReference: '123',
    companyID: 2,
    saldo: 120000,
    getBehavior: 'success',
    registerBehavior: '02'
  },

];
