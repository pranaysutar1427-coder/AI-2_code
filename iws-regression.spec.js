var config = require('./config');
var helperFuncs = require('./utils/helperFunctions');
var htmlReport = require('./utils/htmlReporterFunctions');
var newPageWithNewContext = require('./utils/newPageWithNewContext');
var commandCenterPageObjects = require('./pageObjects/commandCenterPageObjects');
var iwsPageObjects = require('./pageObjects/iwsPageObjects');
var csrPageObjects = require('./pageObjects/csrPageObjects');
var chooseReactSelect = require('./utils/chooseReactSelect');
const { Browser } = require('puppeteer');

const delay = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};


describe('IWS Regression Test', () => {
  let terpPage;
  let newPage;
  let terp2Page;
  //let csrPage;

  beforeEach(() => {
    jest.setTimeout(config.timeout);
  });

  beforeAll(async done => {
    terpPage = await newPageWithNewContext(browser);
    terp2Page = await newPageWithNewContext(browser);
    //csrPage = await newPageWithNewContext(browser);
    done();
  });


  it('SV-7873: Verify functionality of Pre-Login Camera Check', async () => {
    await terpPage.goto(`${config.url}/iws`);
    await iwsPageObjects.clickOnCameraPreview(terpPage);
    try {
      await terpPage.waitFor(3000);
      await expect(terpPage).toMatchElement('h1', { text: 'Camera Preview' });
    } catch (err) {
      const cameraPreviewButtonObj = await terpPage.$x(iwsPageObjects.cameraPreviewButton);
      await cameraPreviewButtonObj[0].click();
    }

    await expect(terpPage).toMatchElement('video[aria-label="Self-view video"]', { visible: true }, { timeout: config.timeout });
    await htmlReport.attachScreenshot(terpPage, "Verified Self-View Video");
    await terpPage.click('button[type="button"]');
    await terpPage.waitForSelector('button[type="button"]');
    await htmlReport.attachScreenshot(terpPage, "Verified Login Page");

  })

  it('SV-7610: Verify all Changed branding assets', async () => {

    await terpPage.goto(`${config.url}/iws`);
    await terpPage.waitForSelector('input[name="username"]', { timeout: config.timeout }, { visible: true });
    await iwsPageObjects.loginToIWS(terpPage, config.terpUser3.username, config.terpUser3.password);
    await terpPage.waitForSelector('img[alt="AMN Healthcare Logo"]');
  });

  it('SV-5292: Verify that after user presented with self with, "Links" dropdown, user firs and last mane, username, sign out button, statuses menu, "History", "Diagnostics" and "Settings" tabs.', async () => {

    //await expect(terpPage).toMatchElement('span', { text: 'Links' });
    //await terpPage.waitFor(1000);
    await expect(terpPage).toMatchElement('span', { text: config.terpUser3.username });
    await terpPage.waitFor(1000);
    await expect(terpPage).toMatchElement('div', { text: 'History' });
    await terpPage.waitFor(1000);
    await expect(terpPage).toMatchElement('div', { text: 'Diagnostics' });
    await terpPage.waitFor(1000);
    await expect(terpPage).toMatchElement('div', { text: 'Settings' });
    await terpPage.waitFor(1000);
    await htmlReport.attachScreenshot(terpPage, "Links Displayed");
    await terpPage.waitFor(1000);
    await iwsPageObjects.clickOnUsernameDropdown(terpPage);
    await terpPage.waitFor(1000);
    await expect(terpPage).toMatchElement('div', { text: 'Sign Out' });
    await terpPage.waitFor(1000);
    await htmlReport.attachScreenshot(terpPage, "Logout Displayed");
    await terpPage.waitFor(1000);
    await iwsPageObjects.clickOnUsernameDropdown(terpPage);
    await terpPage.waitFor(1000);
  });

  it('SV-5294: Verify that user can click Links', async () => {

    await expect(terpPage).toClick('a', { text: 'Paycom' });
    await terpPage.waitFor(3000);
    await htmlReport.attachScreenshot(terpPage, "Navigated To Links");

    await terpPage.bringToFront();

  });

  it('SV-5295: Verify that user presented with "Available", "Transfer", "Break", "Lunch", "Meeting", "Post Session Work", "Supervision", "Tech Support", "Training" statuses in statuses dropdown', async () => {

    await expect(terpPage).toClick('span', { text: 'Unavailable' });

    await expect(terpPage).toMatchElement('div', { text: 'Available' });
    await expect(terpPage).toMatchElement('div', { text: 'Transfer' });
    await expect(terpPage).toMatchElement('div', { text: 'Break' });
    await expect(terpPage).toMatchElement('div', { text: 'Lunch' });
    await expect(terpPage).toMatchElement('div', { text: 'Meeting' });
    await expect(terpPage).toMatchElement('div', { text: 'Post Session Work' });
    await expect(terpPage).toMatchElement('div', { text: 'Supervision' });
    await expect(terpPage).toMatchElement('div', { text: 'Tech Support' });
    await expect(terpPage).toMatchElement('div', { text: 'Training' });

    await htmlReport.attachScreenshot(terpPage, "Status Displayed");

    await expect(terpPage).toClick('span', { text: 'Available' });

  });


  it('SV-5296: Verify that after user logged in user presented with "History" tab with "Recent Sessions" list which includes "SESSION", "UNIT ID "START", "END", "ENTERPRISE"', async () => {

    await iwsPageObjects.clickOnHistoryButton(terpPage);
    await expect(terpPage).toMatchElement('span', { text: 'Recent Sessions' });
    await expect(terpPage).toMatchElement('th', { text: 'Session' });
    await expect(terpPage).toMatchElement('th', { text: 'Unit ID' });
    await expect(terpPage).toMatchElement('abbr', { text: 'Start' });
    await expect(terpPage).toMatchElement('abbr', { text: 'End' });
    await expect(terpPage).toMatchElement('th', { text: 'Enterprise' });
    await htmlReport.attachScreenshot(terpPage, "Recent Session");

  });

  it('SV-7411: Verify Updated Tool Tip Verbiage for start and end session in IWS', async () => {

    var toolTipVerbiage = await iwsPageObjects.getToolTipVerbiageStartEnd(terpPage);
    var startToolTipVerbiage = toolTipVerbiage.startToolTip;
    var endToolTipVerbiage = toolTipVerbiage.endToolTip;
    await expect(startToolTipVerbiage).toEqual('When agent joined');
    await expect(endToolTipVerbiage).toEqual('When agent left');

  });

  it('SV-5297, SV-5298, SV-7656: Verify that after user see/use "Version", "Speed Test", "Microphone" tabs', async () => {

    await iwsPageObjects.clickOnDiagnosticButton(terpPage);
    await iwsPageObjects.clickOnSpeedTestButton(terpPage);
    await expect(terpPage).toMatchElement('div', { text: "Test your internet speed against AMN Language Services's data centers." });
    await htmlReport.attachScreenshot(terpPage, "Speed Test Displayed");
    await iwsPageObjects.clickOnMicrophoneButton(terpPage);
    await expect(terpPage).toMatchElement('div', { text: 'Test your microphone levels.' });
    await htmlReport.attachScreenshot(terpPage, "Microphone Levels Displayed");

  });



  it('SV-5299: Verify that user presented with "Test your microphone levels" indicator', async () => {

    await iwsPageObjects.clickOnDiagnosticButton(terpPage);
    await iwsPageObjects.clickOnMicrophoneButton(terpPage);
    await expect(terpPage).toMatchElement('div', { text: 'Test your microphone levels.' });
    await expect(terpPage).toMatchElement('canvas[width="200"]');

  });

  it('SV-11387: IWS | FE |Verify Ring settings moved to Settings > General tab', async () => {

    const settingsButton = await terpPage.$x('//div[text()=\'Settings\']');
    await settingsButton[0].click();
    await delay(2000);
    const ringButton = await terpPage.$x('//*[text()="Start Ringing"]');
    await ringButton[0].click();
    await delay(2000);
    await htmlReport.attachScreenshot(terpPage, "Ring settings moved to General tab");
  });

  it('SV-5300: Verify that user presented with "Preferred Device" dropdown, "Ringtone" dropdown, "Volume" function, "Start Ringing" button and "Reset to default" button', async () => {
    await expect(terpPage).toMatchElement('div[id="settings--ring-device"]');
    await expect(terpPage).toMatchElement('div[id="settings--ring-tone');
    await expect(terpPage).toMatchElement('span[class="bp5-slider-handle"]');
    //await expect(terpPage).toMatchElement('span', { text: 'Start Ringing' });
    await expect(terpPage).toMatchElement('span', { text: 'Reset to Default' });
    await htmlReport.attachScreenshot(terpPage, "Adjust Ring");

  });


  it('SV-5302: Verify that user can change ringtone by selecting it from "Ringtone" dropdown and play it by clicking on "Start Ringing" button', async () => {

    await delay(3000);
    const stopRingingButton = await terpPage.$x('//*[text()="Stop Ringing"]');
    await stopRingingButton[0].click();
    await htmlReport.attachScreenshot(terpPage, "Stop Ring");

  });

  it('SV-5303: Verify that user can change volume from 0 to 100 by using "Volume" functionality', async () => {

    const settingsButton = await terpPage.$x('//div[text()=\'Settings\']');
    await settingsButton[0].click();

    const ringButton = await terpPage.$x('//*[text()="Start Ringing"]');
    await ringButton[0].click();

    var i = 0;
    do {

      const volumeLevelButton = await terpPage.$x('//div[@class=\'bp5-slider-label\'][text()=' + i + ']');
      await volumeLevelButton[0].click();
      i += 10;
    } while (i <= 100);

    await htmlReport.attachScreenshot(terpPage, "Set Volumne Level");

  });

  it('SV-5304: Verify that if user click "Reset to default" the "Preferred Device", "Ringtone" and "Volume" will be reseted to default value', async () => {

    const resetDefaultButton = await terpPage.$x('//span[text()=\'Reset to Default\']');
    await resetDefaultButton[0].click();

    await expect(terpPage).toMatchElement('div', { text: 'Mamba' });
    await expect(terpPage).toMatchElement('span', { text: '50' });

    const stopRingingButton = await terpPage.$x('//*[text()="Stop Ringing"]');
    await stopRingingButton[0].click();

    await htmlReport.attachScreenshot(terpPage, "Reset Volume");
    await delay(2000);

  });

  it('SV-11103: IWS | Verify Increase Size of Unavailable Timer', async () => {

    const timestatus = await terpPage.$x('//*[text()="Time in Status"]');
    await timestatus[0].click();
    await htmlReport.attachScreenshot(terpPage, "Time in Status");
    await delay(2000);
    const clickedbtn = await terpPage.$x('//*[text()="Available"]');
    await clickedbtn[0].click();
    await delay(2000);
    const clickbtn = await terpPage.$x('//*[text()="Break"]');
    await clickbtn[0].click();
    await delay(4000);
    const clickedbtnn = await terpPage.$x('//*[text()="Break"]');
    await clickedbtnn[0].click();
    await delay(2000);
    const clickbtnn = await terpPage.$x('//*[text()="Available"]');
    await clickbtnn[0].click();
    await delay(4000);

  });

  /*it ('login and prep client', async () =>{
     await page.goto(`${config.url}/client`);
        await page.waitForSelector('input[name="username"]', { timeout: config.timeout }, { visible: true });
        await commandCenterPageObjects.login(page,config.clientUser1.username, config.clientUser1.password);
        await commandCenterPageObjects.checkifFreeAndCancelResumeDialog(page);
  });


  // login, kill any existing session, and then go unavailable
  it('login and prep terp2', async () => {
    await terp2Page.goto(`${config.url}/iws`);
    await terp2Page.waitForSelector('input[name="username"]', { timeout: config.timeout }, { visible: true });
    await terp2Page.type('input[name="username"]', config.terpUser4.username);
    await terp2Page.click('button');
    await delay(2000);
    await terp2Page.type('input[name="password"]', config.terpUser4.password);
    await terp2Page.click('button');
    await terp2Page.waitForNavigation({ waitUntil: 'networkidle2' });

    await expect(terp2Page).toMatchElement('div[role="tablist"]', {timeout:config.delay});

    // since we don't do any backend seeding yet, we need to
    // manually kill any existing sessions
    const isFree = await terp2Page.evaluate(async () => {
      const response = await fetch('/api/me/session/current');
      return response.status === 204;
    });

    if (isFree) {
      // go unavailable
      await expect(terp2Page).toMatchElement('div[role="tablist"]', {timeout:config.delay});
      await delay (2000);
      const click_bt = await terp2Page.$x('//*[text()="Unavailable"]');
      click_bt[0].click();
      await delay(2000);
      const click_bt12 = await terp2Page.$x('//*[text()="Transfer"]');
      click_bt12[0].click();
      await delay(2000);

    }
  });

  it('client dials', async () => {
    const b = await page.$x('//*[text()="Spanish"]');
    await b[0].click();
    
    //await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await expect(page).toMatch('Finding a match...', { timeout: config.timeout });
    await delay(10000);
  });


  // it('SV-5330, SV-5421: Verify that user getting "Video Session" notification with "Provider", "Enterprise", "Name", "Phone Number", "Language", "City", "State" info, "Decline" and "Accept"', async () => {	

  //   await expect(terpPage).toMatchElement('dt', {text: 'Provider:'},{timeout: config.timeout});	
  //   await expect(terpPage).toMatchElement('dt', {text: 'Enterprise:'},{timeout: config.timeout});	
  //   await expect(terpPage).toMatchElement('dt', {text: 'Name:'},{timeout: config.timeout});	
  //   //await expect(terpPage).toMatchElement('dt', {text: 'Phone Number:'},{timeout: config.timeout});	
  //   await expect(terpPage).toMatchElement('dt', {text: 'Language:'},{timeout: config.timeout});	
  //   await expect(terpPage).toMatchElement('dt', {text: 'City:'},{timeout: config.timeout});	
  //   await expect(terpPage).toMatchElement('dt', {text: 'State:'},{timeout: config.timeout});	
  //   await expect(terpPage).toMatchElement('span', {text: 'Decline'},{timeout: config.timeout});	
  //   await expect(terpPage).toMatchElement('span', {text: 'Accept'},{timeout: config.timeout});
  //   await htmlReport.attachScreenshot(terpPage, "Details On Notification");

  // });


  it('terp answers', async () => {
    
    await iwsPageObjects.iwsAcceptCall(terpPage, "Queue");
    await htmlReport.attachScreenshot(terpPage, "Terp Answers");

  });

  it('client has video', async () => {
    await expect(page).toMatchElement('#session--remote-video-container video', {
      timeout: config.timeout,
    });
    await htmlReport.attachScreenshot(terpPage, "Client Video");
  });

  it('terp has video', async () => {
    await expect(terpPage).toMatchElement('#session--remote-video-container video', {
      timeout: config.timeout,
    });
    await htmlReport.attachScreenshot(terpPage, "Terp Video");
  });


  it('SV-5400: Verify that user presented with client username in bottom right corner', async () => {

    await helperFuncs.verifyTextXpath(terpPage,"//span[@data-e2e='display-username1']",config.clientUser1.username);
    await htmlReport.attachScreenshot(terpPage, "Client's Username");

  });

  it('Skip Billing Questions', async () => {

    const skipBillingQuestionButton = await terpPage.$x("//span[text()='Skip for Emergency']");
    await skipBillingQuestionButton[0].click();

    await delay(3000);
    await expect(terpPage).toMatchElement('div', {text: 'Billing Questions have been answered.'}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(terpPage, "Billing Question Answered");

  });

  /*it('SV-5402: Verify if click on "Volume" button the session volume will go down to 0 and "Volume" adjuster will change to minimum', async () => {

    const inputValue = "50";
    await terpPage.evaluate(val => document.querySelector('input[type="range"]').value = val, inputValue);

    //const volumeButton = await terpPage.$x("//button[@title='Volume']");
    const volumeButton = await terpPage.$x("//button[contains(@title,'Volume')]");
    await volumeButton[0].click();

    await expect(terpPage).toMatchElement('input[type="range"][value="0"]', {timeout: config.timeout});
    await htmlReport.attachScreenshot(terpPage, "Adjust Volume");

  });

  it('SV-5407: Verify if click on "Digital Whiteboard" button, user will see whiteboard field, "Send", "Clear" buttons', async () => {

    const digitalWhiteBoardButton = await terpPage.$x("//button[@title='Digital Whiteboard']");
    await digitalWhiteBoardButton[0].click();
    await terpPage.waitForSelector('textarea[name="whiteboard"]', { visible: true });
    await expect(terpPage).toMatchElement('button[data-e2e="whiteboard-send-button"]', {timeout: config.timeout});
    await expect(terpPage).toMatchElement('button[data-e2e="whiteboard-clear-button"]', {timeout: config.timeout});
    await htmlReport.attachScreenshot(terpPage, "Digital Whiteboard Button");

  });

  it('SV-5408: Verify that user can send whitebaord message', async () => {

    const digitalWhiteBoardTextArea = await terpPage.$x("//textarea[@name='whiteboard']");
    await digitalWhiteBoardTextArea[0].type('Test Whiteboard');
    const digitalWhiteBoardSendButton = await terpPage.$x("//button[@data-e2e='whiteboard-send-button']");
    await digitalWhiteBoardSendButton[0].click();

    await terpPage.waitForXPath("//div[@id='session--remote-video-container']//following::span[contains(text(),'Digital Whiteboard Message Received')][1]//parent::div[1]", { timeout: config.timeout }, { visible: true });

    await helperFuncs.verifyTextXpath(terpPage,"//div[@id='session--remote-video-container']//following::span[contains(text(),'Digital Whiteboard Message Received')][1]//parent::div[1]","Digital Whiteboard Message Received:Test Whiteboard");
    await htmlReport.attachScreenshot(terpPage, "Send Whiteboard Message");
  });

  // it('SV-5408: Verify all participant should see the whiteboard message', async () => {

  //   await helperFuncs.verifyTextXpath(page,"//div[@class='video-textOverlayContent']//div","Test Whiteboard");
  //   await htmlReport.attachScreenshot(page, "Client Whiteboard Message");


  // });

  it('SV-5409: Verify if click on "Clear" button the whiteboard field should be cleared for all participants', async () => {

    const digitalWhiteBoardClearButton = await terpPage.$x("//button[@data-e2e='whiteboard-clear-button']");
    await digitalWhiteBoardClearButton[0].click();
    await htmlReport.attachScreenshot(terpPage, "Clear Whiteboard Message");

  });

  it('SV-5323: Verify that user presented with session "Details" dropdown which should include "Enterprise", "Type", "Language", "Location", "Provider", "Session Start", "Skills", "Join Duration(Estimate)"', async () => {	

    await expect(terpPage).toMatchElement('h4', {text: 'Enterprise'},{timeout: config.timeout});	
    await expect(terpPage).toMatchElement('h4', {text: 'Type'},{timeout: config.timeout});	
    await expect(terpPage).toMatchElement('h4', {text: 'Language'},{timeout: config.timeout});	
    await expect(terpPage).toMatchElement('h4', {text: 'Location'},{timeout: config.timeout});	
    await expect(terpPage).toMatchElement('h4', {text: 'Provider'},{timeout: config.timeout});	
    await expect(terpPage).toMatchElement('h4', {text: 'Session Start'},{timeout: config.timeout});	
    await expect(terpPage).toMatchElement('h4', {text: 'Join Duration (estimate)'},{timeout: config.timeout});
    await htmlReport.attachScreenshot(terpPage, "Session Details");

  });

  it('SV-5331: Verify that user presented with "Session" and "Facility" notes"', async () => {
    
    await expect(terpPage).toMatchElement('span', {text: 'Session Notes'},{timeout: config.timeout});
    await htmlReport.attachScreenshot(terpPage, "Session Notes");
    
  });


  it('SV-5334: Verify that user can add session note', async () => {
    
    const sessionNotedText = await terpPage.$x("//textarea[@placeholder='Enter session note']");
    await sessionNotedText[0].type('Test Note 1');
    const addNoteButton = await terpPage.$x("//span[text()='Add Note']");
    await addNoteButton[0].click();
    await htmlReport.attachScreenshot(terpPage, "Added Session Notes");
  });


  it('SV-5332: Verify that number of notes is the same as actual number of notes', async () => {
    
    await terpPage.waitForXPath("//textarea[@placeholder='Enter session note']", { visible: true });
    await expect(terpPage).toMatchElement('div', {text: 'Test Note 1'},{timeout: config.timeout});
    await htmlReport.attachScreenshot(terpPage, "Verified Session Notes");
    
  });

  it('SV-5333: Verify that if user click on "Session" note, user will be presented with "Do not submit personal health information" message, submitted session notes, "Enter session note" field, "Add Note" button', async () => {
    
    await expect(terpPage).toMatchElement('p', {text: 'Do not submit personal health information.'}, {timeout: config.timeout});
    await expect(terpPage).toMatchElement('div', {text: 'Test Note 1'}, {timeout: config.timeout});
    await expect(terpPage).toMatchElement('textarea[placeholder="Enter session note"]', {timeout: config.timeout});
    await expect(terpPage).toMatchElement('span', {text: 'Add Note'}, {timeout: config.timeout});
    
  });

  it('SV-5410: Verify if click on "Collapse" button, the left and right sides will collapse.', async () => {
    
    await iwsPageObjects.clickOnCollapseButton(terpPage);
    await expect(terpPage).toMatchElement(iwsPageObjects.callViewLeftSide, {timeout: config.timeout}, { visible: false });
    await expect(terpPage).toMatchElement(iwsPageObjects.callViewRightSide, {timeout: config.timeout}, { visible: false });
    await htmlReport.attachScreenshot(terpPage, "Verify Expanded session");

    await iwsPageObjects.clickOnExpandButton(terpPage);
    await expect(terpPage).toMatchElement(iwsPageObjects.callViewLeftSide, {timeout: config.timeout}, { visible: true });
    await expect(terpPage).toMatchElement(iwsPageObjects.callViewRightSide, {timeout: config.timeout}, { visible: true });
    await htmlReport.attachScreenshot(terpPage, "Verify Collapsed session");

    
  });  

  it('SV-5348: Verify that user presented with "Session Controls" dropdown', async () => {
    
    await expect(terpPage).toMatchElement('span', {text: 'Session Controls'}, {timeout: config.timeout});
    
  });

  it('SV-5349: Verify that "Session Controls" includes "Phone", "Transfer Session", "Add Interpreter" tabs', async () => {
    await expect(terpPage).toMatchElement('#bp5-tab-title_SessionControls_phoneTab', {timeout: config.timeout});
    await expect(terpPage).toMatchElement('#bp5-tab-title_SessionControls_transferTab', {timeout: config.timeout});
    await expect(terpPage).toMatchElement('#bp5-tab-title_SessionControls_terpTab', {timeout: config.timeout});
    
  });

  it('SV-5350: Verify that if user click on "Phone" tab user will be presented with "Add a phone participant to the session..." message, "International Calling" status, "Enter phone number" field, and "Call" button', async () => {
    await terpPage.click('#bp5-tab-title_SessionControls_phoneTab');
    await expect(terpPage).toMatchElement('strong', {text: 'Add a phone participant'}, {timeout: config.timeout});
    await expect(terpPage).toMatchElement('p', {text: ' to the session. You will remain in session.'}, {timeout: config.timeout});
    await expect(terpPage).toMatchElement('span', {text: 'International Calling:'}, {timeout: config.timeout});
    await expect(terpPage).toMatchElement('input[placeholder="Enter phone number"]', {timeout: config.timeout});
    await expect(terpPage).toMatchElement('span', {text: 'Call'}, {timeout: config.timeout});
    
  });

  it('SV-5352: Verify that if "International Calling" set to "Enabled" (Django admin config) user can make international calls', async () => {
    await delay(4000);
    await expect(terpPage).toMatchElement('span', {text: 'Enabled'}, {timeout: config.timeout});
    
  });

  it('SV-5354: Verify that "Call" button disabled if full phone number is not entered', async () => {
    await expect(terpPage).toMatchElement('button[class="bp5-button bp5-fill bp5-intent-primary"]', {timeout: config.timeout});
    
  });

  it('SV-5356: Verify that if user click on "Interpreter" tab, user will be presented with "Add an interpreter to the session. You will remain in session.Do not use for ..." message, "Create New Request" button', async () => {
    await terpPage.click('#bp5-tab-title_SessionControls_terpTab');
    await expect(terpPage).toMatchElement('strong', {text: 'Add an interpreter'}, {timeout: config.timeout});
    //await expect(terpPage).toMatchElement('p', {text: ' to the session. You will remain in session. '}, {timeout: config.timeout});
    await expect(terpPage).toMatchElement('strong', {text: 'Do not use for transfers.'}, {timeout: config.timeout});
    await expect(terpPage).toMatchElement('span', {text: 'Create New Request'}, {timeout: config.timeout});
    
  });

  it('SV-5357: Verify that if click on "Create New Request" button, the "Language" dropdown with languages will be presented.', async () => {
    await terpPage.click('#bp5-tab-title_SessionControls_terpTab');
    const createNewRequestButton = await terpPage.$x("//span[text()='Create New Request']");
    await createNewRequestButton[0].click();
    await terpPage.waitForSelector('form[autocomplete="off"]', { visible: true });
    await delay(2000);
    await expect(terpPage).toMatchElement('label', {text: 'Language'}, {timeout: config.timeout});
    const languageDropdown = await terpPage.$x('//label[text()=\'Language\']//following::input[1]');
    await languageDropdown[0].click();
    await languageDropdown[0].type(config.language);
    await terpPage.keyboard.press('Enter');
    await delay(5000);
    await expect(terpPage).toMatchElement('label', {text: 'Interpreter Matching'}, {timeout: config.timeout});
    const requestInterpreterButton = await terpPage.$x('//span[text()=\'Request Interpreter\']');
    await requestInterpreterButton[0].click();
  });

  it('SV-5359: Verify that user can cancel Interpreter request by using "Cancel" button', async () => {
    await terpPage.waitForXPath("//span[text()='Cancel']", { visible: true });
    await terpPage.waitForXPath("//span[text()='Cancel']", { timeout: config.timeout }, { visible: true });
    const cancelButton = await terpPage.$x('//span[text()=\'Cancel\']');
    await terpPage.waitFor(3000);
    await cancelButton[0].click();
    await delay(2000);
    await expect(terpPage).toMatchElement('p', {text: 'Canceled Search'}, {timeout: config.timeout});
    
  });

  it('SV-5364: Verify if click on "Transfer" tab, user will be presented with "What kind of session do you want to transfer?" with a transfer type dropdown', async () => {
    await terpPage.click('#bp5-tab-title_SessionControls_transferTab');
    await expect(terpPage).toMatchElement('label', {text: 'What kind of session do you want to transfer?'}, {timeout: config.timeout});
    await expect(terpPage).toMatchElement('div', {text: 'Select a transfer type'}, {timeout: config.timeout});
  });

  it('SV-5360: Verify if click on "New Session", user will be presented with "Language", "Skills", "Reason for transfer", transfer, back button', async () => {
    await terpPage.click('#bp5-tab-title_SessionControls_transferTab');
    const selectTransferTypeDropdown = await terpPage.$x("//div[text()='Select a transfer type']");
    await selectTransferTypeDropdown[0].click();
    const selectTransferType = await terpPage.$x('//*[text()=\'New Session\']');
    await selectTransferType[0].click();
    await terpPage.waitForSelector('form[autocomplete="off"]', { visible: true });
    await delay(2000);
    await expect(terpPage).toMatchElement('label', {text: 'Language'}, {timeout: config.timeout});
    const languageDropdown = await terpPage.$x('//label[text()=\'Language\']//following::div[1]');
    await languageDropdown[0].click();
    const selectLanguage = await terpPage.$x('//*[text()=\'Arabic\']');
    await selectLanguage[0].click();
    await expect(terpPage).toMatchElement('label', {text: 'Reason for Transfer'}, {timeout: config.timeout});
    const reasonForTransferDropdown = await terpPage.$x('//label[text()=\'Reason for Transfer\']//following::div[1]');
    await reasonForTransferDropdown[0].click();
    await delay(2000);
    const selectReasonForTransfer = await terpPage.$x('//*[text()=\'Interpreter Emergency\']');
    await selectReasonForTransfer[0].click();
    await expect(terpPage).toMatchElement('span', {text: 'Back'}, {timeout: config.timeout});
    await expect(terpPage).toMatchElement('span', {text: 'Transfer'}, {timeout: config.timeout});
    const backButton = await terpPage.$x('//span[text()=\'Back\']');
    await backButton[0].click();

  });

  it('SV-5365: Verify if click on "Session in progress", user will be presented with "Interpreter" dropdown, "Refresh Interpreter List" button, "Notes" field, "Reason for transfer", "Transfer" button', async () => {
    await terpPage.click('#bp5-tab-title_SessionControls_transferTab');
    await delay(2000);
    const selectTransferTypeDropdown = await terpPage.$x("//div[text()='Select a transfer type']");
    await selectTransferTypeDropdown[0].click();
    const selectTransferType = await terpPage.$x('//*[text()=\'New Session\']');
    await selectTransferType[0].click();
    await terpPage.waitForSelector('form[autocomplete="off"]', { visible: true });
    await delay(2000);
    //await expect(terpPage).toMatchElement('label', {text: 'Interpreter'}, {timeout: config.timeout});
    //await expect(terpPage).toMatchElement('span', {text: 'Refresh Interpreter List'}, {timeout: config.timeout});
    await expect(terpPage).toMatchElement('label', {text: 'Reason for Transfer'}, {timeout: config.timeout});
    await expect(terpPage).toMatchElement('span', {text: 'Back'}, {timeout: config.timeout});
    await expect(terpPage).toMatchElement('span', {text: 'Transfer'}, {timeout: config.timeout});
    const backButton = await terpPage.$x('//span[text()=\'Back\']');
    await backButton[0].click();
    await delay(2000);
  });  

  it('terp2 goes available', async () => {
    // go available
    const click_bt0 = await terp2Page.$x('//*[text()="Transfer"]');
    click_bt0[0].click();
    await delay(2000);
    const click_bt11 = await terp2Page.$x('//*[text()="Available"]');
    click_bt11[0].click();
    await delay(4000);

    });

  it('terp adds party', async () => {
    await terpPage.waitForSelector('#bp5-tab-title_SessionControls_terpTab', {visible: true});
    await terpPage.click('#bp5-tab-title_SessionControls_terpTab');
    const createNewButton = await terpPage.$x("//span[text()='Create New']");
    await createNewButton[0].click();
    const createRequestButton = await terpPage.$x("//span[text()='Create New Request']");
    await createRequestButton[0].click();
    await delay(4000);
    const languageField = await terpPage.$x('//label[text()=\'Language\']//following::div[4]');
    await languageField[0].click();
    await delay(1000);
    await languageField[0].type(config.language);
    await terpPage.keyboard.press('Enter');
    await delay(3000);
    const requestInterpreterButton = await terpPage.$x("//span[contains(text(),'Request Interpreter')]");
    await requestInterpreterButton[0].click();
    await terpPage.waitForSelector('p', { text: 'Found Interpreter.  Waiting for Accept ...' });
    await htmlReport.attachScreenshot(terpPage, "Found Interpreter");
    await delay(10000);
  });

  it('terp2 answers', async () => {
    
    await iwsPageObjects.iwsAcceptCall(terp2Page, "Add");
    await htmlReport.attachScreenshot(terp2Page, "Terp2 Accepts Call");

  });

  it('terp2 has video', async () => {
    await expect(terp2Page).toMatchElement('#session--remote-video-container video', {
      timeout: config.timeout,
    });
    await htmlReport.attachScreenshot(terp2Page, "Terp2 Video");
    await delay(2000);
  });

  it('SV-5368: Verify if click on "Participants" dropdown user will be presented with list of all participants on the session', async () => {
    
    await expect(terpPage).toMatchElement('span', {text: 'Participants'}, {timeout: config.timeout});
    await expect(terpPage).toMatchElement('span', {text: '3 / 3'}, {timeout: config.timeout});

  });

  it('SV-5369: Verify that user can control clients Video/Audio mute function by clicking on sub-menu option', async () => {
    
    await expect(terpPage).toMatchElement('div', {text: 'Unmute Video'}, {timeout: config.timeout});
    await expect(terpPage).toMatchElement('div', {text: 'Mute Video'}, {timeout: config.timeout});

  });

  /*it('SV-5370: Verify if click on "Keypad" dropdown user will be presented with "To select an option during a phone tree, please click the corresponding number. For dial outs ..." message, keypad, "enter digits" field', async () => {
    
    const keypadDropdown = await terpPage.$x("//button//span[text()='Keypad']");
    await keypadDropdown[0].click();
    await expect(terpPage).toMatchElement('div', {text: 'To '}, {timeout: config.timeout});
    await expect(terpPage).toMatchElement('strong', {text: 'select an option'}, {timeout: config.timeout});
    await expect(terpPage).toMatchElement('div', {text: ' during a phone tree, please click the corresponding number. '}, {timeout: config.timeout});
    await expect(terpPage).toMatchElement('strong', {text: 'For dial outs'}, {timeout: config.timeout});
    await expect(terpPage).toMatchElement('div', {text: 'please select '}, {timeout: config.timeout});
    await expect(terpPage).toMatchElement('strong', {text: 'Session Controls/Phone'}, {timeout: config.timeout});
    await expect(terpPage).toMatchElement('div', {text: ' instead.'}, {timeout: config.timeout});

  });

  it('SV-5371: Verify that user can clear "enter digits" field by using X button', async () => {
    
    await expect(terpPage).toMatchElement('span', {text: 'Enter digits'}, {timeout: config.timeout});
    const oneKeypadButton = await terpPage.$x("//span[text()='Keypad']//following::div[text()='1']");
    await oneKeypadButton[0].click();
    const twoKeypadButton = await terpPage.$x("//span[text()='Keypad']//following::div[text()='2']");
    await twoKeypadButton[0].click();
    const threeKeypadButton = await terpPage.$x("//span[text()='Keypad']//following::div[text()='3']");
    await threeKeypadButton[0].click();
    const fourKeypadButton = await terpPage.$x("//span[text()='Keypad']//following::div[text()='4']");
    await fourKeypadButton[0].click();
    const fiveKeypadButton = await terpPage.$x("//span[text()='Keypad']//following::div[text()='5']");
    await fiveKeypadButton[0].click();
    await expect(terpPage).toMatchElement('span', {text: '12345'}, {timeout: config.timeout});
    await htmlReport.attachScreenshot(terpPage, "Used Keypad");
    await delay(2000);
    await htmlReport.attachScreenshot(terpPage, "Cleared Keypad");
  });

  it('SV-5372: Verify if click on "Incident Report" dropdown user will be presented with "Technical" and "Operational" tabs', async () => {
    
    const incidentReportDropdown = await terpPage.$x("//button//span[text()='Incident Report']");
    await incidentReportDropdown[0].click();
    await expect(terpPage).toMatchElement('#bp5-tab-title_Incident_technicalIncidentTab', {timeout: config.timeout});
    await expect(terpPage).toMatchElement('#bp5-tab-title_Incident_operationalIncidentTab', {timeout: config.timeout});

  });

  it('SV-5385: Verify if click on "Technical" tab user will be presented with "Issues related to session quality will be sent to CST" message, "Create New Incident" button', async () => {
    
    const technicalIncidentTab = await terpPage.$x("//div[@id='bp5-tab-title_Incident_technicalIncidentTab']");
    await technicalIncidentTab[0].click();
    await expect(terpPage).toMatchElement('div', {text: 'Issues related to session '}, {timeout: config.timeout});
    await expect(terpPage).toMatchElement('strong', {text: 'quality'}, {timeout: config.timeout});
    //await expect(terpPage).toMatchElement('div', {text: ' will be sent to CST.'}, {timeout: config.timeout});
    await expect(terpPage).toMatchElement('span', {text: 'Create New Incident'}, {timeout: config.timeout});

  });

  it('SV-5392: Verify if click on "Create New Incident" button user will be presented with different type of questions, "Comments" field, "Reset" button, "Submit incident" buttons', async () => {
    
    const createNewIncidentButton = await terpPage.$x("//div[@id='bp5-tab-panel_Incident_technicalIncidentTab']//span[text()='Create New Incident']");
    await createNewIncidentButton[0].click();
    await terpPage.waitForXPath("//label[text()='Technical Question 1']//following::div[1]", {timeout: config.timeout}, { visible: true });
    const questionOneDropDown = await terpPage.$x("//label[text()='Technical Question 1']//following::div[1]");
    await questionOneDropDown[0].click();
    await terpPage.keyboard.press('Enter');
    const questionTwoDropDown = await terpPage.$x("//label[text()='Technical Question 2']//following::div[1]");
    await questionTwoDropDown[0].click();
    await terpPage.keyboard.press('Enter');
    const commentsTextArea = await terpPage.$x("//textarea[@name='message']");
    await commentsTextArea[0].type('Test Comments');
    await expect(terpPage).toMatchElement('span', {text: 'Reset'}, {timeout: config.timeout});
    await expect(terpPage).toMatchElement('span', {text: 'Submit Incident'}, {timeout: config.timeout});

  });

  it('SV-5393: Verify that user can submit "Technical" incident report', async () => {
    
    const submitIncidentButton = await terpPage.$x("//button[@data-e2e='submit-incident']");
    await submitIncidentButton[0].click();
    await terpPage.waitForSelector('div[data-e2e="alert-box"]', { visible: true });
    await delay(2000);
    await expect(terpPage).toMatchElement('p', {text: 'Your incident report has been sent.'}, {timeout: config.timeout});
    await htmlReport.attachScreenshot(terpPage, "Technical Incident Report Submitted");

  });

  it('SV-5394: Verify if user click "Reset" button, all answered questions will be cleared', async () => {
    
    const technicalIncidentTab = await terpPage.$x("//div[@id='bp5-tab-title_Incident_technicalIncidentTab']");
    await technicalIncidentTab[0].click();
    await delay(3000);
    const createNewIncidentButton = await terpPage.$x("//div[@id='bp5-tab-panel_Incident_technicalIncidentTab']//span[text()='Create New Incident']");
    await createNewIncidentButton[0].click();
    await terpPage.waitFor(2000);
    await terpPage.waitForXPath("//label[text()='Technical Question 1']//following::div[1]", {timeout: config.timeout}, { visible: true });
    const question1Dropdown = await terpPage.$x("//label[text()='Technical Question 1']//following::div[1]");
    await question1Dropdown[0].click();
    await terpPage.keyboard.press('Enter');
    const question2Dropdown = await terpPage.$x("//label[text()='Technical Question 2']//following::div[1]");
    await question2Dropdown[0].click();
    await terpPage.keyboard.press('Enter');
    const commentsTextArea = await terpPage.$x("//textarea[@name='message']");
    await commentsTextArea[0].type('Test Comments');
    const resetIRButton = await terpPage.$x("//div[@id='bp5-tab-panel_Incident_technicalIncidentTab']//span[text()='Reset']");
    await resetIRButton[0].click();
    await expect(terpPage).toMatchElement('div', {text: 'Select...'}, {timeout: config.timeout});
    await htmlReport.attachScreenshot(terpPage, "Reset Technical Report Form");

  });

  it('SV-5395: Verify if click on "Operational" tab user will be presented with "Issues related to session users will be sent to Account management or Language Operations." message, "Create New Incident" button', async () => {
    
    const operationalIncidentTab = await terpPage.$x("//div[@id='bp5-tab-title_Incident_operationalIncidentTab']");
    await operationalIncidentTab[0].click();
    await expect(terpPage).toMatchElement('div', {text: 'Issues related to session '}, {timeout: config.timeout});
    await expect(terpPage).toMatchElement('strong', {text: 'users'}, {timeout: config.timeout});
    //await expect(terpPage).toMatchElement('div', {text: ' will be sent to Account Management or Language Operations.'}, {timeout: config.timeout});
    await expect(terpPage).toMatchElement('span', {text: 'Create New Incident'}, {timeout: config.timeout});

  });

  it('SV-5396: Verify if click on "Create New Incident" button user will be presented with "Do not submit personal health information." message, "Comments" field, "Reset" button, "Submit incident" buttons', async () => {
    
    const createNewIncidentButton = await terpPage.$x("//div[@id='bp5-tab-panel_Incident_operationalIncidentTab']//span[text()='Create New Incident']");
    await createNewIncidentButton[0].click();
    await terpPage.waitForXPath("//label[text()='Operational Question 1']//following::div[1]", {visible: true});
    const questionOneDropDown = await terpPage.$x("//label[text()='Operational Question 1']//following::div[1]");
    await questionOneDropDown[0].click();
    await terpPage.keyboard.press('Enter');
    const commentsTextArea = await terpPage.$x("//div[@id='bp5-tab-panel_Incident_operationalIncidentTab']//textarea[@name='message']");
    await commentsTextArea[0].type('Test Comments');
    await expect(terpPage).toMatchElement('span', {text: 'Reset'}, {timeout: config.timeout});
    await expect(terpPage).toMatchElement('span', {text: 'Submit Incident'}, {timeout: config.timeout});

  });

  it('SV-5397: Verify that user can submit "Operational" incident report', async () => {
    
    const submitIncidentButton = await terpPage.$x("//div[@id='bp5-tab-panel_Incident_operationalIncidentTab']//button[@data-e2e='submit-incident']");
    await submitIncidentButton[0].click();
    await terpPage.waitForXPath("//div[@id='bp5-tab-panel_Incident_operationalIncidentTab']//div[@data-e2e='alert-box']", { visible: true });
    
    await expect(terpPage).toMatchElement('p', {text: 'Your incident report has been sent.'}, {timeout: config.timeout});
    await htmlReport.attachScreenshot(terpPage, "Operational Incident Report Submitted");

  });

  it('SV-5398: Verify if user click "Reset" button, the "Comments" field will be cleared', async () => {
    
    const operationalIncidentTab = await terpPage.$x("//div[@id='bp5-tab-title_Incident_operationalIncidentTab']");
    await operationalIncidentTab[0].click();

    const createNewIncidentButton = await terpPage.$x("//div[@id='bp5-tab-panel_Incident_operationalIncidentTab']//span[text()='Create New Incident']");
    await createNewIncidentButton[0].click();
    await terpPage.waitForXPath("//label[text()='Operational Question 1']//following::div[1]", {visible: true});
    await page.waitFor(4000);
    const dummyQuestionOneDropDown = await terpPage.$x("//label[text()='Operational Question 1']//following::div[1]");
    await dummyQuestionOneDropDown[0].click();
    await terpPage.keyboard.press('Enter');
    const commentsTextArea = await terpPage.$x("//div[@id='bp5-tab-panel_Incident_operationalIncidentTab']//textarea[@name='message']");
    await commentsTextArea[0].type('Test Comments');
    const resetOIButton = await terpPage.$x("//div[@id='bp5-tab-panel_Incident_operationalIncidentTab']//span[text()='Reset']");
    await resetOIButton[0].click();
    await expect(terpPage).toMatchElement('div', {text: 'Select...'}, {timeout: config.timeout});
    await htmlReport.attachScreenshot(terpPage, "Reset Operational Report Form");

  });  

  it('SV-5411: Verify if click on "End" button, the session for this user will end', async () => {
    await terp2Page.waitForSelector('button[title="End"]', { visible: true });
    const endVideoButton = await terp2Page.$x("//button[@type='button'][@title='End']");
    await endVideoButton[0].click();
    await terp2Page.waitForSelector('button[data-e2e="confirm-dialog-accept"]', { visible: true });
    const confirmButton = await terp2Page.$x("//button[@type='button']//span[text()='Confirm']");
    await confirmButton[0].click();

    await delay(3000);
   // await htmlReport.attachScreenshot(terp2Page, "End Terp2 Session");
    
  });

  it('terp2 go Available', async () => {
    
    await terp2Page.waitForSelector('button[class="bp5-button bp5-intent-success"]', { timeout: config.timeout });
    await expect(terp2Page).toMatchElement('span', {text: 'Exit Wrapping'},
      {
        timeout: config.timeout,
      });
    // go available
    const goOnlineNowButton = await terp2Page.$x("//span[text()='Exit Wrapping']");
    await goOnlineNowButton[0].click();
    await expect(terp2Page).toMatchElement('span', {text: 'Available'},
      {
        timeout: config.timeout,
      });
  });

  it('SV-5366: Verify that user can make a transfer by selecting available terp from dropdown list', async () => {
    await terpPage.waitForSelector('#session--remote-video-container video',{ timeout: config.timeout });
    await terpPage.waitForSelector('#bp5-tab-title_SessionControls_transferTab',{ timeout: config.timeout });
    await terpPage.click('#bp5-tab-title_SessionControls_transferTab');
    const selectTransferTypeDropdown = await terpPage.$x("//div[text()='Select a transfer type']");
    await selectTransferTypeDropdown[0].click();
    const selectTransferType = await terpPage.$x('//*[text()=\'Direct Transfer\']');
    await selectTransferType[0].click();
    await terpPage.waitForSelector('form[autocomplete="off"]', { visible: true });
    await delay(2000);
    const interpreterField = await terpPage.$x("//label[text()=\'Interpreter\']//following::div[4]");
    await interpreterField[0].click();
    await delay(2000);
    const selectInterpreter = await terpPage.$x('//*[text()=\'#847748898\']');
    await selectInterpreter[0].click();
    await delay(2000);
    await terpPage.keyboard.press('Enter');
    await delay(2000);
    const reasonForTransferField = await terpPage.$x("//label[text()=\'Reason for Transfer\']//following::div[4]");
    await reasonForTransferField[0].click();
    await delay(2000);
    const selectReason = await terpPage.$x('//*[text()=\'Interpreter Emergency\']');
    await selectReason[0].click();
  });

  it('SV-5367: Verify that user can make a transfer with adding note', async () => {
    
    const transferNotesTextarea = await terpPage.$x("//textarea[@name='notes']");
    await transferNotesTextarea[0].type('Transfer Notes');
    const transferButton = await terpPage.$x("//button[@type='submit']//span[text()='Transfer']");
    await transferButton[0].click();
    await htmlReport.attachScreenshot(terpPage, "Transfer Notes");  
    await delay(4000);
  });

  // it('SV-5426: Verify that user getting "Video Transfer" call notification', async () => {
    
  //   await expect(terp2Page).toMatchElement('span[icon="swap-horizontal"]' ,{timeout: config.timeout});
  //   await helperFuncs.verifyTextXpath(terp2Page,"//span[@icon='swap-horizontal']//following::span[1]","Video Transfer");
  //   await htmlReport.attachScreenshot(terp2Page, "Terp2 Video Transfer Notification");
  // });

  // it('SV-5427: Verify that "Video Transfer" notification includes "Provider", "Enterprise", "Name", "Language", "City", "State", Reason "Requested by" Info, "Decline", "Accept" and "X" buttons', async () => {	

  //   //await expect(terp2Page).toMatchElement('dt', {text: 'Provider:'},{timeout: config.timeout});	
  //   await expect(terp2Page).toMatchElement('dt', {text: 'Enterprise:'},{timeout: config.timeout});	
  //   //await expect(terp2Page).toMatchElement('dt', {text: 'Name:'},{timeout: config.timeout});	
  //   await expect(terp2Page).toMatchElement('dt', {text: 'City:'},{timeout: config.timeout});	
  //   await expect(terp2Page).toMatchElement('dt', {text: 'State:'},{timeout: config.timeout});
  //   //await expect(terp2Page).toMatchElement('dt', {text: 'Requested By:'},{timeout: config.timeout});
  //   await expect(terp2Page).toMatchElement('dt', {text: 'Reason:'},{timeout: config.timeout});
  //   await helperFuncs.verifyTextXpath(terp2Page,"//div[@class='bp3-dialog-footer']//preceding::div[1]","Transfer Notes");
  //   await expect(terp2Page).toMatchElement('span', {text: 'Decline'},{timeout: config.timeout});	
  //   await expect(terp2Page).toMatchElement('span', {text: 'Accept'},{timeout: config.timeout});
  //   await expect(terp2Page).toMatchElement('span[icon="small-cross"]',{timeout: config.timeout});
    

  // });

  // it('SV-5428: Verify that if user request transfer, user will stay in session until call is not accepted by another terp', async () => {	

  //   await terpPage.waitForXPath("//span[@id='button--listbox-input--2']//span[@icon='caret-down']", { timeout: config.timeout }, { visible: true });
  //   await helperFuncs.verifyTextXpath(terpPage,"//span[@id='button--listbox-input--2']//span[2]","In-Session");
  //   await htmlReport.attachScreenshot(terpPage, "Terp Stay In Session Till Terp2 Accepts Call");	
  
  // });

  it('terp2 answers transfer call', async () => {
    
    const [accept_button_1] = await terp2Page.$x("/html/body/div[2]/div/div[3]/div/div[3]/div/button[2]/span");
        if (!accept_button_1) {
        throw new Error("Accept button not found");
        }
      await accept_button_1.click();
      await delay(3000);
  });

  it('terp2 has video', async () => {
    await expect(terp2Page).toMatchElement('#session--remote-video-container', {
      timeout: config.timeout
    });
    await htmlReport.attachScreenshot(terp2Page, "Terp2 Video");
    await delay(4000);
  });

  it('terp has video ended, gets to station and set available', async () => {
    const changeSt = await terpPage.$x('//*[text()="Unavailable"]');
    changeSt[0].click();
    await delay(2000);
    const click_bt11 = await terpPage.$x('//*[text()="Available"]');
    click_bt11[0].click();
    await delay(3000);
  });

  it('SV-5361: Verify if click on "Create New Request" button, user will be presented with "Language" and "Skills" dropdown', async () => {
    await terp2Page.waitForSelector('#session--remote-video-container',{ timeout: config.timeout });
    await terp2Page.waitForSelector('#bp5-tab-title_SessionControls_transferTab',{ timeout: config.timeout });
    await terp2Page.click('#bp5-tab-title_SessionControls_transferTab');
    const selectTransferTypeDropdown = await terp2Page.$x("//div[text()='Select a transfer type']");
    await selectTransferTypeDropdown[0].click();
    const selectTransferType = await terp2Page.$x('//*[text()=\'New Session\']');
    await selectTransferType[0].click();
    await terp2Page.waitForSelector('form[autocomplete="off"]', { visible: true });
    await delay(2000);
    await expect(terp2Page).toMatchElement('label', {text: 'Language'}, {timeout: config.timeout});
    await expect(terp2Page).toMatchElement('label', {text: 'Skills'}, {timeout: config.timeout});
    await expect(terp2Page).toMatchElement('label', {text: 'Reason for Transfer'}, {timeout: config.timeout});
    await delay(2000);
  });


  it('SV-5429: Verify that if user request requeue, user will drop from session', async () => {	

      await terpPage.waitForXPath("//video", { timeout: config.timeout }, { visible: true });
    //await helperFuncs.verifyTextXpath(terpPage,"//span[@id='button--listbox-input--2']//span[2]","Available");
      await htmlReport.attachScreenshot(terpPage, "User Droped From Session");
      await delay(3000);
  });


  it('SV-5362: Verify that user can make requeue by selecting language and skills', async () => {
    
    const languageField = await terp2Page.$x("//label[text()='Language']//following::div[4]");
    await languageField[0].click();
    await delay(2000);
    await languageField[0].type("Spanish");
    await delay(2000);
    await terp2Page.keyboard.press('Enter');
    await delay(2000);
    const reasonForTransferField = await terp2Page.$x("//label[text()='Reason for Transfer']//following::div[4]");
    await reasonForTransferField[0].click();
    await terp2Page.keyboard.press('Enter');
    const transferButton = await terp2Page.$x("//button[@type='submit']//span[text()='Transfer']");
    await transferButton[0].click();
    await delay(15000);
  });

  it('SV-5425: Verify that "Video Requeue" notification includes "Provider", "Enterprise", "Name", "Phone Number", "Language", "City", "State" Info, Reason"Decline", "Accept" and "X" buttons', async () => {	

        await expect(terpPage).toMatchElement('dt', {text: 'Enterprise:'},{timeout: config.timeout});	
        await expect(terpPage).toMatchElement('dt', {text: 'Name:'},{timeout: config.timeout});	
        await expect(terpPage).toMatchElement('dt', {text: 'Language:'},{timeout: config.timeout});	
        await expect(terpPage).toMatchElement('dt', {text: 'City:'},{timeout: config.timeout});	
        await expect(terpPage).toMatchElement('dt', {text: 'State:'},{timeout: config.timeout});	
  });

  it('SV-13503: IWS | BE | Verify Only one Reason value should display in incoming dialogue when we transfer a session to new session', async () => {	  
        
        await expect(terpPage).toMatchElement('dt', {text: 'Reason'},{timeout: config.timeout});
        await expect(terpPage).toMatchElement('dd', {text: 'Tech issues'},{timeout: config.timeout});
        await expect(terpPage).toMatchElement('span', {text: 'Decline'},{timeout: config.timeout});	
        await expect(terpPage).toMatchElement('span', {text: 'Accept'},{timeout: config.timeout});
        await htmlReport.attachScreenshot(terpPage, "Details On Notification");
        await delay(2000);
        await expect(page).toMatchElement('h3', {text: 'Requeue to Spanish'},{timeout: config.timeout});
        await delay(2000);

  });

  it('terp answers requeue call', async () => {
    
      //await iwsPageObjects.iwsAcceptCall(terpPage, "Requeue");
      //await iwsPageObjects.iwsAcceptCall(terpPage, "Queue");

      const acceptbtn = await terpPage.$x('//*[text()="Accept"]');
      await acceptbtn[0].click();
      await delay(3000);

  });

  it('terp has video', async () => {
    await terpPage.$x('//*[text()="session--remote-video-container"]');
          await htmlReport.attachScreenshot(terpPage, "Terp1 Video");
          await delay(2000);
  });

  it('SV-5363: Verify that after user did requeue, user will be disconnected from the session', async () => {
    
    await delay(2000);
    //await terp2Page.waitForXPath("//span[@id='button--listbox-input--2']//span[2]", { timeout: config.timeout }, { visible: true });
    await terp2Page.waitForSelector('span', {text:'Available'}, { timeout: config.timeout });
    await expect(terp2Page).toMatchElement('span', {text: 'Available'}, { timeout: config.timeout });
    await delay(4000);
  }); 

  

  /*   ----------it('login and prep csr', async () => {
    await csrPage.goto(`${config.url}/csr`);

    await csrPageObjects.loginToCSR(csrPage, config.csrUser1.username, config.csrUser1.password);
    
    const isFree = await csrPage.evaluate(async () => {
      const response = await fetch('/api/me/session/current');
    return response.status === 204;
    });
    if (isFree) {
      //go available
      await csrPageObjects.csrChangeUserStatus(csrPage, "Available")
      return;
    }
  });

  it('SV-5355: Verify that user can make PSTN call.', async () => { 

    await iwsPageObjects.doPSTNCall(terpPage, config.csrGenericPhoneNumber);
    await htmlReport.attachScreenshot(terpPage, "PSTN Call To CSR Initiated");
 
  });

  it('SV-7291: Verify Outbound PSTN calls Can\'t Be Answered after Interpreter Hangs Up', async () => { 

    await csrPage.waitFor(3000);
    await csrPage.waitForXPath("//div[@class='ui tiny modal transition visible active']//div[@class='header']", { timeout: config.timeout }, { visible: true });
    await helperFuncs.verifyTextXpath(csrPage,"//div[@class='ui tiny modal transition visible active']//div[@class='header']","Incoming Call");
    await htmlReport.attachScreenshot(csrPage, "PSTN Call Notification To CSR");

    await iwsPageObjects.hangupLastPSTNCall(terpPage, config.csrGenericPhoneNumber);
    await csrPage.waitFor(1500);
    await expect(csrPage).toMatchElement('h5', {text: 'Call Canceled'}, { timeout: 5000 }, { visible: true });
    await htmlReport.attachScreenshot(csrPage, "Call To CSR Cancelled");
    await htmlReport.attachScreenshot(terpPage, "PSTN Call To CSR Hangup");
    
  });  ------*/

  /*it('client ends video and returns to homepage', async () => {
    const endcall = await page.$x('//*[text()="End"]');
    await endcall[0].click();
    await delay(4000);
    //await page.waitForXPath("//i[text()=' Skip to Dashboard']", { timeout: config.timeout }, { visible: true });
    const elementsSkipToDash = await page.$x('//*[text()="Go to languages"]');
    await elementsSkipToDash[0].click();
    //await expect(page).toMatchElement('button', { text: 'Other Languages (Audio)' }, { timeout: config.timeout }, { visible: true });
    //await expect(page).toMatchElement(".dashboard-content", { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Client To Homepage");
    await delay(10000);
  });

  it('SV-5430: Verify that after session has ended, users status will change to "Wrapping" for 30 sec. After 30 sec users status will change to "Available"', async () => {	

    //await terpPage.waitForXPath("//span[@id='button--listbox-input--2']//span[@icon='cross']", { timeout: config.timeout }, { visible: true });
    //await helperFuncs.verifyTextXpath(terpPage,"//span[@id='button--listbox-input--2']//span[2]","Wrapping");

    await expect(terpPage).toMatchElement('span', {text: 'Exit Wrapping'},
      {
        timeout: config.timeout,
      });

    await htmlReport.attachScreenshot(terpPage, "Terp In Wrapping Status");

    console.log("Waiting For 30s");

    var i = 1;
    do {
      console.log(i+" secs");
      await delay(1000);
      i += 1;
    } while (i <= 30);

    //await helperFuncs.verifyTextXpath(terpPage,"//span[@id='button--listbox-input--2']//span[2]","Available");
  
  });

  it('SV-5315: Verify that user see Session IDs', async () => { 

    const historyButton = await terpPage.$x('//div[text()=\'History\']');
    await historyButton[0].click();

    await delay(3000);
    await htmlReport.attachScreenshot(terpPage, "Session ID Displayed In History");
    await delay(3000);
  });

  it('SV-5316: Verify that if user click on session ID user will be presented with "Technical Incident" and "Operational Incident" tabs', async () => { 

    const recentSessionIDButton = await terpPage.$x('//table[1]/tbody[1]/tr[1]/td[2]/button[1]');
    await recentSessionIDButton[0].click();

    await terpPage.waitForSelector('button[type="submit"]');

    await expect(terpPage).toMatchElement(
      'button', {
            text: 'Technical Incident'
      }, {
            timeout: config.timeout
          }
      );

      await expect(terpPage).toMatchElement(
        'button', {
              text: 'Operational Incident'
        }, {
              timeout: config.timeout
            }
        );    
  });

  it('SV-5321: Verify that user can\'t submit reports without answering required fields', async () => { 
    const submitIncidentButton = await terpPage.$x('(//button[@type=\'submit\'])[1]');
    await submitIncidentButton[0].click();
    await delay(2000);
    const required = await terpPage.$x('//*[text()="Required"]');
       
  });

  it('SV-5317: Verify that user can submit Technical Incident report', async () => { 

    const techincalIncidentButton = await terpPage.$x('//button[text()=\'Technical Incident\']');
    await techincalIncidentButton[0].click();

    await terpPage.waitForSelector('form[autocomplete="off"]');

    const questionOneDropDown = await terpPage.$x("//label[text()='Technical Question 1']//following::div[1]");
    await questionOneDropDown[0].click();
    await terpPage.keyboard.press('Enter');
    const questionTwoDropDown = await terpPage.$x("//label[text()='Technical Question 2']//following::div[1]");
    await questionTwoDropDown[0].click();
    await terpPage.keyboard.press('Enter');
    const commentsTextArea = await terpPage.$x("(//textarea[@name='message'])[1]");
    await commentsTextArea[0].type('Test Comments');

    await delay(1000);

    const submitIncidentButton = await terpPage.$x('(//button[@type=\'submit\'])[1]');
    await submitIncidentButton[0].click();
       
  });

  it('SV-5322: Verify that after Technical Incidents are submitted user presented with "Your incident report has been submitted." message and "Create New" button', async () => { 

    await terpPage.waitForSelector('div[data-e2e="alert-box"]');

    await expect(terpPage).toMatchElement(
      'p', {
            text: 'Your incident report has been submitted.'
      }, {
            timeout: config.timeout
          }
      );
    await htmlReport.attachScreenshot(terpPage, "Technical Incident Submitted");
    
    const createNewButton = await terpPage.$x('//span[text()=\'Create New\']');
    await createNewButton[0].click();
       
  });

  it('SV-5320: Verify that user can reset the data entered for Technical Incident report by using "Reset" button', async () => { 

    const techincalIncidentButton = await terpPage.$x('//button[text()=\'Technical Incident\']');
    await techincalIncidentButton[0].click();

    await terpPage.waitForSelector('form[autocomplete="off"]');

    const questionOneDropDown = await terpPage.$x("//label[text()='Technical Question 1']//following::div[1]");
    await questionOneDropDown[0].click();
    await terpPage.keyboard.press('Enter');
    const questionTwoDropDown = await terpPage.$x("//label[text()='Technical Question 2']//following::div[1]");
    await questionTwoDropDown[0].click();
    await terpPage.keyboard.press('Enter');
    const commentsTextArea = await terpPage.$x("(//textarea[@name='message'])[1]");
    await commentsTextArea[0].type('Test Comments');
    await delay(1000);

    const resetButton = await terpPage.$x('(//span[text()=\'Reset\'])[1]');
    await resetButton[0].click();

    await expect(terpPage).toMatchElement(
      'div', {
            text: 'Select...'
      }, {
            timeout: config.timeout
          }
      );
    await htmlReport.attachScreenshot(terpPage, "Reset Technical Incident Form");
       
  });

  it('SV-5318: Verify that user can submit Operational Incident report', async () => { 

    const operationalIncidentButton = await terpPage.$x('//button[text()=\'Operational Incident\']');
    await operationalIncidentButton[0].click();

    await terpPage.waitForSelector('form[autocomplete="off"]');

    await terpPage.waitForXPath("//label[text()='Operational Question 1']//following::div[1]", {visible: true});
    const questionOneDropDown = await terpPage.$x("//label[text()='Operational Question 1']//following::div[1]");
    await questionOneDropDown[0].click();
    await terpPage.keyboard.press('Enter');
    const commentsTextArea = await terpPage.$x("(//textarea[@name='message'])[2]");
    await commentsTextArea[0].type('Test Comments');

    await delay(1000);

    const submitIncidentButton = await terpPage.$x('(//button[@type=\'submit\'])[2]');
    await submitIncidentButton[0].click();
       
  });

  it('SV-5322: Verify that after Operational Incidents are submitted user presented with "Your incident report has been submitted." message and "Create New" button', async () => { 

    await terpPage.waitForSelector('div[data-e2e="alert-box"]');

    await expect(terpPage).toMatchElement(
      'p', {
            text: 'Your incident report has been submitted.'
      }, {
            timeout: config.timeout
          }
      );
    await htmlReport.attachScreenshot(terpPage, "Operational Incident Submitted");
    
    const createNewButton = await terpPage.$x('//span[text()=\'Create New\']');
    await createNewButton[0].click();
    
       
  });

  it('SV-5319: Verify that user can reset the data entered for Operational Incident report by using "Reset" button', async () => { 

    const operationalIncidentButton = await terpPage.$x('//button[text()=\'Operational Incident\']');
    await operationalIncidentButton[0].click();

    await terpPage.waitForSelector('form[autocomplete="off"]');

    await terpPage.waitForXPath("//label[text()='Operational Question 1']//following::div[1]", {visible: true});
    const questionOneDropDown = await terpPage.$x("//label[text()='Operational Question 1']//following::div[1]");
    await questionOneDropDown[0].click();
    await terpPage.keyboard.press('Enter');
    const commentsTextArea = await terpPage.$x("(//textarea[@name='message'])[2]");
    await commentsTextArea[0].type('Test Comments');

    await delay(1000);

    const resetButton = await terpPage.$x('(//span[text()=\'Reset\'])[2]');
    await resetButton[0].click();

    await expect(terpPage).toMatchElement(
      'div', {
            text: 'Select...'
      }, {
            timeout: config.timeout
          }
      );
    await htmlReport.attachScreenshot(terpPage, "Reset Operational Incident Form");
       
  });

  it('change terp2 status to break', async () => {
    const clickbt0 = await terp2Page.$x('//*[text()="Available"]');
    await clickbt0[0].click();
    await delay(2000);
    const clickbt11 = await terp2Page.$x('//*[text()="Break"]');
    await clickbt11[0].click();
    await delay(4000);
  });

  it('client dials', async () => {
    const b2 = await page.$x('//*[text()="Spanish"]');
    await b2[0].click();
    await delay(10000);
  });

  it('SV-5422: Verify if user click "Decline" to call notification, status will change to "Unavailable"', async () => {
    
    const declineCall = await terpPage.$x('//*[text()="Decline"]');
    await declineCall[0].click();
    await delay(2000);
    //await terpPage.waitForXPath("//span[@id='button--listbox-input--2']//span[@icon='caret-down']", { timeout: config.timeout }, { visible: true });
    await helperFuncs.verifyTextXpath(terpPage,"//*[text()='Unavailable']","Unavailable");
    await htmlReport.attachScreenshot(terpPage, "Decline Call Changes Status To Unavailable");
    await delay(4000);
  });

  it('set terp available', async () => {
    
    const clickbtt = await terpPage.$x('//*[text()="Unavailable"]');
    await clickbtt[0].click();
    const clickbt = await terpPage.$x('//*[text()="Available"]');
    await clickbt[0].click();
    await delay(10000);
  });

  it('SV-5423: Verify if user click "X" in call notification, notification will be dismissed and status will change to "Unavailable"', async () => {
    
    const declinebtn = await terpPage.$x("/html/body/div[2]/div/div[3]/div/div[1]/button/span");
    await declinebtn[0].click();
    //await terpPage.waitForXPath("//span[@id='button--listbox-input--2']//span[@icon='caret-down']", { timeout: config.timeout }, { visible: true });
    await helperFuncs.verifyTextXpath(terpPage,"//*[text()='Unavailable']","Unavailable");
    await htmlReport.attachScreenshot(terpPage, "Decline Call Changes Status To Unavailable");
    await delay(2000);
  });

  it('SV-7668: Verify Changed Missed Opportunity Time', async () => {
    
    const changeSt = await terpPage.$x('//*[text()="Unavailable"]');
    changeSt[0].click();
    await delay(2000);
    const click_bt11 = await terpPage.$x('//*[text()="Available"]');
    click_bt11[0].click();
    await delay(3000);

    var i = 1;
    do {
      console.log(i+" secs");
      await delay(1000);
      i += 1;
    } while (i <= 28);
  });

  it('cancel call from client', async () => {
    const cancelcall = await page.$x('//*[text()="Cancel request"]');
    await cancelcall[0].click();
    await delay(8000);
    await expect(terpPage).toMatchElement('h5', { text: 'Session Canceled'}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(terpPage, "Session Canceled");
    await delay(5000);
    
  });

  it('SV-7435: Verify Request Cancelled record in history section', async () => {
    
    await terpPage.waitForXPath("(//td[@class='dashboard--history-event'])[1]", { timeout: config.timeout }, { visible: true });
    await terpPage.waitFor(6000);
    await helperFuncs.verifyTextXpath(terpPage,"(//td[@class='dashboard--history-event'])[1]","Request Cancelled");
    await htmlReport.attachScreenshot(terpPage, "Call Declined In History");
    
  });

  it('SV-7449: Verify status gets changes by using Hotkeys', async () => {
    
    //await terpPage.waitForSelector('div[id="listbox-input--2"]', { timeout: config.timeout }, { visible: true });
    await terpPage.keyboard.down('Alt');
    await terpPage.keyboard.press('KeyA');
    await terpPage.waitFor(2000);
    await helperFuncs.verifyTextXpath(terpPage,"//*[text()='Available']","Available");
    await htmlReport.attachScreenshot(terpPage, "Changed Status Using Hotkeys");

  });

  it('SV-5305: Verify terp can sign out of the app', async () => {
    
    await iwsPageObjects.iwsSignout(terpPage);
    await htmlReport.attachScreenshot(terpPage, "Sign Out");
    
  });

  it('SV-5306: Verify that if user click "Login" button user should be presented with "Sign in to continue" page', async () => { 	
  
    await terpPage.waitForXPath("//span[text()='Login']", { timeout: config.timeout }, { visible: true });
    const loginButton = await terpPage.$x('//span[text()=\'Login\']');
    await loginButton[0].click();	
    await terpPage.waitForSelector('button[type="submit"]');

    await expect(terpPage).toMatchElement(	
      'h1', {	
            text: 'Sign in to continue'	
      }, {	
            timeout: config.timeout	
          }	
      );
    await htmlReport.attachScreenshot(terpPage, "Sign In To Continue Button");

  });

  it('terp2 Sign Out', async () => {
    
    await iwsPageObjects.iwsSignout(terp2Page);
    await htmlReport.attachScreenshot(terp2Page, "Logout");

  }); */

});