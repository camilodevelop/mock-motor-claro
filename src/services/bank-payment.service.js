const validators = require('../validators/bank-payment.validator');
const builders = require('../builders/soap-response.builder');
const mockData = require('../data/payment.mock.data');
const supabaseService = require('./supabase.service');

// In-memory store for processed payments: key = bankCode|bankPaymentID
const processedPayments = new Set();

const getReferenceInformation = async (args) => {
  try {
    const {
      username,
      password,
      bankCode,
      companyID,
      paymentReference,
      receptionDate
    } = args;

    // Auth
    const auth = validators.validateAuth({ username, password, bankCode });
    if (!auth.ok) return builders.buildGetReferenceResponse(false, null, '03', 'Falla en la autenticación');

    // Basic validations
    if (!validators.isValidCompanyID(companyID)) return builders.buildGetReferenceResponse(false, null, '04', 'Información no válida: companyID');
    if (!paymentReference) return builders.buildGetReferenceResponse(false, null, '04', 'Información no válida: paymentReference obligatorio');

    // Find reference (prefer Supabase table if configured)
    let ref = null;
    if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
      ref = await supabaseService.findReference(paymentReference);
    }
    if (!ref) {
      ref = mockData.find(r => r.paymentReference === paymentReference);
    }
    if (!ref) return builders.buildGetReferenceResponse(false, null, '01', 'Factura no disponible');
    // If mock behavior forces an outcome, return it
    if (ref.getBehavior && ref.getBehavior !== 'success') {
      switch (String(ref.getBehavior)) {
        case '01':
          return builders.buildGetReferenceResponse(false, null, '01', 'Factura no disponible');
        case '02':
          return builders.buildGetReferenceResponse(false, null, '02', 'Error interno');
        case '03':
          return builders.buildGetReferenceResponse(false, null, '03', 'Falla en la autenticación');
        case '04':
          return builders.buildGetReferenceResponse(false, null, '04', 'Información no válida');
        default:
          break;
      }
    }

    if (Number(ref.companyID) !== Number(companyID)) return builders.buildGetReferenceResponse(false, null, '04', 'Información no válida: companyID no coincide con la referencia');

    // Success
    return builders.buildGetReferenceResponse(true, ref.saldo, '', '');
  } catch (err) {
    console.error('getReferenceInformation internal error', err);
    return builders.buildGetReferenceResponse(false, null, '02', 'Error interno');
  }
};

const registerPayment = async (args) => {
  try {
    const {
      username,
      password,
      bankCode,
      bankPaymentID,
      barCode,
      paymentReference,
      companyID,
      invoice,
      paymentAccountingDate,
      paymentReceptionDate,
      paymentAmount,
      paymentMethod
    } = args;

    // Auth
    const auth = validators.validateAuth({ username, password, bankCode });
    if (!auth.ok) return builders.buildRegisterResponse(false, '03', 'Falla en la autenticación');

    // bankPaymentID validations
    if (!bankPaymentID) return builders.buildRegisterResponse(false, '05', 'Información no válida: bankPaymentID obligatorio');
    if (!validators.isValidBankPaymentID(bankPaymentID)) return builders.buildRegisterResponse(false, '05', 'Información no válida: bankPaymentID > 50 caracteres');

    // uniqueness
    const key = `${bankCode}|${bankPaymentID}`;
    if (processedPayments.has(key)) return builders.buildRegisterResponse(false, '01', 'Transacción ya procesada');

    // Either barCode or paymentReference
    if ((barCode && paymentReference) || (!barCode && !paymentReference)) return builders.buildRegisterResponse(false, '05', 'Información no válida: enviar solo uno de barCode o paymentReference');

    // companyID
    if (!validators.isValidCompanyID(companyID)) return builders.buildRegisterResponse(false, '05', 'Información no válida: companyID');

    // If paymentReference provided, validate it exists and companyID matches
    if (paymentReference) {
      // No length restriction for paymentReference — validator accepts any non-empty string
      let ref = null;
      if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
        ref = await supabaseService.findReference(paymentReference);
      }
      if (!ref) ref = mockData.find(r => r.paymentReference === paymentReference);
      if (!ref) return builders.buildRegisterResponse(false, '05', 'Información no válida: referencia inexistente');
      // If mock behavior forces an outcome for register, return it
      if (ref.registerBehavior && ref.registerBehavior !== 'success') {
        switch (String(ref.registerBehavior)) {
          case '01':
            return builders.buildRegisterResponse(false, '01', 'Transacción ya procesada');
          case '02':
            return builders.buildRegisterResponse(false, '02', 'Error interno');
          case '03':
            return builders.buildRegisterResponse(false, '03', 'Falla en la autenticación');
          case '05':
            return builders.buildRegisterResponse(false, '05', 'Información no válida');
          default:
            break;
        }
      }

      if (Number(ref.companyID) !== Number(companyID)) return builders.buildRegisterResponse(false, '05', 'Información no válida: companyID no coincide con la referencia');
    }

    // paymentAmount numeric
    if (!validators.isNumeric(paymentAmount)) return builders.buildRegisterResponse(false, '05', 'Información no válida: paymentAmount debe ser numérico');

    // paymentMethod allowed
    if (!validators.isAllowedPaymentMethod(paymentMethod)) return builders.buildRegisterResponse(false, '05', 'Información no válida: paymentMethod inválido');

    // All good: mark as processed
    processedPayments.add(key);

    return builders.buildRegisterResponse(true, '', '');
  } catch (err) {
    console.error('registerPayment internal error', err);
    return builders.buildRegisterResponse(false, '02', 'Error interno');
  }
};

module.exports = { getReferenceInformation, registerPayment, _internal: { processedPayments } };
