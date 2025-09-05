var config = require('./config');
var awsPageObjects = require('./pageObjects/agentStationPageObjects');
var helperFuncs = require('./utils/helperFunctions');
var htmlReport = require('./utils/htmlReporterFunctions');
var newPageWithNewContext = require('./utils/newPageWithNewContext');
var chooseReactSelect = require('./utils/chooseReactSelect');

describe('3-Way Call', () => {
  let terpPage;
  let terp2Page;

  beforeEach(() => {
    jest.setTimeout(config.timeout);
  });

  beforeAll(async done => {
    terpPage = await newPageWithNewContext(browser);
    terp2Page = await newPageWithNewContext(browser);
    done();
  });

  // login and kill any existing session
  it('login and prep client', async () => {
    await page.goto(`${config.url}/client`);
    await page.waitForSelector('input[name="username"]', { timeout: config.timeout }, { visible: true });
    await delay(2000);
    await page.type('input[name="username"]', config.clientUser1.username);
    await page.type('input[name="password"]', config.clientUser1.password);
    await page.click('button');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    await expect(page).toMatchElement('a', { text: 'Languages' });
    await htmlReport.attachScreenshot(page, "Successful Login");

    // since we don't do any backend seeding yet, we need to
    // manually kill any existing sessions
    const isFree = await page.evaluate(async () => {
      const response = await fetch('/api/me/session/current');
      return response.status === 204;
    });

    if (isFree) {
      return expect(isFree).toBe(true);
    }

    await page.waitForSelector('#resumeSessionModal', { visible: true });
    await page.click('#resumeSessionModal a[data-e2e="cancel"');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    await expect(page).toMatch('Provide Feedback', { timeout: config.timeout });
    await expect(page).toClick('button', { text: 'Skip' });
    await expect(page).toMatchElement(
      'a',
      { text: 'Languages' },
      { timeout: config.timeout }
    );
  });

  // login, kill any existing session, and then go available
  it('login and prep terp', async () => {
    await terpPage.goto(`${config.url}/iws`);
    await awsPageObjects.loginToAWS(terpPage, config.terpUser1.username, config.terpUser1.password);
    await terpPage.waitForXPath(awsPageObjects.userStatus, { timeout: config.timeout }, { visible: true });
    await helperFuncs.verifyTextXpath(terpPage,awsPageObjects.userStatus,"Unavailable");
    await awsPageObjects.changeUserStatus(terpPage, "Available");
    await helperFuncs.verifyTextXpath(terpPage,awsPageObjects.userStatus, "Available");
  });

  // login, kill any existing session, and then go unavailable
  it('login and prep terp2', async () => {
    await terp2Page.goto(`${config.url}/iws`);
    await awsPageObjects.loginToAWS(terp2Page, config.terpUser2.username, config.terpUser2.password);
    await terp2Page.waitForXPath(awsPageObjects.userStatus, { timeout: config.timeout }, { visible: true });
    await helperFuncs.verifyTextXpath(terp2Page,awsPageObjects.userStatus,"Unavailable");
    await awsPageObjects.changeUserStatus(terp2Page, "Break");
    await helperFuncs.verifyTextXpath(terp2Page,awsPageObjects.userStatus, "Break");
  });

  it('client dials', async () => {
    await expect(page).toClick('span', {
      text: config.language,
      timeout: config.timeout,
    });

    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await expect(page).toMatch('Finding a match...', { timeout: config.timeout });
    await htmlReport.attachScreenshot(page, "Client Initiated Call");
  });

  it('terp answers', async () => {
    await awsPageObjects.awsAcceptCall(terpPage);
  });

  it('client has video', async () => {
    await expect(page).toMatchElement('#remoteVideo video', {
      timeout: config.timeout,
    });
    await htmlReport.attachScreenshot(page, "Client Video");
  });

  it('terp has video', async () => {
    await expect(terpPage).toMatchElement('#remoteVideo video', {
      timeout: config.timeout,
    });
    await htmlReport.attachScreenshot(page, "Terp1 Video");
  });

  it('Skip Billing Questions', async () => {

    try {
      const skipBillingQuestionButton = await terpPage.$x("//button[@class='btn btn-emergency']");
      await skipBillingQuestionButton[0].click();

      await page.waitFor(2000);
    } catch (error) {
      console.log("Billing Question Not Available");
    }
    
  });

  it('terp2 goes available', async () => {
    // go available
    await awsPageObjects.changeUserStatus(terp2Page, "Available");
    await helperFuncs.verifyTextXpath(terp2Page,awsPageObjects.userStatus, "Available");
  });

  it('terp adds party', async () => {
    await expect(terpPage).toClick('a[data-e2e="addParty"]');
    await chooseReactSelect(terpPage, '#addPartyModal', config.language);

    await expect(terpPage).toClick('#addPartyModal .modal-footer a', {
      text: 'Submit',
    });

    await terpPage.waitForSelector('.mainVideo .loading-container');
  });

  it('terp2 answers', async () => {
    await awsPageObjects.awsAcceptCall(terp2Page);
  });

  it('terp2 has video', async () => {
    await expect(terp2Page).toMatchElement('#remoteVideo video', {
      timeout: config.timeout,
    });
    await htmlReport.attachScreenshot(page, "Terp2 Video");
  });

  it('client ends video and returns to homepage', async () => {
    await page.click('.controls-right-group a.controls-end');
    await expect(page).toMatch('a', { text: 'Languages' }, { timeout: config.timeout });
    await htmlReport.attachScreenshot(page, "Client Ends Video");
  });

  it('terp has video ended and gets to station', async () => {
    await terpPage.waitForFunction(() => document.querySelector('button[data-e2e="Finalize"]'));
    await htmlReport.attachScreenshot(page, "Terp1 To Workstation");
  });

  it('terp2 has video ended and gets to station', async () => {
    await terp2Page.waitForFunction(() => document.querySelector('button[data-e2e="Finalize"]'));
    await htmlReport.attachScreenshot(page, "Terp2 To Workstation");
  });
});
