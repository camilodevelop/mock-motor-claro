const buildGetReferenceResponse = (isValid, amount, errorCode, errorMessage) => {
  return {
    GetReferenceInformationResponse: {
      isValidReferenceInformation: isValid,
      paymentAmount: amount !== null && amount !== undefined ? String(amount) : '',
      errorCode: errorCode || '',
      errorMessage: errorMessage || ''
    }
  };
};

const buildRegisterResponse = (isValid, errorCode, errorMessage) => {
  return {
    RegisterPaymentResponse: {
      isValidConfirmation: isValid,
      errorCode: errorCode || '',
      errorMessage: errorMessage || ''
    }
  };
};

module.exports = { buildGetReferenceResponse, buildRegisterResponse };
