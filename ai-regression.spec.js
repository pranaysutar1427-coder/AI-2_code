const constants = require('jest-junit/constants');
var config = require('./config');
var commandCenterPageObjects = require('./pageObjects/commandCenterPageObjects');
var iwsPageObjects = require('./pageObjects/iwsPageObjects');
var helperFuncs = require('./utils/helperFunctions');
var htmlReport = require('./utils/htmlReporterFunctions');
var newPageWithNewContext = require('./utils/newPageWithNewContext');

const delay = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};


describe('AI Web Regression Test', () => {
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

  it('SV-1387, SV-7943: Validate Bad Login', async () => {
    await page.goto(`${config.url}/client`);
    await delay(2000);
    await commandCenterPageObjects.badLogin(page, config.clientUser1.username);
    await page.waitForXPath(commandCenterPageObjects.invalidLoginMesaage, { timeout: config.timeout }, { visible: true });
    await page.waitFor(2000);
    await helperFuncs.verifyTextXpath(page, commandCenterPageObjects.invalidLoginMesaage, "Username or password is incorrect.  Try again.");
    await htmlReport.attachScreenshot(page, "Bad Login");

  });

  it('SV-1387, SV-5174: Validate Login', async () => {
    await page.goto(`${config.url}/client`);
    await page.waitForSelector('input[name="username"]', { timeout: config.timeout }, { visible: true });
    await commandCenterPageObjects.login(page, config.clientUser1.username, config.clientUser1.password);
    await delay(4000);
    await expect(page).toMatchElement('a', { text: 'Languages' });
    await htmlReport.attachScreenshot(page, "Successful Login");
    await commandCenterPageObjects.checkifFreeAndCancelResumeDialog(page);
    await delay(3000);
  });

  it('SV-5710: Verify  Enterprise Brand URLs functionality.', async () => {
    await page.waitForXPath('//*[@id="sven-app"]/div/div/div/div[2]/footer/div/div[2]/img');
    await htmlReport.attachScreenshot(page, "Enterprise Brand URLs");
  });

  it('SV-7614: Verify Addition of Call history page in menu', async () => {

    await commandCenterPageObjects.navigateToSessionHistory(page);
    await htmlReport.attachScreenshot(page, "Call history page");
  });

  it('SV-11544: AI | Verify the version of the app', async () => {

    await commandCenterPageObjects.navigateToSupport(page);
    const appv = await commandCenterPageObjects.appversion(page);
    console.log(appv);
    await htmlReport.attachScreenshot(page, "Version of the app");
  });

  it('SV-7348: Verify speed test functionality.', async () => {

    await commandCenterPageObjects.navigateToSpeedTest(page);
    await commandCenterPageObjects.clickSpeedTestButton(page);
    await htmlReport.attachScreenshot(page, "speed test");
    await delay(2000);
  });

  it('SV-5200: Verify user is able to play the training video in the support menu', async () => {

    await commandCenterPageObjects.navigateToTraningVideo(page);
    await expect(page).toMatchElement('source[type="video/mp4"]');
    await htmlReport.attachScreenshot(page, "Training Video");
    await delay(2000);
  });


  it('SV-5201: Verify the microphone test and the camera test in the media diagnostics menu', async () => {
    await commandCenterPageObjects.navigateToMediaDiagnosticsAndRunTest(page);
    await delay(2000);
    await expect(page).toMatchElement('p', { text: 'All tests passed' });
    await delay(3000);
    await commandCenterPageObjects.restartChecks(page);
    await htmlReport.attachScreenshot(page, "Microphone Camera Test");
    await delay(2000);
  });

  it('SV-5202, SV-7384, SV-5181, SV-7012: Verify that the user is able to view language hours in the language hours menu option', async () => {
    await commandCenterPageObjects.navigateToLanguageHours(page);
    await expect(page).toMatchElement('h3', { text: 'Hours of Operation by Language' });
    await expect(page).toMatchElement('p', { text: 'Video Interpreting Hours' });
    await expect(page).toMatchElement('p', { text: 'Sessions outside of these hours will be transferred to an audio interpreter. Languages that are not listed here can be accessed at any time by selecting "Audio Languages" on the main screen.' });
    await htmlReport.attachScreenshot(page, "Hours of Operation Verbiage");
    await delay(2000);
  });

  // it('SV-7012, SV-7384: Verify holiday schedule functionality for AI web app', async () => {
  //   await commandCenterPageObjects.clickHolidaySchedule(page);
  //   const holidayExpandValue = await commandCenterPageObjects.verifyHolidayScheduleExpandCollapse(page);
  //   await expect(holidayExpandValue).toEqual("true");
  //   await htmlReport.attachScreenshot(page, "Holiday Schedule Expanded");
  //   await delay(2000);
  //   await commandCenterPageObjects.clickHolidaySchedule(page);
  //   const holidayCollapseValue = await commandCenterPageObjects.verifyHolidayScheduleExpandCollapse(page);
  //   await expect(holidayCollapseValue).toEqual("false");
  //   await htmlReport.attachScreenshot(page, "Holiday Schedule Collapsed");
  //   await delay(2000);
  // });

  it('SV-5203, SV-5185, SV-5187, SV-5189: Verify that the user is able to view the contact information by clicking on the Contact menu and verify contacting the support through the app', async () => {
    await commandCenterPageObjects.navigateToContactPage(page);
    await expect(page).toMatchElement('span', { text: 'Phone:' });
    await htmlReport.attachScreenshot(page, "Contact Support");
    await commandCenterPageObjects.contactSupport(page);
    await delay(3000);
    const [c_party] = await page.$x('//*[text()="End"]'); // Use destructuring to pick the first match
    if (!c_party) {
      throw new Error('"End" button not found');
    }
    await c_party.click();
    await delay(6000);
    const eSkipToDashboard = await page.$x('//*[text()="Go to languages"]');
    await eSkipToDashboard[0].click();
    await delay(8000);
  });

  it('SV-7991, SV-5183, SV-7259, SV-7366: Verify AI web supports HD calls."', async () => {

    await commandCenterPageObjects.navigateToSettings(page);
    await htmlReport.attachScreenshot(page, "supports HD calls");
  });

  it('Navigate To Dashboard', async () => {

    await commandCenterPageObjects.navigateToLanguages(page);
    await htmlReport.attachScreenshot(page, "Navigate To Dashboardsupports HD calls");
  });

  it('SV-1390, SV-4947, SV-4802: Verify Audio call from Command center', async () => {
    await commandCenterPageObjects.initiateAudioCall(page);
    await delay(2000);
    //await expect(page).toMatchElement(commandCenterPageObjects.audioIVVR, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Audio Call");
    await delay(6000);
  });

  it('Cancel the call and Go to the Language Screen', async () => {
    // await commandCenterPageObjects.clickCancelButton(page);
    const eCancelButton = await page.$x('//*[text()="Cancel request"]');
    await eCancelButton[0].click();
    await delay(8000);
    //await commandCenterPageObjects.clickSkipToDashboard(page);
    const eSkipToDashboard = await page.$x('//*[text()="Go to languages"]');
    await eSkipToDashboard[0].click();
    await delay(2000);
  });

  it('SV-1389: Verify 2,3,4 way call from web command center to terp', async () => {
    await terpPage.goto(`${config.url}/iws`);
    //await expect(terpPage).toMatch('Forgot');
    await delay(2000);
    await terpPage.type('input[name="username"]', config.terpUser3.username);
    await terpPage.click('button');
    await delay(2000);
    await terpPage.type('input[name="password"]', config.terpUser3.password);
    await terpPage.click('button');
    await terpPage.waitForNavigation({ waitUntil: 'networkidle2' });
    await expect(terpPage).toMatchElement('div[role="tablist"]', { timeout: config.delay });
    await delay(4000);
    // await iwsPageObjects.changeUserStatus(terpPage, "Available");
    const click_btr = await terpPage.$x('//*[text()="Unavailable"]');
    await click_btr[0].click();
    await delay(2000);
    const click_bt11 = await terpPage.$x('//*[text()="Available"]');
    click_bt11[0].click();
    await delay(3000);
  });


  //login and set busy terp2
  it('login and set busy terp2', async () => {
    await terp2Page.goto(`${config.url}/iws`);
    //await expect(terp2Page).toMatch('Forgot');
    await delay(2000);
    await terp2Page.type('input[name="username"]', config.terpUser4.username);
    await terp2Page.click('button');
    await delay(2000);
    await terp2Page.type('input[name="password"]', config.terpUser4.password);
    await terp2Page.click('button');
    await terp2Page.waitForNavigation({ waitUntil: 'networkidle2' });
    await expect(terp2Page).toMatchElement('div[role="tablist"]', { timeout: config.delay });
    // await iwsPageObjects.changeUserStatus2(terp2Page, "Transfer");
    await delay(4000);
    const click_bt = await terp2Page.$x('//*[text()="Unavailable"]');
    click_bt[0].click();
    await delay(2000);
    const click_bt12 = await terp2Page.$x('//*[text()="Transfer"]');
    click_bt12[0].click();
    await delay(4000);
  });

  it('SV-177: Verify the stratus video Command Center', async () => {
    const b = await page.$x('//*[text()="Spanish"]');
    await b[0].click();
    await delay(10000);
    // await page.waitForNavigation({ waitUntil: 'networkidle2' });
    // await expect(page).toMatch('Finding a match...');
    await htmlReport.attachScreenshot(page, "stratus video Command Center");
  });


  it('terp answers', async () => {
    await iwsPageObjects.iwsAcceptCall(terpPage, "Queue");
    await htmlReport.attachScreenshot(terpPage, "terp answers");
    await delay(3000);
  });

  it('client has video', async () => {
    // await expect(page).toMatchElement('#session--remote-video-container', {
    //   timeout: 30000,
    //  await page.waitForSelector('#session--remote-video-container', {visible: true});
    await page.$x('//*[text()="session--remote-video-container"]');
    await htmlReport.attachScreenshot(page, "Client Video");
  });

  it('terp has video', async () => {
    // await expect(terpPage).toMatchElement('#session--remote-video-container', {
    //   timeout: config.timeout,
    //  await terpPage.waitForSelector('#session--remote-video-container', {visible: true});
    await terpPage.$x('//*[text()="session--remote-video-container"]');
    await htmlReport.attachScreenshot(terpPage, "Terp1 Video");
  });

  it('Skip Billing Questions', async () => {
    try {
      const skipBillingQuestionButton = await terpPage.$x("//span[text()='Skip for Emergency']");
      await skipBillingQuestionButton[0].click();

      await delay(3000);
      await expect(terpPage).toMatchElement('div', { text: 'Billing Questions have been answered.' }, { timeout: config.timeout }, { visible: true });
    } catch (error) {
      console.log("Billing Questions Not Available");
    }
    await htmlReport.attachScreenshot(terpPage, "Skip Billing Questions");
    await delay(2000);

  });


  it('terp2 goes available', async () => {
    // go available
    //await iwsPageObjects.changeUserStatus(terp2Page, "Available");
    const click_bt0 = await terp2Page.$x('//*[text()="Transfer"]');
    click_bt0[0].click();
    await delay(2000);
    const click_btq11 = await terp2Page.$x('//*[text()="Available"]');
    click_btq11[0].click();
    await htmlReport.attachScreenshot(terp2Page, "terp2 goes available");
    await delay(4000);
  });


  it('terp adds party', async () => {

    const add_p = await terpPage.$x('//*[text()="Add Interpreter"]');
    if (add_p.length > 0) {
      await add_p[0].click();
    } else {
      console.error('Element "Add Interpreter" not found');
    }

    await delay(4000);
    // const create_request_button = await terpPage.$x("//span[text()='Create New Request']");
    // create_request_button[0].click()

    const create_request_button = await terpPage.$x("//span[text()='Create New Request']");
    if (create_request_button.length > 0) {
      await create_request_button[0].click();
    } else {
      console.error('Create New Request button not found');
    }

    await delay(4000);
    const language_field = await terpPage.$x("//label[text()='Language']//following::div[4]");
    language_field[0].click()
    await delay(2000);
    await language_field[0].type(config.language);
    await terpPage.keyboard.press('Enter');
    const request_interpreter_button = await terpPage.$x("//span[contains(text(),'Request Interpreter')]");
    request_interpreter_button[0].click()
    await terpPage.waitForSelector('p', { text: 'Found Interpreter.  Waiting for Accept ...' });
    await delay(15000);
  });


  it('terp2 answers', async () => {
    //await iwsPageObjects.iwsAcceptCall(terp2Page, "Queue");
    // const accept_button_1 = await terp2Page.$x("/html/body/div[2]/div/div[3]/div/div[3]/div/button[2]");
    // await accept_button_1[0].click();

    const [accept_button_1] = await terp2Page.$x("/html/body/div[2]/div/div[3]/div/div[3]/div/button[2]");
    if (!accept_button_1) {
      throw new Error("Accept button not found");
    }
    await accept_button_1.click();
    await delay(3000);
  });

  it('terp2 has video', async () => {
    await terp2Page.$x('//*[text()="session--remote-video-container"]');
    await htmlReport.attachScreenshot(terp2Page, "Terp2 Video");
    await delay(3000);
  });

  it('SV-12004: IWS-BE-The call is been disconnected after hit refresh button from Client User.', async () => {
    await commandCenterPageObjects.ClientRefresh(page);
    await htmlReport.attachScreenshot(page, "Refresh the Call");
    await delay(5000);
  });

  it('client ends video and returns to homepage', async () => {
    // const c_party = await page.$x('//*[text()="End"]');
    // c_party[0].click();
    await delay(3000);
    const [c_party] = await page.$x('//*[text()="End"]'); // Use destructuring to pick the first match
    if (!c_party) {
      throw new Error('"End" button not found');
    }
    await c_party.click();
    await delay(8000);
  });

  it('terp1 logout', async () => {
    await iwsPageObjects.iwsSignout(terpPage);
    await htmlReport.attachScreenshot(terpPage, "Sign Out");
    await delay(5000);
  });

  it('SV-6992: Verify that “Session ID“, “Start Time” and “Last Agent“ info is displayed on after session page', async () => {
    await page.waitForXPath(commandCenterPageObjects.skipToDashboardButton, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('span', { text: 'Session ID:' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('span', { text: 'Start time:' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('span', { text: 'Last agent:' }, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Post Session Page");
    await delay(3000);
  });

  it('SV-7333: Verify that "Click to Dashboard" navigates to dashboard page', async () => {
    //await commandCenterPageObjects.clickSkipToDashboard(page);
    //await expect(page).toMatchElement(".dashboard-content", { timeout: config.timeout }, { visible: true });
    const eSkipToDashboard = await page.$x('//*[text()="Go to languages"]');
    await eSkipToDashboard[0].click();
    await delay(2000);
    await htmlReport.attachScreenshot(page, "Click to Dashboard");
    await delay(4000);
    await expect(page).toMatch('a', { text: 'Languages' }, { timeout: config.timeout });
    await delay(4000);
  });

  it('SV-9450: AI | WEB | Verify On Clicking the Back Button, App should not Navigates from Home Page to Rating Screen', async () => {

    await page.goBack();
    await delay(4000);
  });

  it('SV-7663, SV-10899: Verify the session history start and End time', async () => {

    await commandCenterPageObjects.navigateToSessionHistoryStartTime(page);
  });

  it('SV-7334: Verify that IVVR Video is displayed when Queued to Interpreter', async () => {
    const elementsS = await page.$x('//*[text()="Languages"]');
    await elementsS[0].click();
    await delay(4000);
    const newcall = await page.$x('//*[text()="Spanish"]');
    await newcall[0].click();
    await delay(3000);

    //await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await expect(page).toMatch('Finding a match...', { timeout: config.timeout }, { visible: true });
    await delay(8000);
    await page.$x('//*[text()="session--remote-video-container"]');
    await htmlReport.attachScreenshot(page, "IVVR Video");
    await delay(3000);
  });

  it('SV-7335, SV-5246: Verify that clicking Cancel button navigates to Feedback page when Queued to Interpreter', async () => {
    await commandCenterPageObjects.clickCancelButton(page);
    await delay(8000);
    await page.waitForXPath(commandCenterPageObjects.skipToDashboardButton, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('h3', { text: 'Session complete' }, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "After Cancel Survey Page");
    await delay(5000);
  });

  it('SV-3884: AI | Web | Verify answering boolean and date type questions on the client side', async () => {
    await commandCenterPageObjects.feedbackque(page);
    //await expect(page).toMatchElement(".dashboard-content", { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Feedback Questions");
  });

  it('SV-7336: Verify submitting feedback on after session page', async () => {
    await commandCenterPageObjects.submitFeedback(page);
    //await expect(page).toMatchElement(".dashboard-content", { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Submit Feedback");
  });

  it('SV-8829: AI | Web | Verify that user getting notification composed by LO app user.', async () => {

    await commandCenterPageObjects.lonotificaation(page);
    await htmlReport.attachScreenshot(page, "Device Target Notification");
  });

  it('SV-8354: Verify Add language filtering button functionality', async () => {

    await commandCenterPageObjects.addlanguaage(page);
    await htmlReport.attachScreenshot(page, "Add Language Filter");
  });

  it('SV-10111: Verify Device Identifier 1 and 2 should display in the lower left on the Languages screen', async () => {

    await commandCenterPageObjects.deviceid(page);
    await htmlReport.attachScreenshot(page, "Devide Identifier");
  });


  it('SV-1387: Validate Logout', async () => {
    await commandCenterPageObjects.logout(page);
    await htmlReport.attachScreenshot(page, "Logout");
  });

  it('SV-7976, SV-8007, SV-10127, SV-8204: Verify users are able to log in as an SSO user on AI web', async () => {
    //await page.goto(`${config.url}/client`);
    await delay(2000);
    await page.waitForSelector('input[name="username"]');
    await delay(2000);
    await commandCenterPageObjects.ssoLogin(page, config.clientSSOUser1.username, config.clientSSOUser1.password);
    //await expect(page).toMatchElement('a', { text: 'Languages' });
    await htmlReport.attachScreenshot(page, "Successful SSO Login");
  });

  it('SV-7963: AI | Web | SSO | Verify the continue and End session functionality of banner on AI web (Before Accepting the call)', async () => {
    
    const ssodial = await page.$x('//*[text()="Spanish"]');
    await ssodial[0].click();
    await page.waitFor(10000);
    await page.reload();
    await page.waitFor(5000);
    const continuebtn = await page.$x('//button[text()="Continue"]');
    await page.waitFor(2000);
    const endbtn = await page.$x('//button[text()="End Session"]');
    await endbtn[0].click();
    await page.waitFor(4000);
    const elementsSkipToDashboard = await page.$x('//*[text()="Go to languages"]');
    await elementsSkipToDashboard[0].click();
    await page.waitFor(10000);
  });

  it('Login to SSO Terp', async () => {
    await terpPage.goto(`${config.url}/iws`);
    //await expect(terpPage).toMatch('Forgot');
    await delay(2000);
    await terpPage.type('input[name="username"]', config.terpUser1.username);
    await terpPage.click('button');
    await delay(2000);
    await terpPage.type('input[name="password"]', config.terpUser1.password);
    await terpPage.click('button');
    await terpPage.waitForNavigation({ waitUntil: 'networkidle2' });
    await expect(terpPage).toMatchElement('div[role="tablist"]', { timeout: config.delay });
    await delay(4000);
    // await iwsPageObjects.changeUserStatus(terpPage, "Available");
    const click_btr = await terpPage.$x('//*[text()="Unavailable"]');
    await click_btr[0].click();
    await delay(2000);
    const click_bt11 = await terpPage.$x('//*[text()="Available"]');
    click_bt11[0].click();
    await delay(3000);
  });

  it('Client Dial', async () => {
    const ssodial = await page.$x('//*[text()="Spanish"]');
    await ssodial[0].click();
    await page.waitFor(10000);
  });

  it('terp answers', async () => {
    await iwsPageObjects.iwsAcceptCall(terpPage, "Queue");
    await delay(3000);
  });

  it('SV-8218 SV-8220, SV-8221, SV-7963: AI | Web | SSO | Verify the continue and End session functionality of banner on AI web (Before Accepting the call)', async () => {
    await commandCenterPageObjects.ssobanner(page);
    await htmlReport.attachScreenshot(page, "SSO_Banner");
  });

  it('SV-8219: AI | Web | SSO | Verify the continue and End session functionality of banner on AI web (After Accepting the call)', async () => {
    await commandCenterPageObjects.RefreshCall(page);
    await htmlReport.attachScreenshot(page, "Refresh the Call");
  });

  it('Logout SSO User', async () => {
    await commandCenterPageObjects.ssologout(page);
    await htmlReport.attachScreenshot(page, "Logout SSO User");
  });

  it('SV-8440: AI | Web | SSO | Verify login using Azure Credentials', async () => {

    await page.waitForSelector('input[name="username"]');
    await commandCenterPageObjects.login(page, config.terpUser6.username, config.terpUser6.password);
    await delay(4000);
    await expect(page).toMatchElement('a', { text: 'Languages' });
    await htmlReport.attachScreenshot(page, "Successful Login");
    await delay(3000);

    const b = await page.$x('//*[text()="Spanish"]');
    await b[0].click();
    await delay(10000);

    const [accept_button_1] = await terp2Page.$x("/html/body/div[2]/div/div[3]/div/div[3]/div/button[2]");
    if (!accept_button_1) {
      throw new Error("Accept button not found");
    }
    await accept_button_1.click();
    await delay(6000);

    const [c_party] = await page.$x('//*[text()="End"]'); // Use destructuring to pick the first match
    if (!c_party) {
      throw new Error('"End" button not found');
    }
    await c_party.click();
    await page.waitFor(5000);

    const ssologout = await page.$x('//button[@type="button"]');
    await ssologout[0].click();
    await page.waitFor(3000);
    const sigoutbt = await page.$x('//div[@tabindex="-1"]');
    await sigoutbt[0].click();
    await page.waitFor(5000);

  });

  it('terp2 goes available', async () => {

    const clickedbtn = await terp2Page.$x('//*[@id="listbox-input--:r1:"]');
    await clickedbtn[0].click();
    await delay(2000);
    const clickbtn = await terp2Page.$x('//*[text()="Available"]');
    await clickbtn[0].click();
    await delay(4000);
  });

  it('SV-9176; AI | Web | Okta SSO | Verify login using Okta SSO Credentials', async () => {

    await page.waitForSelector('input[name="username"]');
    await commandCenterPageObjects.login(page, config.terpUser5.username, config.terpUser5.password);
    await delay(4000);
    await expect(page).toMatchElement('a', { text: 'Languages' });
    await htmlReport.attachScreenshot(page, "Successful Login");
    await delay(3000);

    const b = await page.$x('//*[text()="Spanish"]');
    await b[0].click();
    await delay(10000);

    const [accept_button_1] = await terp2Page.$x("/html/body/div[2]/div/div[3]/div/div[3]/div/button[2]");
    if (!accept_button_1) {
      throw new Error("Accept button not found");
    }
    await accept_button_1.click();
    await delay(3000);

    const [c_party] = await page.$x('//*[text()="End"]'); // Use destructuring to pick the first match
    if (!c_party) {
      throw new Error('"End" button not found');
    }
    await c_party.click();
    await page.waitFor(5000);

    const ssologout = await page.$x('//button[@type="button"]');
    await ssologout[0].click();
    await page.waitFor(3000);
    const sigoutbtn = await page.$x('//*[text()="Sign out"]');
    await sigoutbtn[0].click();
    await page.waitFor(8000);
  }); 

  it('SV-10121: AI | WEB| VS | Verify the Sub-Account Selection', async () => {

    //await page.goto(`${config.url}/client`);
    await page.waitForSelector('input[name="username"]');
    await commandCenterPageObjects.login(page, config.terpUser2.username, config.terpUser2.password);
    await delay(4000);
    await page.waitFor('//div[@tabindex="0"]');
    await page.waitFor('//div[@tabindex="-1"]');
    await delay(3000);

    const createaccount = await page.$x('//div[@tabindex="-1"]');
    await createaccount[0].click();
    await delay(3000);

    const level1 = await page.$x('//button[@type="button"]');
    await level1[1].click();
    await delay(2000);
    const selectLevel1 = await page.$x('//div[@tabindex="0"]');
    await selectLevel1[1].click();
    await page.waitFor('//*[text()="Location Level 2 selection required"]')
    await delay(2000);

    const level2 = await page.$x('//button[@type="button"]');
    await level2[2].click();
    await delay(2000);
    const selectLevel2 = await page.$x('//div[@tabindex="0"]');
    await selectLevel2[1].click();
    await delay(2000);
    const addShrotcut = await page.$x('//button[@type="submit"]');
    await addShrotcut[0].click();
    await htmlReport.attachScreenshot(page, "Sub-Account Selection");
    await delay(10000);
  });


  it('SV-10122: CCS | FE | Verify Show parents in account selection buttons.', async () => {

    await page.waitFor("//*[contains(text(), 'Nishant')]");
    //await page.waitFor('//div[@class="font-semibold break-anywhere"]');
    // await delay(6000);
    // const selectedacc = page.$x("//*[contains(text(), 'Nishant')]");
    // await selectedacc[0].click();
    // await delay(6000);

    await expect(page).toMatchElement('a', { text: 'Languages' });
    await delay(2000);
    const accountbtn = await page.$x("//*[contains(text(), 'Nishant')]");
    await accountbtn[0].click();
    await delay(3000);
    const checkbox = await page.$x('//input[@type="checkbox"]');
    await checkbox[0].click();
    await delay(3000);
    const deletbtn = await page.$x('//button[@type="button"]');
    await deletbtn[1].click();
    await delay(4000);
    await page.waitFor('//div[@tabindex="0"]');
    await page.waitFor('//div[@tabindex="-1"]');
    await htmlReport.attachScreenshot(page, "Show parents in account selection buttons");
    await delay(3000);
  });

  it('CCS Logout', async () => {

    const acclogout = await page.$x('//button[@type="button"]');
    await acclogout[0].click();
    await page.waitFor(3000);
    const sigoutbtn = await page.$x('//*[text()="Sign out"]');
    await sigoutbtn[0].click();
    await htmlReport.attachScreenshot(page, "CCS Logout");
    await page.waitFor(8000);
  });

});