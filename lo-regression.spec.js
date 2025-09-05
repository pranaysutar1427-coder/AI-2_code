var config = require('./config');
var loPageObjects = require('./pageObjects/loPageObjects');
var contPageObjects = require('./pageObjects/contPageObjects');
var helperFuncs = require('./utils/helperFunctions');
var htmlReport = require('./utils/htmlReporterFunctions');
var newPageWithNewContext = require('./utils/newPageWithNewContext');
var templateNameGoAvailable;
var templateTitleGoAvailable;

const delay = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};


describe('LO Regression Test', () => {
  let contPage;
  beforeEach(() => {
    jest.setTimeout(config.timeout);
  });

  beforeAll(async done => {
    contPage = await newPageWithNewContext(browser);
    done();
  });

  it('SV-7499: Verify error message "Invalid username or password. Try again." during login by using invalid credentials', async () => { 
    await page.goto(`${config.url}/languageops`);
    await loPageObjects.badLogin(page,config.loUser.username);
    await page.waitForXPath(loPageObjects.invalidLoginMesaage, { timeout: config.timeout }, { visible: true });
    await page.waitFor(1500);
    await helperFuncs.verifyTextXpath(page,loPageObjects.invalidLoginMesaage,"Invalid username or password.  Try again.");
    await htmlReport.attachScreenshot(page, "Bad Login");
 
  });

  it('SV-7351: Verify user can reset the password from the Loapp', async () => { 
    await page.goto(`${config.url}/languageops`);
    await loPageObjects.clickOnForgotPassword(page);
    await loPageObjects.enterUsernameAndClickSubmitForgotPassword(page, config.loUser.username);
    await delay(2000);
    await expect(page).toMatch('Please check your email for a reset password link.', {timeout: config.timeout});
    await expect(page).toMatch('It could take a few minutes for it to arrive.', {timeout: config.timeout});
    await htmlReport.attachScreenshot(page, "Reset Password");
    await loPageObjects.clickBackToLogin(page);
  });

  it('SV-7498: Verify login functionality by using valid credentials', async () => { 
    await page.goto(`${config.url}/languageops`);
    await loPageObjects.loginToLO(page,config.loUser.username, config.loUser.password);
    await page.waitForSelector(loPageObjects.broadCastButton, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('h3', {text: 'Dashboard'}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Successful Login");
 
  });

  it('SV-7501: Verify compose, history and template sections are available after login successfully', async () => { 
    await loPageObjects.clickBroadcastButton(page);
    await expect(page).toMatchElement('a', {text: 'Compose'}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('a', {text: 'History'}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('a', {text: 'Templates'}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Compose, History And Templates Section Displayed");
 
  });

  it('SV-7503: Verify error message on each field if trying to add template with blank details', async () => { 
    await loPageObjects.navigateToTemplates(page);
    await loPageObjects.clickAddTemplate(page);
    await loPageObjects.clickSaveButton(page);
    await page.waitFor(1500);
    await expect(page).toMatchElement('div', {text: 'Name required'}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', {text: 'Title required'}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', {text: 'Message type required'}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', {text: 'Message required'}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Field Validations On Add Template");
 
  });

  it('SV-7512: Verify the length of message textbox', async () => { 
    var messageMaxLength = await loPageObjects.verifyTemplateMessageLength(page);
    await expect(messageMaxLength).toEqual("300");
    await htmlReport.attachScreenshot(page, "Template Message Length 300");
    await loPageObjects.clickXCloseButton(page);
 
  });

  it('SV-7502: Verify functionality of adding new template', async () => { 
    await loPageObjects.clickAddTemplate(page);
    var templatedDetails = await loPageObjects.fillInAddTemplateDetails(page, 'Go Available Request');
    templateNameGoAvailable = templatedDetails.templateName;
    templateTitleGoAvailable = templatedDetails.templateTitle;
    await loPageObjects.clickSaveButton(page);
    await page.waitFor(500);
    await expect(page).toMatchElement('h5', {text: 'Template Saved'}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('p', {text: 'Broadcast template saved'}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Broadcast Template Saved");
    await loPageObjects.clickXCloseButton(page);
 
  });

  it('SV-7507: Verify list of broadcast templates after creating new template', async () => { 
    await expect(page).toMatchElement('a', {text: templateNameGoAvailable}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Created Template Is Displayed");
 
  });

  it('SV-7508, SV-7549: Verify updated time with time unit displayed after click on refresh button', async () => { 
    var displayedTime = await loPageObjects.refreshButtonAndTimeDisplayedOnTemplate(page);
    await expect(displayedTime).toEqual(displayedTime);
    await htmlReport.attachScreenshot(page, "Refreshed & Time Updated");
 
  });

  it('SV-7509: Verify functionality of opening any template detail from broadcast templates list', async () => { 

    var openedTemplateName = await loPageObjects.openTemplateFromList(page, templateNameGoAvailable);
    await expect(openedTemplateName).toEqual(templateNameGoAvailable);
    await htmlReport.attachScreenshot(page, "Opened Template From Template List");
 
  });

  it('SV-7510: Verify functionality of modify any broadcast template detail', async () => { 

    templateNameGoAvailable = await loPageObjects.editTemplateName(page);
    await loPageObjects.clickSaveButton(page);
    await page.waitFor(500);
    await expect(page).toMatchElement('h5', {text: 'Template Saved'}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('p', {text: 'Broadcast template saved'}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Broadcast Template Edited");
    await loPageObjects.clickXCloseButton(page);
 
  });

  it('Login To Contrator App', async () => {
    await contPage.goto(`${config.url}/audio`);
    await contPageObjects.loginToContrator(contPage,config.contUser1.username, config.contUser1.password);
 
  });

  it('SV-7513: Verify updated broadcast template list display inside template dropdown', async () => {
    await loPageObjects.navigateToCompose(page);
    await loPageObjects.selectTemplateAndAddNotesForCompose(page, templateNameGoAvailable);
    await htmlReport.attachScreenshot(page, "Template Available In Broadcast Compose");
 
  });

  it('SV-7514, SV-7530: Verify functionality of sending broadcast message for go available now to all users', async () => { 
    await loPageObjects.clickNextButton(page);
    await page.waitForXPath(loPageObjects.targetUsersHeader, { timeout: config.timeout }, { visible: true });
    await loPageObjects.clickNextButton(page);
    await page.waitForXPath(loPageObjects.finalBroadcastReviewHeader, { timeout: config.timeout }, { visible: true });
    await loPageObjects.clickSendButton(page);
    await expect(page).toMatchElement('div', {text: 'Are you sure you want to submit this broadcast?'}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('span', {text: 'Confirm'}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Confirm Broadcast Popup");

    await loPageObjects.clickConfirmButton(page);
    await page.waitForXPath(loPageObjects.viewFullBroadcastButton, { timeout: config.timeout }, { visible: true });
    await page.waitFor(1000);
    await expect(page).toMatchElement('h3', {text: 'Broadcast Created'}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Go Available Broadcast Created");
 
  });
  

  it('SV-7533: Verify broadcast created page displayed after click on confirm button of confirmation pop-up window and broadcast message displayed on contractor app', async () => { 
    await contPage.waitFor(2000);
    await expect(contPage).toMatchElement('h5', {text: templateTitleGoAvailable}, { timeout: config.timeout }, { visible: true });
    await expect(contPage).toMatchElement('div', {text: 'Auto Template Message'}, { timeout: config.timeout }, { visible: true });
    await expect(contPage).toMatchElement('button', {text: 'Go Available'}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(contPage, "Go Available Notification To Contractor");
    await contPageObjects.closeNotification(contPage);
 
  });

  it('SV-7535: Verify current template details displayed after click on View full broadcast button', async () => { 
    await loPageObjects.clickViewFullBroadcastButton(page);
    await page.waitFor(1500);
    await expect(page).toMatchElement('div', {text: 'Broadcast Details'}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('dd', {text: templateTitleGoAvailable}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', {text: 'Auto Template Message'}, { timeout: config.timeout }, { visible: true });

    await htmlReport.attachScreenshot(page, "Clicked View Full Broadcast");
 
  });

  it('SV-7536: Verify General, target and final users tabs displayed in current template details', async () => { 
    await expect(page).toMatchElement('button', {text: 'General'}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('button', {text: 'Target'}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('button', {text: 'Final Users'}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "General, Target, Final Users Tabs Displayed");
    await loPageObjects.clickXCloseButton(page);
    await page.waitFor(1000);

  });

  it('SV-7515: Verify functionality of sending broadcast message for Announcement to all users', async () => {
    await loPageObjects.clickBroadcastButton(page);
    await page.waitFor(1000);
    await loPageObjects.navigateToCompose(page);
    await loPageObjects.selectTemplateAndAddNotesForCompose(page, templateNameGoAvailable);
    await loPageObjects.changeMessageTypeOnCompose(page, 'Announcement');
    await loPageObjects.clickNextButton(page);
    await page.waitForXPath(loPageObjects.targetUsersHeader, { timeout: config.timeout }, { visible: true });
    await loPageObjects.clickNextButton(page);
    await page.waitForXPath(loPageObjects.finalBroadcastReviewHeader, { timeout: config.timeout }, { visible: true });
    await loPageObjects.clickSendButton(page);
    await loPageObjects.clickConfirmButton(page);
    await page.waitForXPath(loPageObjects.viewFullBroadcastButton, { timeout: config.timeout }, { visible: true });
    await page.waitFor(1000);
    await expect(page).toMatchElement('h3', {text: 'Broadcast Created'}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Announcement Broadcast Created");

    await contPage.waitFor(2000);
    await expect(contPage).toMatchElement('h5', {text: templateTitleGoAvailable}, { timeout: config.timeout }, { visible: true });
    await expect(contPage).toMatchElement('div', {text: 'Auto Template Message'}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(contPage, "Announcement Notification To Contractor");
    await contPageObjects.closeNotification(contPage);
 
  });

  it('SV-7534: Verify compose page displayed if we click on close button', async () => {
    await loPageObjects.clickCloseButton(page);
    await page.waitFor(1000)
    await expect(page).toMatchElement('h3', {text: 'Compose an Agent Notification'}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Clicked Close");
 
  });

  it('SV-7517: Verify all value selected by default in all filters (Status, team, languages, skills) and type is contractor by default with greyout', async () => {
    await loPageObjects.navigateToCompose(page);
    await loPageObjects.selectTemplateAndAddNotesForCompose(page, templateNameGoAvailable);
    await loPageObjects.clickNextButton(page);
    await helperFuncs.verifyTextXpath(page,loPageObjects.statusDefaultValueCompose,"All");
    await helperFuncs.verifyTextXpath(page,loPageObjects.teamDefaultValueCompose,"All");
    await helperFuncs.verifyTextXpath(page,loPageObjects.languagesDefaultValueCompose,"All");
    await helperFuncs.verifyTextXpath(page,loPageObjects.skillsDefaultValueCompose,"All");
    await helperFuncs.verifyTextXpath(page,loPageObjects.typeDefaultValueCompose,"Contractor");
    await htmlReport.attachScreenshot(page, "Default Values On Target Filters");
 
  });

  it('SV-7518: Verify the functionality of clear filters button', async () => {
    await loPageObjects.fillInTargetUsersFilter(page, 'Unavailable', 'Spanish', 'Audio');
    await htmlReport.attachScreenshot(page, "Filled In Target Users Filter");
    await loPageObjects.clickClearFilterButton(page);
    await page.waitFor(500);
    await helperFuncs.verifyTextXpath(page,loPageObjects.statusDefaultValueCompose,"All");
    await helperFuncs.verifyTextXpath(page,loPageObjects.teamDefaultValueCompose,"All");
    await helperFuncs.verifyTextXpath(page,loPageObjects.languagesDefaultValueCompose,"All");
    await helperFuncs.verifyTextXpath(page,loPageObjects.skillsDefaultValueCompose,"All");
    await helperFuncs.verifyTextXpath(page,loPageObjects.typeDefaultValueCompose,"Contractor");
    await htmlReport.attachScreenshot(page, "Clicked Clear Filters");
 
  });

  it('SV-7516: Verify the sampled users as per selected filters in target page', async () => {
    await page.waitForXPath(loPageObjects.targetUsersHeader, { timeout: config.timeout }, { visible: true });
    await loPageObjects.clickNextButton(page);
    await page.waitForXPath(loPageObjects.finalBroadcastReviewHeader, { timeout: config.timeout }, { visible: true });
    await page.waitFor(1000);

    await expect(page).toMatchElement('td', {text: config.contUser1.username}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Sampled Users");
 
  });

  it('SV-7532: Verify Review page displayed if we cancel the confirmation pop-up window', async () => {
    await loPageObjects.clickSendButton(page);
    await loPageObjects.clickCancelButton(page);
    await page.waitFor(500)
    await page.waitForXPath(loPageObjects.finalBroadcastReviewHeader, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('h3', {text: 'Final Broadcast Review'}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Cancelled Confirm Broadcast Popup");
 
  });

  it('SV-7531: Verify Target page displayed after click on back button', async () => {
    await loPageObjects.clickBackButton(page);
    await page.waitForXPath(loPageObjects.targetUsersHeader, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('h3', {text: 'Target a Set of Users'}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Clicked Back To Target Users Page");
 
  });

  it('SV-7529: Verify compose page displayed after click on back button', async () => {
    await loPageObjects.clickBackButton(page);
    await page.waitFor(1000)
    await expect(page).toMatchElement('h3', {text: 'Compose an Agent Notification'}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Clicked Back To Compose Page");
 
  });

  it('SV-7537: Verify General, target and final users tabs displayed after click on any template details', async () => { 
    await loPageObjects.navigateToHistory(page);
    await loPageObjects.clickOnFirstRecordInHistory(page);
    await expect(page).toMatchElement('button', {text: 'General'}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('button', {text: 'Target'}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('button', {text: 'Final Users'}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Broadcasted Details");
 
  });

  it('SV-7538: Verify General tab having created date, title, message type, Internal notes and message details', async () => { 
    await loPageObjects.navigateToGeneral(page);
    await page.waitFor(500);
    await expect(page).toMatchElement('h4', {text: 'Created'}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('dt', {text: 'Title:'}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('dd', {text: templateTitleGoAvailable}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('dt', {text: 'Message Type:'}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('dt', {text: 'Internal Notes:'}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('dd', {text: 'Auto Broadcast'}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('dt', {text: 'Message:'}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', {text: 'Auto Template Message'}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Broadcasted General Details");
    
 
  });

  it('SV-7545: Verify user count with final users tab as well as sampled users while broadcasting the template', async () => { 
    await expect(page).toMatchElement('h4', {text: 'User count'}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Sampled User Count");
    
 
  });

  it('SV-7539: Verify Target tab having statuses, teams, languages, skills and user types details', async () => { 
    await loPageObjects.navigateToTarget(page);
    await page.waitFor(500);
    await expect(page).toMatchElement('dt', {text: 'Statuses'}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('dt', {text: 'Teams'}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('dt', {text: 'Languages'}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('dt', {text: 'Skills'}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('dt', {text: 'User Types'}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Broadcasted Target Details");
    
  });

  it('SV-7540: Verify final users tab having list of users with search field and previous next buttons', async () => { 
    await loPageObjects.navigateToFinalUsers(page);
    await page.waitFor(500);
    await expect(page).toMatchElement(loPageObjects.searchUsernameField, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('span', {text: 'Next'}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('span', {text: 'Previous'}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Broadcasted Final User Details");
    
  });

  it('SV-7543: Verify functionality of previous and next button', async () => { 
    await loPageObjects.clickNextBroadcastDetailsButton(page);
    await page.waitFor(500);
    await expect(page).toMatchElement('div', {text: '1'}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', {text: ' of '}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Next Button On Final User Details");
    await loPageObjects.clickPreviousBroadcastDetailsButton(page);
    await page.waitFor(500);
    await expect(page).toMatchElement('div', {text: '2'}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', {text: ' of '}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Previous Button On Final User Details");
    
  });


  it('SV-7541: Verify search functionality by entering valid username of final users tab', async () => { 
    await loPageObjects.searchUsernameFinalUsers(page, config.contUser1.username);
    await expect(page).toMatchElement('td', {text: config.contUser1.username}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Searched Contrator Username");
    
  });

  it('SV-7542: Verify search functionality by entering invalid username of final users tab', async () => { 
    await loPageObjects.searchUsernameFinalUsers(page, 'QA-INVALIDUSER');
    await expect(page).toMatchElement('div', {text: 'No results'}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Searched Invalid Contrator Username");
    
  });

  it('SV-7544: Verify functionality of close button', async () => { 
    await loPageObjects.clickXCloseButton(page);
    await expect(page).toMatchElement('h3', {text: 'Broadcast History'}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Closed Broadcast Details");
    
  });

  it('SV-7546: Verify list of broadcast history having date, title, status and notes with filter broadcast', async () => { 
    await expect(page).toMatchElement('div', {text: 'Date'}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', {text: 'Title'}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', {text: 'Status'}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', {text: 'Notes'}, { timeout: config.timeout }, { visible: true });
    
  });

  it('SV-7547: Verify sorting of date, title, status and notes in ascending and descending orders', async () => { 
    await loPageObjects.clickSortByDateButton(page);
    await htmlReport.attachScreenshot(page, "Sort By Date");

    await loPageObjects.clickSortByTitleButton(page);
    await htmlReport.attachScreenshot(page, "Sort By Title");

    await loPageObjects.clickSortByStatusButton(page);
    await htmlReport.attachScreenshot(page, "Sort By Status");

    await loPageObjects.clickSortByNotesButton(page);
    await htmlReport.attachScreenshot(page, "Sort By Notes");
    
  });

  it('SV-7550: Verify functionality of apply button in filter broadcasts according to filter selection', async () => { 
    await loPageObjects.fillInHistoryFilter(page, 'Available', 'ASL');
    await htmlReport.attachScreenshot(page, "Filter Selected");

    await loPageObjects.clickApplyFilterButton(page);
    await expect(page).toMatchElement('td', {text: 'No results found'}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Filter Applied");
    
  });

  it('SV-7551: Verify functionality of reset button in filter broadcasts', async () => { 
    await loPageObjects.clickResetFilterButton(page);
    await htmlReport.attachScreenshot(page, "Filter Reset");
    
  });

  it('SV-7548: Verify functionality of hide and unhide filer broadcasts', async () => { 
    await loPageObjects.clickHideFilterButton(page);
    await htmlReport.attachScreenshot(page, "Hide Filters Tab");

    await loPageObjects.clickUnhideFilterButton(page);
    await htmlReport.attachScreenshot(page, "Unhide Filters Tab");
    
  });

  it('SV-7552: Verify compose page displayed if we click on antenna icon from any page', async () => {
    await loPageObjects.clickBroadcastButton(page);
    await page.waitFor(1000);
    await htmlReport.attachScreenshot(page, "Clicked Broadcast Antenna Button");
 
  });

  it('SV-7553: Verify functionality of sending broadcast message for go available now to any particular status users', async () => { 
    await loPageObjects.clickBroadcastButton(page);
    await page.waitFor(1000);
    await loPageObjects.navigateToCompose(page);
    await loPageObjects.selectTemplateAndAddNotesForCompose(page, templateNameGoAvailable);
    await loPageObjects.clickNextButton(page);
    await page.waitForXPath(loPageObjects.targetUsersHeader, { timeout: config.timeout }, { visible: true });
    await loPageObjects.fillInTargetUsersFilter(page, 'Unavailable', '', '');
    await loPageObjects.clickNextButton(page);
    await page.waitForXPath(loPageObjects.finalBroadcastReviewHeader, { timeout: config.timeout }, { visible: true });
    await loPageObjects.clickSendButton(page);
    await loPageObjects.clickConfirmButton(page);
    await page.waitForXPath(loPageObjects.viewFullBroadcastButton, { timeout: config.timeout }, { visible: true });
    await page.waitFor(1000);
    await expect(page).toMatchElement('h3', {text: 'Broadcast Created'}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Go Avaialbe Broadcast For Particular Status User");
 
  });

  it('SV-7554: Verify functionality of sending broadcast message for Announcement to any particular status users', async () => { 
    await loPageObjects.clickBroadcastButton(page);
    await page.waitFor(1000);
    await loPageObjects.navigateToCompose(page);
    await loPageObjects.selectTemplateAndAddNotesForCompose(page, templateNameGoAvailable);
    await loPageObjects.changeMessageTypeOnCompose(page, 'Announcement');
    await loPageObjects.clickNextButton(page);
    await page.waitForXPath(loPageObjects.targetUsersHeader, { timeout: config.timeout }, { visible: true });
    await loPageObjects.fillInTargetUsersFilter(page, 'Unavailable', '', '');
    await loPageObjects.clickNextButton(page);
    await page.waitForXPath(loPageObjects.finalBroadcastReviewHeader, { timeout: config.timeout }, { visible: true });
    await loPageObjects.clickSendButton(page);
    await loPageObjects.clickConfirmButton(page);
    await page.waitForXPath(loPageObjects.viewFullBroadcastButton, { timeout: config.timeout }, { visible: true });
    await page.waitFor(1000);
    await expect(page).toMatchElement('h3', {text: 'Broadcast Created'}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Go Avaialbe Broadcast For Particular Status User");
 
  });

  it('SV-7511: Verify functionality of deleting any broadcast template', async () => { 
    await loPageObjects.navigateToTemplates(page);
    await loPageObjects.openTemplateFromList(page, templateNameGoAvailable);
    await loPageObjects.deleteTemplate(page);
    await page.waitFor(500);
    await expect(page).toMatchElement('h5', {text: 'Template Removed'}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('p', {text: 'Broadcast template removed'}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Broadcast Template Removed");
    await loPageObjects.clickXCloseButton(page);
 
  });


  it('SV-7556, SV-7557: Verify Logged Out page having text "You\'ve been successfully logged out." with login button', async () => { 
    await loPageObjects.logoutLO(page);
    await expect(page).toMatchElement('h1', {text: 'Logged Out'}, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('p', {text: 'You\'ve been successfully logged out.'}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Broadcast Template Removed");
 
  });

  it('SV-7558: Verify the functionality of login button', async () => { 
    await loPageObjects.clickLogin(page);
    await expect(page).toMatchElement('h1', {text: 'Sign in to continue'}, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Login Page");
 
  });

});

