require('./env');

const User = require('./utils/user');

const clientUser1 = User.fromString(process.env.CLIENT_USER1);
const clientSSOUser1 = User.fromString(process.env.CLIENT_SSO_USER1);
const language = process.env.LANGUAGE;
const pstnNumber = process.env.PSTN_NUMBER;
const terpUser1 = User.fromString(process.env.TERP_USER1);
const terpUser2 = User.fromString(process.env.TERP_USER2);
const terpUser3 = User.fromString(process.env.TERP_USER3);
const terpUser4 = User.fromString(process.env.TERP_USER4);
const terpUser5 = User.fromString(process.env.TERP_USER5);
const terpUser6 = User.fromString(process.env.TERP_USER6);
const toPhoneNumber = process.env.TO_PHONE_NUMBER;
const fromPhoneNumber = process.env.FROM_PHONE_NUMBER;
const twilioSid = process.env.TWILIO_SID;
const twilioToken = process.env.TWILIO_TOKEN;
const url = process.env.URL;
const timeout = process.env.TIMEOUT;
const delay = process.env.DELAY;
const csrUser1 = User.fromString(process.env.CSR_USER1);
const csrUser2 = User.fromString(process.env.CSR_USER2);
const contUser1 = User.fromString(process.env.CONT_TERP1);
const csrToPhoneNumber = process.env.CSR_TO_PHONE_NUMBER;
const contLanguage = process.env.CONT_LANGUAGE;
const rtrUser = User.fromString(process.env.RTR_USER);
const csrGenericPhoneNumber = process.env.CSR_GENERIC_PHONE_NUMBER;
const enterprise = process.env.ENTERPRISE;
const clientId = process.env.CLIENT_ID;
const testEmailId = User.fromString(process.env.TEST_EMAIL_ID);
const qmUrl = process.env.QM_URL;
const qmUser1 = User.fromString(process.env.QM_USER1);
const loUser = User.fromString(process.env.LO_USER);

module.exports = {
  clientUser1,
  clientSSOUser1,
  fromPhoneNumber,
  language,
  pstnNumber,
  terpUser1,
  terpUser2,
  terpUser3,
  terpUser4, 
  terpUser5,
  terpUser6,
  toPhoneNumber,
  twilioSid,
  twilioToken,
  url,
  timeout,
  delay,
  csrUser1,
  csrUser2,
  contUser1,
  csrToPhoneNumber,
  contLanguage,
  rtrUser,
  csrGenericPhoneNumber,
  enterprise,
  clientId,
  testEmailId,
  qmUrl,
  qmUser1,
  loUser,
};

