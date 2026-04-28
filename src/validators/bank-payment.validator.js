const VALID_USERNAME = 'aliado_test';
const VALID_PASSWORD = 'claro123';
const VALID_BANKCODE = '013';
const ALLOWED_COMPANY_IDS = [1, 2, 3];
const ALLOWED_PAYMENT_METHODS = [1, 2, 3, 7, 8, '1', '2', '3', '7', '8', 'PSE', 'EFECTY', 'BALOTO', 'DAVIVIENDA', 'BANCOLOMBIA'];

const validateAuth = ({ username, password, bankCode }) => {
  if (username !== VALID_USERNAME || password !== VALID_PASSWORD || bankCode !== VALID_BANKCODE) {
    return { ok: false };
  }
  return { ok: true };
};

const isValidCompanyID = (companyID) => {
  const id = Number(companyID);
  return ALLOWED_COMPANY_IDS.includes(id);
};

const isValidReferenceLength = (paymentReference) => {
  // Accept any non-empty string reference (no 24-char restriction)
  return typeof paymentReference === 'string' && paymentReference.trim().length > 0;
};

const isValidBankPaymentID = (bankPaymentID) => {
  return typeof bankPaymentID === 'string' && bankPaymentID.length <= 50;
};

const isNumeric = (val) => {
  if (val === null || val === undefined) return false;
  return !isNaN(Number(String(val)));
};

const isAllowedPaymentMethod = (method) => {
  const m = Number(method);
  if (!isNaN(m)) return ALLOWED_PAYMENT_METHODS.includes(m);
  return ALLOWED_PAYMENT_METHODS.includes(String(method).toUpperCase());
};

module.exports = {
  validateAuth,
  isValidCompanyID,
  isValidReferenceLength,
  isValidBankPaymentID,
  isNumeric,
  isAllowedPaymentMethod
};
