const config = require('./config');
var helperFuncs = require('./utils/helperFunctions');
var htmlReport = require('./utils/htmlReporterFunctions');
var iwsPageObjects = require('./pageObjects/iwsPageObjects');
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

  it('login and prep terp', async () => {
    await terpPage.goto(`${config.url}/iws`);
    //await expect(terpPage).toMatch('Forgot');
    await delay(4000);
    await terpPage.type('input[name="username"]', config.terpUser3.username);
    await terpPage.click('button');
    await delay(2000);
    await terpPage.type('input[name="password"]', config.terpUser3.password);
    await terpPage.click('button');
    await terpPage.waitForNavigation({ waitUntil: 'networkidle2' });
    await expect(terpPage).toMatchElement('div[role="tablist"]', {timeout:config.delay});
    await terpPage.waitFor(3000);
    //await iwsPageObjects.changeUserStatus(terpPage, "Available");
    const click_bt = await terpPage.$x('//*[text()="Unavailable"]');
    click_bt[0].click();
    await delay(2000);
    const click_bt11 = await terpPage.$x('//*[text()="Available"]');
    click_bt11[0].click();
    await delay(3000);
    await terpPage.waitFor(3000);

    await htmlReport.attachScreenshot(terpPage, "Terp Logged In & Available");

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

    await terpPage.waitFor(10000);
    //await delay(30000);
  });

  it('terp answers', async () => {
    await htmlReport.attachScreenshot(terpPage, "Call Ring To Terp");
    await iwsPageObjects.iwsAcceptCall(terpPage, "Queue");

  });

  it('terp has audio container', async () => {
    await expect(terpPage).toMatchElement('#session--remote-video-container video', {
      timeout: config.timeout,
    });
    await terpPage.waitFor(5000);
    await htmlReport.attachScreenshot(terpPage, "Terp Audio Connected");
  });

  it('terp ends session', async () => {
    await terpPage.waitForSelector('button[title="End"]', { visible: true });
    const endVideoButton = await terpPage.$x("//button[@type='button'][@title='End']");
    await endVideoButton[0].click();
    await terpPage.waitForSelector('button[data-e2e="confirm-dialog-accept"]', { visible: true });
    const confirmButton = await terpPage.$x("//button[@type='button']//span[text()='Confirm']");
    await confirmButton[0].click();

    await delay(5000);
    await htmlReport.attachScreenshot(terpPage, "End Terp Session");
    
  });

  it('terp has video ended and gets to station', async () => {
    await terpPage.waitForSelector('span', {text:'Wrapping'},{ timeout: config.timeout });
  });

  it('terp go available', async () => { 
    //await terpPage.waitForSelector('button[class="bp3-button bp3-intent-success"]', { timeout: config.timeout });
    const goOnlineNowButton = await terpPage.$x('//*[@id="listbox-input--:r1:"]');
    await goOnlineNowButton[0].click();
    await expect(terpPage).toMatchElement('span', { text: 'Available' }, { timeout: config.timeout });
    // await goOnlineNowButton[0].click();
    // await expect(terpPage).toMatchElement('span', { text: 'Available' }, { timeout: config.timeout });
  });

  it('terp logout', async () => {
    await iwsPageObjects.iwsSignout(terpPage);
    await delay(3000);
    await htmlReport.attachScreenshot(terpPage, "Sign Out");
  });
  
});