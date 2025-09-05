var config = require('./config');
var helperFuncs = require('./utils/helperFunctions');
var htmlReport = require('./utils/htmlReporterFunctions');
var awsPageObjects = require('./pageObjects/agentStationPageObjects');
var commandCenterPageObjects = require('./pageObjects/commandCenterPageObjects');
var newPageWithNewContext = require('./utils/newPageWithNewContext');


const delay = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};


describe('Agent Workstation Regression Test', () => {

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

  it('SV-2902, SV-1391 : Verify Terp status is displayed as "unavailable" on Login', async () => { 
    await terpPage.goto(`${config.url}/iws`);
    await awsPageObjects.loginToAWS(terpPage, config.terpUser1.username, config.terpUser1.password);
    await terpPage.waitForXPath(awsPageObjects.userStatus, { timeout: config.timeout }, { visible: true });
    await helperFuncs.verifyTextXpath(terpPage,awsPageObjects.userStatus,"Unavailable");
    await htmlReport.attachScreenshot(terpPage, "Status Unknown On Login");

  });

  it('SV-1392: Verify Terp can change statuses(Available, Standby, Unavailable, Break, Offline) and verify RTR displays right status for all status changes', async () => { 
    await awsPageObjects.changeUserStatus(terpPage, "Break");
    await helperFuncs.verifyTextXpath(terpPage,awsPageObjects.userStatus, "Break");
    await htmlReport.attachScreenshot(terpPage, "Break Status");

    await awsPageObjects.changeUserStatus(terpPage, "Available");
    await helperFuncs.verifyTextXpath(terpPage,awsPageObjects.userStatus, "Available");

  });

  it('SV-6419: Verify that terp can change status to "Post Session Work" after the session', async () => { 
    await awsPageObjects.changeUserStatus(terpPage, "Post Session Work");
    await helperFuncs.verifyTextXpath(terpPage,awsPageObjects.userStatus, "Post Session Work");

  });

  it('set terp available', async () => { 
    await awsPageObjects.changeUserStatus(terpPage, "Available");
    await helperFuncs.verifyTextXpath(terpPage,awsPageObjects.userStatus, "Available");

  });

  it('SV-5206: Verify that the user is able to view the contact information in the \'contact\' menu', async () => { 
    await awsPageObjects.navigateToSupport(terpPage);
    await awsPageObjects.navigateToContactTab(terpPage);

    await terpPage.waitForXPath(awsPageObjects.contactPhoneText, { timeout: config.timeout }, { visible: true });
    await terpPage.waitForXPath(awsPageObjects.contactEmailText, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(terpPage, "Contact Page");

  });

  it('SV-5207: Verify the microphone test and the camera test in the media diagnostics menu', async () => { 
    await awsPageObjects.navigateToSupport(terpPage);
    await awsPageObjects.navigateToMediaDiagnosticsTab(terpPage);

    await terpPage.waitForSelector(awsPageObjects.microphoneAudioVisualizer, { timeout: config.timeout }, { visible: true });

    await awsPageObjects.clickYesButton(terpPage);
    await delay(1000);
    await awsPageObjects.clickYesButton(terpPage);
    await delay(1000);

    await expect(terpPage).toMatchElement('div', { text: 'All tests passed.'}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(terpPage, "Camera & Microphone Login");

  });

  it('SV-5208: Verify user is able to run the speed test for DC4 and DA6', async () => { 
    await awsPageObjects.navigateToSupport(terpPage);
    await awsPageObjects.navigateToSpeedTestTab(terpPage);
    await delay(3000);

    //await expect(terpPage).toMatchElement('h1', { text: 'DC4 Speedtest'}, { timeout: config.timeout }, { visible: true });
    //await expect(terpPage).toMatchElement('h1', { text: 'DA6 Speedtest'}, { timeout: config.timeout }, { visible: true });

    await htmlReport.attachScreenshot(terpPage, "Speed Test");

  });

  it('SV-5209: Verify the ring output settings by selecting "Default input speakers"', async () => { 
    await awsPageObjects.navigateToSettings(terpPage);
    await awsPageObjects.clickTestRingSettingsButton(terpPage);
    await delay(3000);
    await awsPageObjects.clickStopRingButton(terpPage);
    await htmlReport.attachScreenshot(terpPage, "Default Input Speaker");

  });

  it ('login and prep client', async () =>{
    await page.goto(`${config.url}/client`);
    await page.waitForSelector('input[name="username"]', { timeout: config.timeout }, { visible: true });
    await commandCenterPageObjects.login(page,config.clientUser1.username, config.clientUser1.password);
    await expect(page).toMatchElement('a', { text: 'Languages' }, { timeout: config.timeout }, { visible: true });
    await commandCenterPageObjects.checkifFreeAndCancelResumeDialog(page);
  })

  it('client dials', async () => {
    await page.waitFor(500);
    await expect(page).toClick('span', {
      text: config.language,
      timeout: config.timeout,
    });

    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await expect(page).toMatch('Finding a match...', { timeout: config.timeout });
    await htmlReport.attachScreenshot(page, "Finding Interpreter");

  });

  it('terp answers', async () => {
    
    await awsPageObjects.awsAcceptCall(terpPage);
    await htmlReport.attachScreenshot(terpPage, "Terp Video");

  });

  it('SV-3891: Verify answering boolean and date type questions on the terp side', async () => {
    
    await awsPageObjects.fillInBillingQuestion(terpPage);
    await htmlReport.attachScreenshot(terpPage, "Filled-In Billing Question");
    await awsPageObjects.clickSubmitBillingQuestion(terpPage);
    await htmlReport.attachScreenshot(terpPage, "Billing Question Submitted");

  });

  it('SV-5212: Verify sending a chat message from the terp station and verify the other participants can see it', async () => {
    
    await awsPageObjects.sendingChatTextMessage(terpPage, "Test Chat Message");
    await htmlReport.attachScreenshot(terpPage, "Terp Chat Message");

    await page.waitForXPath(awsPageObjects.clientChatDisplay, 
      
      
      
      
      
      { timeout: config.timeout }, { visible: true });
    await helperFuncs.verifyTextXpath(page, awsPageObjects.clientChatDisplay, "Test Chat Message");
    await htmlReport.attachScreenshot(page, "Client Chat Message");

  });

  it('SV-7613: Verify Asterisk symbol should be display on comments label and error message is comment is required', async () => {
    
    await terpPage.waitForXPath(awsPageObjects.reportIncidentCommentTextareaAsterisk, { timeout: config.timeout }, { visible: true });
    await helperFuncs.verifyTextXpath(terpPage, awsPageObjects.reportIncidentCommentTextareaAsterisk, "* ");

  });

  it('SV-5213: Verify submitting an Incident report from the terp station', async () => {
    
    await awsPageObjects.submitIncidentReport(terpPage);
    await expect(terpPage).toMatchElement('div', { text: 'Incident report has been submitted.' }, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(terpPage, "Submitted Incident Report");

  });

  it('SV-5214: Verify submitting Session notes from the terp station and check if the session notes are visible on the post session screen after ending the call', async () => {
    
    await awsPageObjects.postSessionNotes(terpPage, "Test Session Notes");
    await terpPage.waitForSelector(awsPageObjects.sessionNotesConversation, { timeout: config.timeout }, { visible: true });
    await expect(terpPage).toMatchElement('span', { text: 'Test Session Notes' }, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(terpPage, "Submitted Session Notes");

  });

  it('SV-5215: Verify all the options in the \'Client Settings\' Menu under the video feed', async () => {
    
    await awsPageObjects.clickClientSettings(terpPage);
    await expect(terpPage).toMatchElement('a', { text: 'Volume Min' }, { timeout: config.timeout }, { visible: true });
    await expect(terpPage).toMatchElement('a', { text: 'Volume Down' }, { timeout: config.timeout }, { visible: true });
    await expect(terpPage).toMatchElement('a', { text: 'Volume Reset' }, { timeout: config.timeout }, { visible: true });
    await expect(terpPage).toMatchElement('a', { text: 'Volume Up' }, { timeout: config.timeout }, { visible: true });
    await expect(terpPage).toMatchElement('a', { text: 'Volume Max' }, { timeout: config.timeout }, { visible: true });
    await expect(terpPage).toMatchElement('span', { text: 'Mute Video' }, { timeout: config.timeout }, { visible: true });
    await expect(terpPage).toMatchElement('span', { text: 'Unmute Video' }, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(terpPage, "Client Setting ");
    await awsPageObjects.clickClientSettings(terpPage);

  });

  it('SV-5218: Verify submitting Session notes from the terp station and check if the session notes are visible on the post session screen after ending the call', async () => {
    
    await expect(terpPage).toMatchElement('strong', { text: 'Start Time:' }, { timeout: config.timeout }, { visible: true });
    await expect(terpPage).toMatchElement('strong', { text: 'Provider:' }, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(terpPage, "Post Session Screen");

  });

  /*it('SV-5219: Verify Refreshing the call from the terp station and check if the video was re-established for all parties in call', async () => {
    await delay(10000);
    await awsPageObjects.clickVideoRefreshButton(terpPage);
    await expect(terpPage).toMatchElement(awsPageObjects.callSessionVideo, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(terpPage, "Refresh Video Button");

  });*/

  it('login and prep terp2', async () => {

    await terp2Page.goto(`${config.url}/iws`);
    await awsPageObjects.loginToAWS(terp2Page, config.terpUser2.username, config.terpUser2.password);
    await terp2Page.waitForXPath(awsPageObjects.userStatus, { timeout: config.timeout }, { visible: true });
    await awsPageObjects.changeUserStatus(terp2Page, "Available");
    await helperFuncs.verifyTextXpath(terp2Page,awsPageObjects.userStatus, "Available");
    


  });


  it('SV-5219: Verify Refreshing the call from the terp station and check if the video was re-established for all parties in call', async () => {
    await delay(10000);
    await awsPageObjects.clickVideoRefreshButton(terpPage);
    await expect(terpPage).toMatchElement(awsPageObjects.callSessionVideo, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(terpPage, "Refresh Video Button");

  });


  it('SV-5217: Verify transferring a call from the terp station', async () => {
   
    await awsPageObjects.doTransferToTerp(terpPage);
    await expect(terp2Page).toMatchElement(awsPageObjects.transferRequestNotificationModal, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(terp2Page, "Terp2 Gets Transfer Notification");
    await awsPageObjects.awsAcceptCall(terp2Page);
    await htmlReport.attachScreenshot(terp2Page, "Terp2 Video");

  });

  it('terp goes available', async () => {
    
    await awsPageObjects.changeUserStatus(terpPage, "Available");
    
  });

  it('SV-5216: Verify requeueing a call from the terp station', async () => {
    
    await awsPageObjects.doRequeue(terp2Page, config.language);
    await expect(terpPage).toMatchElement(awsPageObjects.requeueRequestNotificationModal, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(terpPage, "Terp Gets Requeue Notification");
    await awsPageObjects.awsAcceptCall(terpPage);
    await htmlReport.attachScreenshot(terpPage, "Terp Video");

  });

  it('end session', async () => {
    
    await awsPageObjects.clickEndCallButton(terpPage);
    await htmlReport.attachScreenshot(terpPage, "End Session");

  });

  it('SV-5220: Verify the Call details on the Post session screen', async () => {
    
    await terpPage.waitForSelector(awsPageObjects.callDetailsInfo, { timeout: config.timeout }, { visible: true });
    await expect(terpPage).toMatchElement('div', { text: 'Title:' }, { timeout: config.timeout }, { visible: true });
    await expect(terpPage).toMatchElement('div', { text: 'Start time:' }, { timeout: config.timeout }, { visible: true });
    await expect(terpPage).toMatchElement('div', { text: 'Stop time:' }, { timeout: config.timeout }, { visible: true });
    await expect(terpPage).toMatchElement('div', { text: 'Skills:' }, { timeout: config.timeout }, { visible: true });
    await expect(terpPage).toMatchElement('div', { text: 'Provider:' }, { timeout: config.timeout }, { visible: true });
    await expect(terpPage).toMatchElement('div', { text: 'Enterprise:' }, { timeout: config.timeout }, { visible: true });
    await expect(terpPage).toMatchElement('div', { text: 'Name:' }, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(terpPage, "Call Details On Session Summary Page");

  });

  it('SV-5221: Verify submitting session notes and incident report from the post session screen', async () => {

    await awsPageObjects.postSessionNotes(terpPage, "Test Session Notes Post Call");
    await expect(terpPage).toMatchElement('span', { text: 'Test Session Notes Post Call' }, { timeout: config.timeout }, { visible: true });
    
    await awsPageObjects.submitIncidentReport(terpPage);
    await expect(terpPage).toMatchElement('div', { text: 'Incident report has been submitted.' }, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(terpPage, "Submitted Incident Report");

  });

  it('SV-5222: Verify click "Add 30 seconds" on the post session screen and check if an additional 30 seconds have been added to the wrapping time', async () => {

    var remainingSecs = await awsPageObjects.add30SecondsAndCalculate(terpPage);
    await terpPage.waitFor(300)
    await expect(terpPage).toMatchElement('span', { text: remainingSecs }, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(terpPage, "Add 30 Seconds Button");

  });

  it('SV-5223: Verify clicking on "Skip to station" and check if the user gets redirected to the terp homepage', async () => {

    await awsPageObjects.clickSkipToStationButton(terpPage);
    await expect(terpPage).toMatchElement('span', { text: 'Available' }, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(terpPage, "Skip To Station");

  });

  it('logout terp', async () => {

    await awsPageObjects.logoutToAWS(terpPage);
    await htmlReport.attachScreenshot(terpPage, "Logged Out");

  });

  it('logout terp2', async () => {

    await awsPageObjects.logoutToAWS(terp2Page);

  });


});

