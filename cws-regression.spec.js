var config = require('./config');
var htmlReport = require('./utils/htmlReporterFunctions');
var newPageWithNewContext = require('./utils/newPageWithNewContext');
var iwsPageObjects = require('./pageObjects/iwsPageObjects');
var cwsPageObjects = require('./pageObjects/cwsPageObjects');
const client = require('twilio')(config.twilioSid, config.twilioToken);

const delay = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};


describe('CWS Regression Test', () => {
  let terpPage;

  beforeEach(() => {
    jest.setTimeout(config.timeout);
  });

  beforeAll(async done => {
    terpPage = await newPageWithNewContext(browser);
    done();
  });

  // it('SV-8409: Verify "Forgot password" functionality for CWS', async () => {
  //   await page.goto(`${config.url}/cws`);
  //   await page.waitForSelector('input[name="username"]', { timeout: config.timeout }, { visible: true });
  //   await cwsPageObjects.clickOnForgotPassword(page);
  //   await cwsPageObjects.enterUsernameAndClickSubmitForgotPassword(page, config.csrUser2.username);
  //   await delay(3000);
    
  //   await expect(page).toMatch('Please check your email for a reset password link.', {
  //     timeout: config.timeout});
    
  //   await expect(page).toMatch('It could take a few minutes for it to arrive.', {
  //       timeout: config.timeout});

  //   await htmlReport.attachScreenshot(page, "Forgot Password");

  //   await cwsPageObjects.clickBackToLogin(page);

  // });

  it('SV-8403: Verify that user can login to CWS', async () => {
    await context.overridePermissions(`${config.url}/cws`, ['notifications']);
    await page.goto(`${config.url}/cws`);
    await delay(2000);
    await page.type('input[name="username"]', config.csrUser2.username);
    await page.click('button');
    await delay(2000);
    await page.type('input[name="password"]', config.csrUser2.password);
    await page.click('button');

    //await cwsPageObjects.loginToCWS(page, config.csrUser2.username, config.csrUser2.password);
    await page.waitForSelector(cwsPageObjects.amnLogo);
    await htmlReport.attachScreenshot(page, "Login Successful");

  });

  it('SV-8423: Verify that after user presented with self with, "Links" dropdown, user first and last name, username, sign out button, statuses menu, "History", "Diagnostics" and "Settings" tabs', async () => {

    await expect(page).toMatchElement('span', { text: "Links" },  { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('span', { text: config.csrUser2.username },  { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: "History" },  { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: "Diagnostics" },  { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: "Settings" },  { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Links/Tabs Displayed");

    await cwsPageObjects.clickOnUsernameDropdown(page);
    await expect(page).toMatchElement('div', { text: 'Sign Out' });
    await htmlReport.attachScreenshot(page, "Logout Displayed");
    await cwsPageObjects.clickOnUsernameDropdown(page);

    await cwsPageObjects.clickStatusDropdown(page);
    await expect(page).toMatchElement('div', { text: 'Available' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'Transfer' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'Break' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'Lunch' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'Meeting' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'Supervision' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'Tech Support' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'Training' }, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Status Displayed");
    await cwsPageObjects.clickStatusDropdown(page);

  });

  // it('SV-8424: Verify that user can click "Links"', async () => { 
    
  //   await expect(page).toClick('a', { text: 'Paycom' });
  //   await page.waitFor(3000);
  //   await htmlReport.attachScreenshot(page, "Navigated To Links");
   
  //   await page.bringToFront();
    
  // });

  it('SV-: Set CWS Available', async () => { 
    
    await cwsPageObjects.changeUserStatus(page, "Available");
    
  });

  //initiate PSTN call
  it('initiate pstn call', async () => {
    client.calls
    .create({
    url: 'http://demo.twilio.com/docs/voice.xml',
    to: config.csrGenericPhoneNumber,
    from: config.fromPhoneNumber,

    })
    .then(call => console.log(call.sid))
    .done();

    await terpPage.waitFor(3000);
    await delay(20000);
  });

  it('SV-: CWS Accept Call', async () => { 
    
    await cwsPageObjects.cwsAcceptCall(page);
    await page.waitForSelector(cwsPageObjects.seesionEndButton);
    
    await page.waitFor(20000);
  });

});
