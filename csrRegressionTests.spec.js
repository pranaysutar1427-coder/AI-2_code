const config = require('./config');
var helperFuncs = require('./utils/helperFunctions');
var htmlReport = require('./utils/htmlReporterFunctions');
const newPageWithNewContext = require('./utils/newPageWithNewContext');
const client = require('twilio')(config.twilioSid, config.twilioToken);
var csrPageObjects = require('./pageObjects/csrPageObjects');
var iwsPageObjects = require('./pageObjects/iwsPageObjects');
var chooseReactSelect = require('./utils/chooseReactSelect');

const delay = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

client.calls
  .create({
    url: 'http://demo.twilio.com/docs/voice.xml',
    to: config.csrGenericPhoneNumber,
    from: config.fromPhoneNumber,

  })
  .then(call => console.log(call.sid))
  .done();

describe('CSR Regression Test', () => {
  let csrPage;
  let terpPage;

  beforeEach(() => {
    jest.setTimeout(config.timeout);
  });

  beforeAll(async done => {
    csrPage = await newPageWithNewContext(browser);
    terpPage = await newPageWithNewContext(browser);
    done();
  });


  it('SV-4152: Verify that "Forgot password" functionality works as expected', async () => {
    await csrPage.goto(`${config.url}/csr`);
    await csrPage.waitForSelector('input[name="username"]', { timeout: config.timeout }, { visible: true });
    await csrPageObjects.clickOnForgotPassword(csrPage);
    await csrPageObjects.enterUsernameAndClickSubmitForgotPassword(csrPage, config.csrUser1.username);
    await delay(2000);
    
    await expect(csrPage).toMatch('Please check your email for a reset password link.', {
      timeout: config.timeout});
    
    await expect(csrPage).toMatch('It could take a few minutes for it to arrive.', {
        timeout: config.timeout});

    await htmlReport.attachScreenshot(csrPage, "Forgot Password");

    await csrPageObjects.clickBackToLogin(csrPage);

  });

  // login, kill any existing session, and then go available
  it('SV-3554: Verify that CSR user can login to console', async () => {
    await csrPage.goto(`${config.url}/csr`);

    await csrPageObjects.loginToCSR(csrPage, config.csrUser1.username, config.csrUser1.password);
    await htmlReport.attachScreenshot(csrPage, "Login Successful");

  });

  it('SV:4160 Verify that if user missed the call, status will change to "Unavailable" and user will get "Missed call" notification', async () => {
      await csrPage.waitForFunction(() => document.querySelector('div', {text: 'From STRATUS GENERIC ENTERPRISE (pstnin-7277777190).'}));
      await expect(csrPage).toMatchElement('div', { text: 'Unavailable' }, {
          timeout: config.timeout,
        });
      
      delay(1000);

      await htmlReport.attachScreenshot(csrPage, "Missed Call Notification");
  });

  it('SV-4153: Verify that after user logged in the status will be Unavailable', async () => { 
    
    await helperFuncs.verifyTextXpath(csrPage,"(//div[@role='alert'])[2]","Unavailable");
    await htmlReport.attachScreenshot(csrPage, "Status Unavailable");

  });

  it('SV-4155: Verify that user can change status by using "Change your availability" drop down menu', async () => { 
    const isFree = await csrPage.evaluate(async () => {
        const response = await fetch('/api/me/session/current');
      return response.status === 204;
    });
    if (isFree) {
      //go available
      await csrPageObjects.csrChangeUserStatus(csrPage, "Available")

      return;
    }

    await htmlReport.attachScreenshot(csrPage, "Set CSR Available");
  });
    
  it('SV-4158: Verify that user is getting "Incoming Call" notification', async () => { 

    await delay(3000);
    await csrPage.waitForXPath("//div[@class='ui tiny modal transition visible active']//div[@class='header']", { timeout: config.timeout }, { visible: true });
    await helperFuncs.verifyTextXpath(csrPage,"//div[@class='ui tiny modal transition visible active']//div[@class='header']","Incoming Call");
    await htmlReport.attachScreenshot(csrPage, "Incoming Call Notification");
  });

  it('SV-4159: Verify that if user declines a call, status changes to unavailable', async () => { 
    
    await csrPageObjects.csrDeclineCall(csrPage);
    await helperFuncs.verifyTextXpath(csrPage,"(//div[@role='alert'])[2]","Unavailable");
    await htmlReport.attachScreenshot(csrPage, "CSR Unavailable After Call Decline");
  });

  it('csr go available', async () => { 

    await csrPageObjects.csrChangeUserStatus(csrPage, "Available")

  });

  it('SV-4161: Verify that if user click "Accept" the call, user will be presented with "Change Enterprise" dialog', async () => { 
    
    await csrPageObjects.csrAcceptCall(csrPage);
    await htmlReport.attachScreenshot(csrPage, "Change Enterprise Dialog");
    //await csrPageObjects.closeNotification(csrPage);
    //await csrPage.waitForFunction(() => document.querySelector('div', { text: 'Change Enterprise' }, { visible: true }));

  });

  it('SV-4162: Verify that user can search Enterprise by ENterprise name and client id', async () => {

    await csrPageObjects.clickOnClientName(csrPage);
    await csrPage.type('input[placeholder="Search"]', config.enterprise);

    const clientIDSearchText = await csrPage.$x("//input[@placeholder='Search']//following::div[1]//input");
    await clientIDSearchText[0].type(config.clientId);

    await htmlReport.attachScreenshot(csrPage, "Search Enterprise Using Name & ID");
    await csrPageObjects.clickOnCloseChangeEnterprise(csrPage);
  });

  it('SV-4163: Verify that user presented with billing questions after selecting enterprise', async () => {

    await expect(csrPage).toMatchElement('h4', {text: 'Billing Questions'}, {timeout: config.timeout}, { visible: true });
    await expect(csrPage).toMatchElement('p', {text: 'Please have the customer answer the following questions, which are used for billing purposes.' }, {
        timeout: config.timeout,
      });
    await htmlReport.attachScreenshot(csrPage, "Billing Question");
  });
  
  it('SV-4164: Verify that user can submit "Billing Questions" by using "Submit" button.', async () => { 

    const billingQuestionSubmitButton = await csrPage.$x("//div[@class='field css-1c2bf3b']//button[@type='submit'][text()='Submit']");
    await billingQuestionSubmitButton[0].click();

    await csrPage.waitForXPath("//div[@class='css-8hrxb2 ecpg26w0 pop-enter-done']", { timeout: config.timeout }, { visible: true });

    await expect(csrPage).toMatchElement('h5', {text: 'Saved!'}, {timeout: config.timeout}, { visible: true });
    await expect(csrPage).toMatchElement('div', {text: 'Your billing questions have been saved.'}, {timeout: config.timeout}, { visible: true });

    await htmlReport.attachScreenshot(csrPage, "Submit Billing Question");

    await csrPageObjects.closeNotification(csrPage);

  });


  it('SV-4165: Verify that user goes to "Participants" tab after submitting billing questions', async () => {

    await expect(csrPage).toMatchElement('button', {text: 'Hold All'}, {timeout: config.timeout}, { visible: true });
    await htmlReport.attachScreenshot(csrPage, "Navigated To Participants Post Submit Billing Question");
  });

  it('SV-4166: Verify that user can use "Hold All" button/functionality', async () => {

    await expect(csrPage).toMatchElement('button', {text: 'Hold All'}, {timeout: config.timeout}, { visible: true });
    await htmlReport.attachScreenshot(csrPage, "Hold All");

  });

  it('SV-4167: Verify that user can use "Join All" button/functionality', async () => {

    await expect(csrPage).toMatchElement('button', {text: 'Join All'}, {timeout: config.timeout}, { visible: true });
    await htmlReport.attachScreenshot(csrPage, "Join All");

  });

  it('SV-4168: Verify that if user click "Hold" button for participant, the button will change to "Join" and status change to "Hold"', async () => {

    const participantTab = await csrPage.$x("//li[text()='Participants']");
    await participantTab[0].click();

    const holdButtonFirstParticipant = await csrPage.$x("//button[text()='Hold']");
    await holdButtonFirstParticipant[0].click();

    await csrPage.waitForXPath("//button[text()='Join']", { timeout: config.timeout }, { visible: true });

    await expect(csrPage).toMatchElement('button', {text: 'Join'}, {timeout: config.timeout}, { visible: true });
    await expect(csrPage).toMatchElement('i[class="pause icon"]', {timeout: config.timeout}, { visible: true });
    await expect(csrPage).toMatchElement('span[title="Participant on Hold"]', {timeout: config.timeout}, { visible: true });
    await htmlReport.attachScreenshot(csrPage, "Join Button Displayed On Clicking Hold");

  });

  it('SV-4169: Verify that if user click "Join" button for participant, the button will change to "Hold" and status change to "Active"', async () => {

    const participantTab = await csrPage.$x("//li[text()='Participants']");
    await participantTab[0].click();

    const joinButtonFirstParticipant = await csrPage.$x("//button[text()='Join']");
    await joinButtonFirstParticipant[0].click();

    await csrPage.waitForXPath("//button[text()='Hold']", { timeout: config.timeout }, { visible: true });

    await expect(csrPage).toMatchElement('button', {text: 'Hold'}, {timeout: config.timeout}, { visible: true });
    await expect(csrPage).toMatchElement('i[class="phone icon"]', {timeout: config.timeout}, { visible: true });
    await expect(csrPage).toMatchElement('span[class="css-39ajlv e1496es30"]', {timeout: config.timeout}, { visible: true });
    await htmlReport.attachScreenshot(csrPage, "Hold Button Displayed On Clicking Join");

  });

  it('SV-4586: Verify that CSR can transfer call to Vendor', async () => {
    await csrPage.waitForXPath("//i[@class='exchange icon']//parent::a", {timeout: config.timeout}, { visible: true });
    const transferTab = await csrPage.$x("//i[@class='exchange icon']//parent::a");
    await transferTab[0].click();

    await csrPage.waitForXPath("//li[text()='Vendor']", { timeout: config.timeout }, { visible: true });

    const vendorTab = await csrPage.$x("//li[text()='Vendor']");
    await vendorTab[0].click();

    await csrPage.waitForXPath("//label[text()='Available Vendors']//following::input[1]", { timeout: config.timeout }, { visible: true });

    await delay(1000);

    const vendorField = await csrPage.$x("//label[text()='Available Vendors']//following::input[1]");
    await vendorField[0].click();
    await csrPage.keyboard.press('Enter');

    const languageField = await csrPage.$x("(//label[text()='Language'])[3]//following::input[1]");
    await languageField[0].click();
    await csrPage.keyboard.press('Enter');

    const transferButton = await csrPage.$x("(//button[text()='Transfer'])[3]");
    await transferButton[0].click();

    await csrPage.waitForXPath("//div[@class='css-8hrxb2 ecpg26w0 pop-enter-done']", { timeout: config.timeout }, { visible: true });

    await expect(csrPage).toMatchElement('h5', {text: 'Transfer Pending'}, {timeout: config.timeout}, { visible: true });
    await expect(csrPage).toMatchElement('div', {text: 'Your transfer request has been submitted and is awaiting a match.'}, {timeout: config.timeout}, { visible: true });
    await htmlReport.attachScreenshot(csrPage, "Transfer Call To Vendor");

    await csrPageObjects.closeNotification(csrPage);

  });

  it('SV-4587: Verify that CSR can submit Client notes', async () => {

    await csrPage.waitForXPath("//i[@class='edit icon']//parent::a", {timeout: config.timeout}, { visible: true });
    const notesTab = await csrPage.$x("//i[@class='edit icon']//parent::a");
    await notesTab[0].click();

    await csrPage.waitForXPath("//li[text()='Client']", { timeout: config.timeout }, { visible: true });

    const clientNotesTab = await csrPage.$x("//li[text()='Client']");
    await clientNotesTab[0].click();

    await expect(csrPage).toMatchElement('div', {text: 'No notes'}, {timeout: config.timeout}, { visible: true });
    await htmlReport.attachScreenshot(csrPage, "Client Notes");

  });

  it('SV-4588: Verify that CSR can submit Session notes', async () => {

    await csrPage.waitForSelector('i[class="edit icon"]', {timeout: config.timeout}, { visible: true });
    const notesTab = await csrPage.$x("//i[@class='edit icon']//parent::a");
    await notesTab[0].click();

    await csrPage.waitForXPath("//li[text()='Session']", { timeout: config.timeout }, { visible: true });

    const sessionNotesTab = await csrPage.$x("//li[text()='Session']");
    await sessionNotesTab[0].click();

    await csrPage.waitForXPath("//textarea[@placeholder='Enter session notes']", { timeout: config.timeout }, { visible: true });

    const notesTextArea = await csrPage.$x("//textarea[@placeholder='Enter session notes']");
    await notesTextArea[0].type('Test Client Notes');

    const submitButton = await csrPage.$x("//button[@type='button'][text()='Submit']");
    await submitButton[0].click();

    await expect(csrPage).toMatchElement('div', {text: 'Test Client Notes'}, {timeout: config.timeout}, { visible: true });
    await htmlReport.attachScreenshot(csrPage, "Session Notes");

  });


  it('SV-4589: Verify that CSR can submit Incident', async () => {

    await csrPage.waitForSelector('i[class="edit icon"]', {timeout: config.timeout}, { visible: true });
    const notesTab = await csrPage.$x("//i[@class='edit icon']//parent::a");
    await notesTab[0].click();

    await csrPage.waitForXPath("//li[text()='Incident']", { timeout: config.timeout }, { visible: true });

    const sessionNotesTab = await csrPage.$x("//li[text()='Incident']");
    await sessionNotesTab[0].click();

    await csrPage.waitForXPath("//label[text()='Technical Question 1']//following::i[1]", { timeout: config.timeout }, { visible: true });

    const questionOneDropDown = await csrPage.$x("//label[text()='Technical Question 1']//following::i[1]");
    await questionOneDropDown[0].click();
    await csrPage.keyboard.press('Enter');
    const questionTwoDropDown = await csrPage.$x("//label[text()='Technical Question 2']//following::i[1]");
    await questionTwoDropDown[0].click();
    await csrPage.keyboard.press('Enter');

    const submitButton = await csrPage.$x("//div[@class='field css-1c2bf3b']//button[@type='submit'][text()='Submit']");
    await submitButton[0].click();

    await csrPage.waitForXPath("//div[@class='css-8hrxb2 ecpg26w0 pop-enter-done']", { timeout: config.timeout }, { visible: true });

    await expect(csrPage).toMatchElement('h5', {text: 'Saved!'}, {timeout: config.timeout}, { visible: true });
    await expect(csrPage).toMatchElement('div', {text: 'Your incident report has been submitted.'}, {timeout: config.timeout}, { visible: true });
    await htmlReport.attachScreenshot(csrPage, "Submit Incident Report");

    await csrPageObjects.closeNotification(csrPage);

  });

  it('login and prep terp', async () => {

    await terpPage.goto(`${config.url}/iws`);
    await terpPage.waitForSelector('input[name="username"]', { timeout: config.timeout }, { visible: true });
    await iwsPageObjects.loginToIWS(terpPage, config.terpUser3.username, config.terpUser3.password);
    await terpPage.waitForSelector('img[alt="AMN Healthcare Logo"]');

    await iwsPageObjects.changeUserStatus(terpPage, "Available");

  });

  it('SV-4590: Verify that CSR can find an interpreter', async () => {

    await csrPage.waitForSelector('i[class="user outline icon"]', {timeout: config.timeout}, { visible: true });
    const findAnInterpreterTab = await csrPage.$x("//i[@class='user outline icon']//parent::a");
    await findAnInterpreterTab[0].click();

    await csrPage.waitForXPath("//h3[text()='Find an Interpreter']", { timeout: config.timeout }, { visible: true });

    const languageDropdown = await csrPage.$x("(//label[text()='Language']//following::input[1])[1]");
    await languageDropdown[0].click();
    await languageDropdown[0].type(config.contLanguage);
    await csrPage.keyboard.press('Enter');

    await delay(1000);

    try {
      const deleteSkillIcon = await csrPage.$x("//i[@class='delete icon']");
      await deleteSkillIcon[0].click();
    } catch (error) {
      console.log("Delete Skill Icon Not Available");
    }

    const findInterpreterSubmitButton = await csrPage.$x("//div[@class='css-1dw264z']//button[@type='submit'][text()='Submit']");
    await findInterpreterSubmitButton[0].click();

    await expect(csrPage).toMatchElement('p', {text: 'Searching ...'}, {timeout: config.timeout}, { visible: true });
    await htmlReport.attachScreenshot(csrPage, "Adding Interpreter");

});

it('terp answers', async () => {
    
  await iwsPageObjects.iwsAcceptCall(terpPage, "Add");
  await terpPage.waitForSelector('#session--remote-video-container video',{ timeout: config.timeout });
  await htmlReport.attachScreenshot(terpPage, "Terp Video");

});

it('terp end call', async () => {

  await iwsPageObjects.iwsEndCall(terpPage);
  await terpPage.waitForXPath("//span[@id='button--listbox-input--2']//span[text()='Wrapping']", { timeout: config.timeout }, { visible: true });

});

it('set terp available', async () => {
    
  await iwsPageObjects.changeUserStatus(terpPage, "Available");
  
});

it('SV-4584: Verify that CSR can transfer Interpreter', async () => {

  await csrPage.waitForSelector('i[class="exchange icon"]', {timeout: config.timeout}, { visible: true });
  const transferTab = await csrPage.$x("//i[@class='exchange icon']//parent::a");
  await transferTab[0].click();

  await csrPage.waitForXPath("//li[text()='Interpreter']", { timeout: config.timeout }, { visible: true });

  const interpreterTab = await csrPage.$x("//li[text()='Interpreter']");
  await interpreterTab[0].click();

  await csrPage.waitForXPath("(//label[text()='Language']//following::input[1])[1]", { timeout: config.timeout }, { visible: true });

  const languageDropdown = await csrPage.$x("(//label[text()='Language']//following::input[1])[1]");
  await languageDropdown[0].click();
  await languageDropdown[0].type(config.contLanguage);
  await csrPage.keyboard.press('Enter');

  await delay(1000);

  const fetchInterpreterButton = await csrPage.$x("(//button[contains(text(),'Fetch')])[1]");
  await fetchInterpreterButton[0].click();

  await delay(1000);

  const interpreterDropdown = await csrPage.$x("//label[text()='Available Interpreters']//following::input[1]");
  await interpreterDropdown[0].click();
  await csrPage.keyboard.press('Enter');

  const transferButton = await csrPage.$x("//div[@class='field']//button[@type='submit'][text()='Transfer']");
  await transferButton[0].click();

  await csrPage.waitForXPath("//div[@class='css-8hrxb2 ecpg26w0 pop-enter-done']", { timeout: config.timeout }, { visible: true });

  await expect(csrPage).toMatchElement('h5', {text: 'Transfer Pending'}, {timeout: config.timeout}, { visible: true });
  await expect(csrPage).toMatchElement('div', {text: 'Your transfer request has been submitted and is awaiting a match.'}, {timeout: config.timeout}, { visible: true });
  await htmlReport.attachScreenshot(csrPage, "Transfer To Interpreter");

  await csrPageObjects.closeNotification(csrPage);

});

it('terp answers transfer call', async () => {
    
  await iwsPageObjects.iwsAcceptCall(terpPage, "Transfer");
  await terpPage.waitForSelector('#session--remote-video-container video',{ timeout: config.timeout });
  await htmlReport.attachScreenshot(terpPage, "Terp Video");

});

it('terp end transfer call', async () => {

  await iwsPageObjects.iwsEndCall(terpPage);
  await terpPage.waitForXPath("//span[@id='button--listbox-input--2']//span[text()='Wrapping']", { timeout: config.timeout }, { visible: true });

});

it('SV-4593: Verify that CSR can make International Call', async () => {

  await csrPage.waitForSelector('i[class="text telephone icon"]', {timeout: config.timeout}, { visible: true });
  const dialpadTab = await csrPage.$x("//i[@class='text telephone icon']//parent::a");
  await dialpadTab[0].click();

  await csrPage.waitForXPath("//li[text()='Phone Call']", { timeout: config.timeout }, { visible: true });

  await helperFuncs.verifyTextXpath(csrPage,"//span[text()='International Calling:']//following::span[1]","Enabled");
  await htmlReport.attachScreenshot(csrPage, "International Call Enabled");

});

it('SV-4591: Verify that CSR can make phone call', async () => {

  await csrPage.waitForSelector('i[class="text telephone icon"]', {timeout: config.timeout}, { visible: true });
  const dialpadTab = await csrPage.$x("//i[@class='text telephone icon']//parent::a");
  await dialpadTab[0].click();

  await csrPage.waitForXPath("//li[text()='Phone Call']", { timeout: config.timeout }, { visible: true });

  const phoneCallButton = await csrPage.$x("//li[text()='Phone Call']");
  await phoneCallButton[0].click();

  await csrPage.waitForXPath("//label[text()='Call Reason']//following::i[1]", { timeout: config.timeout }, { visible: true });

  const callReasonDropdown = await csrPage.$x("//label[text()='Call Reason']//following::i[1]");
  await callReasonDropdown[0].click();
  await csrPage.keyboard.press('Enter');

  const telephoneNumberTextArea = await csrPage.$x("//input[@type='tel']");
  await telephoneNumberTextArea[0].type('12312312312');

  await delay(1000);

  const callButton = await csrPage.$x("//button[text()='Call']");
  await callButton[0].click();

  await csrPage.waitForXPath("//div[@class='css-8hrxb2 ecpg26w0 pop-enter-done']", { timeout: config.timeout }, { visible: true });

  await expect(csrPage).toMatchElement('h5', {text: 'Outbound Call Success'}, {timeout: config.timeout}, { visible: true });
  await expect(csrPage).toMatchElement('div', {text: 'Please check the participants list'}, {timeout: config.timeout}, { visible: true });
  await htmlReport.attachScreenshot(csrPage, "Outbound Call Initiated");

  await csrPageObjects.closeNotification(csrPage);

});

it('SV-4592: Verify that CSR can use Keypad', async () => {

  await csrPage.waitForSelector('i[class="text telephone icon"]', {timeout: config.timeout}, { visible: true });
  await csrPage.click('i[class="text telephone icon"]');

  await csrPage.waitForXPath("//li[text()='Keypad']", { timeout: config.timeout }, { visible: true });

  const keypadButton = await csrPage.$x("//li[text()='Keypad']");
  await keypadButton[0].click();

  await csrPage.waitForXPath("//span[text()='Enter digits']", { timeout: config.timeout }, { visible: true });

  await expect(csrPage).toMatchElement('span', {text: 'Enter digits'}, {timeout: config.timeout}, { visible: true });

  const oneKeypadButton = await csrPage.$x("//div[@class='css-xi606m'][text()='1']");
  await oneKeypadButton[0].click();
  const twoKeypadButton = await csrPage.$x("//div[@class='css-xi606m'][text()='2']");
  await twoKeypadButton[0].click();
  const threeKeypadButton = await csrPage.$x("//div[@class='css-xi606m'][text()='3']");
  await threeKeypadButton[0].click();
  const fourKeypadButton = await csrPage.$x("//div[@class='css-xi606m'][text()='4']");
  await fourKeypadButton[0].click();
  const fiveKeypadButton = await csrPage.$x("//div[@class='css-xi606m'][text()='5']");
  await fiveKeypadButton[0].click();

  await expect(csrPage).toMatchElement('span', {text: '12345'}, {timeout: config.timeout});
  await htmlReport.attachScreenshot(csrPage, "Use Keypad");
});


  it('SV:4594 Verify that if CSR click "Leave" button the reason dropdown is presented', async () => {
    
    const joinAllButton = await csrPage.$x("//button[text()='Join All']");
    await joinAllButton[0].click();

    await delay(1000);

    await csrPageObjects.csrEndCall(csrPage);
    await htmlReport.attachScreenshot(csrPage, "Leave Button");

  });

  it('SV-4156: Verify that user can log out by using "Logout" button under user name drop down', async () => {

    await csrPageObjects.csrLogout(csrPage);
    await htmlReport.attachScreenshot(csrPage, "Logout");
    
  });

  it('SV-4157: Verify that if user logged out, user presented with "You\'ve been logged out." message and "Login" button.', async () => {

    await expect(csrPage).toMatchElement(	
      'p', {	
            text: 'You\'ve been logged out.'	
      }, {	
            timeout: config.timeout	
          }	
      );
    
    await expect(csrPage).toMatchElement(	
      'a', {	
            text: 'Login'	
      }, {	
            timeout: config.timeout	
          }	
      );
    
      await htmlReport.attachScreenshot(csrPage, "Logout Success");

  });

});
  
  
