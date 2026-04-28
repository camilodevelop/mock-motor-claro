const bankPaymentService = require('../services/bank-payment.service');

const soapServiceObject = {
  BankPaymentManagementService: {
    BankPaymentManagementPort: {
      GetReferenceInformation: async function (args, callback, headers, req) {
        console.log('Incoming GetReferenceInformation request:', JSON.stringify(args));
        try {
          const result = await bankPaymentService.getReferenceInformation(args);
          console.log('GetReferenceInformation response:', JSON.stringify(result));
          // Wrap result in the expected response element name
          return callback(null, result);
        } catch (err) {
          console.error('GetReferenceInformation error:', err);
          return callback({
            error: 'ServerError',
            message: err.message || 'Internal error'
          });
        }
      },

      RegisterPayment: async function (args, callback, headers, req) {
        console.log('Incoming RegisterPayment request:', JSON.stringify(args));
        try {
          const result = await bankPaymentService.registerPayment(args);
          console.log('RegisterPayment response:', JSON.stringify(result));
          return callback(null, result);
        } catch (err) {
          console.error('RegisterPayment error:', err);
          return callback({
            error: 'ServerError',
            message: err.message || 'Internal error'
          });
        }
      }
    }
  }
};

module.exports = { soapServiceObject };
