const config = require('./config');
var helperFuncs = require('./utils/helperFunctions');
var htmlReport = require('./utils/htmlReporterFunctions');
var awsPageObjects = require('./pageObjects/agentStationPageObjects');
const newPageWithNewContext = require('./utils/newPageWithNewContext');
const client = require('twilio')(config.twilioSid, config.twilioToken);

const delay = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

describe('PSTN Call', () => {
  let terpPage;

  beforeEach(() => {
    jest.setTimeout(config.timeout);
  });

  beforeAll(async done => {
    terpPage = await newPageWithNewContext(browser);
    done();
  });

  // login, kill any existing session, and then go available
  it('login and prep audio terp', async () => {
    await terpPage.goto(`${config.url}/iws`);
    await awsPageObjects.loginToAWS(terpPage, config.terpUser1.username, config.terpUser1.password);
    await terpPage.waitForXPath(awsPageObjects.userStatus, { timeout: config.timeout }, { visible: true });
    await helperFuncs.verifyTextXpath(terpPage,awsPageObjects.userStatus,"Unavailable");
    await awsPageObjects.changeUserStatus(terpPage, "Available");
    await helperFuncs.verifyTextXpath(terpPage,awsPageObjects.userStatus, "Available");
    await htmlReport.attachScreenshot(terpPage, "Terp Login And Available ");
  });


  //initiate PSTN call
  it('initiate pstn call', async () => {
    client.calls
    .create({
    url: 'http://demo.twilio.com/docs/voice.xml',
    to: config.toPhoneNumber,
    from: config.fromPhoneNumber,

    })
    .then(call => console.log(call.sid))
    .done();
  });

  it('terp receives inbound PSTN call and answers', async () => {
    await terpPage.waitForSelector('#incomingCall', { visible: true, timeout: config.timeout, });
    await htmlReport.attachScreenshot(terpPage, "Terp Get Call Notification");
    await terpPage.click('#incomingCall a[data-e2e="accept"');

    await terpPage.waitForNavigation({ waitUntil: 'networkidle2' });
    await expect(terpPage).toMatchElement('#remoteVideo', {
      timeout: config.timeout,
    });
  });

  it('terp has audio screen', async () => {
    await expect(terpPage).toMatchElement('#remoteVideo video', {
      timeout: config.timeout,
    });
    await htmlReport.attachScreenshot(terpPage, "Terp Audio");
  });

  it('skip billing question', async () => {

    try {
      const skipBillingQuestionButton = await terpPage.$x("//button[@class='btn btn-emergency']");
      await skipBillingQuestionButton[0].click();
      await page.waitFor(2000);
    } catch (error) {
      console.log("Billing Question Not Available");
    }
    
  });

  it('terp dials outbound phone number', async () => {
    await terpPage.waitForSelector('button[class="btn btn-sm btn-primary"]', {
      visible: true, timeout: config.timeout,
    });
    await terpPage.click('button[class="btn btn-sm btn-primary"]');
    await terpPage.waitForSelector('input[id="phoneNumber"]', {
      visible: true, timeout: config.timeout,
    });
    await terpPage.click('input[id="phoneNumber"]', { clickCount: 3 });
    await terpPage.type('input[id="phoneNumber"]', config.pstnNumber);
    await terpPage.click('i[class="fa fa-phone"]', { timeout: config.timeout });
    await delay(config.delay);
    await htmlReport.attachScreenshot(terpPage, "Terp Dials Outbound Phone Number");
  });

  it('terp has hangup button', async () => {
    await page.waitFor(3000);
    await expect(terpPage).toMatchElement('a[class="btn btn-red btn-small"]', {
      timeout: config.timeout,
    });
    await terpPage.click('a[class="btn btn-red btn-small"]');
    await htmlReport.attachScreenshot(terpPage, "Terp Hangup Outbound PSTN");
  });

  it('terp ends call', async () => {
    await terpPage.click("a[class='controls-end']");
    await htmlReport.attachScreenshot(terpPage, "Terp Ends Call");
  });

  it('terp has video ended and gets to station', async () => {
    await terpPage.waitForFunction(() => document.querySelector('button[data-e2e="Finalize"]'));
    await htmlReport.attachScreenshot(terpPage, "Terp To Station");
  });

  it('logout terp', async () => {
    await awsPageObjects.logoutToAWS(terpPage);
    await htmlReport.attachScreenshot(terpPage, "Logged Out");
  });
  
});
