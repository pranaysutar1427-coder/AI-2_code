var config = require('./config');
var rtrPageObjects = require('./pageObjects/rtrPageObjects');
var iwsPageObjects = require('./pageObjects/iwsPageObjects');
var commandCenterPageObjects = require('./pageObjects/commandCenterPageObjects');
var htmlReport = require('./utils/htmlReporterFunctions');
var newPageWithNewContext = require('./utils/newPageWithNewContext');
var currentStatus;

const delay = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};


describe('RTR Regression Test', () => {
  let clientPage;
  let terpPage;

  beforeEach(() => {
    jest.setTimeout(config.timeout);
  });

  beforeAll(async done => {
    clientPage = await newPageWithNewContext(browser);
    terpPage = await newPageWithNewContext(browser);
    done();
  });

  it('log-in to RTR', async () => {

    await page.goto(`${config.url}`);
    //await rtrPageObjects.loginToRTR(page, config.rtrUser.username, config.rtrUser.password);
    //await expect(page).toMatchElement('span', { text: 'Workforce' }, { timeout: config.timeout }, { visible: true });

    await delay(2000);
    await page.waitForSelector('input[name="username"]', { timeout: config.timeout }, { visible: true });
    await page.type('input[name="username"]', config.rtrUser.username);
    const continueButton = await page.$x("//button[@type='submit']");
    await continueButton[0].click();
    await delay(2000);
    await page.waitForSelector('input[name="password"]', { timeout: config.timeout }, { visible: true });
    await page.type('input[name="password"]', config.rtrUser.password);

    await page.click('button');

    await htmlReport.attachScreenshot(page, "Login Successful");
 
  });


  it('SV-4918: Verify logging into rtr and verify workforce tab', async () => {

    await page.waitFor(5000);
    //await expect(page).toMatchElement('div', { text: 'Status' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'USERNAME' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'Team Name' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'Name' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'Language' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'Skills' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'Queues' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'Age' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'Last Refresh' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('span', { text: 'Available' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('span', { text: 'Wrapping' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('span', { text: 'In-Session' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('span', { text: 'Transfer' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'In Queue*' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'Max Queue*' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'Max Available' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'ASA*' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'Missed Calls*' }, { timeout: config.timeout }, { visible: true });

    await htmlReport.attachScreenshot(page, "Workforce Tab UI");
 
  });


  it('SV-5166: Verify logging into rtr and verify Alerts tab', async () => {

    await rtrPageObjects.navigateToAlerts(page);
    await expect(page).toMatchElement('div', { text: 'Name' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'Call Count' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'Wait Count' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'Active' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'Action' }, { timeout: config.timeout }, { visible: true });

    await htmlReport.attachScreenshot(page, "Alerts Tab UI");
 
  });
  
  it('login client', async () => {

    await clientPage.goto(`${config.url}/client`);
    await clientPage.waitForSelector('input[name="username"]', { timeout: config.timeout }, { visible: true });
    await commandCenterPageObjects.login(clientPage,config.clientUser1.username, config.clientUser1.password);
    //await expect(clientPage).toMatchElement('a', { text: 'Languages' });
    await commandCenterPageObjects.checkifFreeAndCancelResumeDialog(clientPage);

  });

  
  it('login terp', async () => {

    await terpPage.goto(`${config.url}/iws`);
    await terpPage.waitForSelector('input[name="username"]', { timeout: config.timeout }, { visible: true });
    await iwsPageObjects.loginToIWS(terpPage, config.terpUser3.username, config.terpUser3.password);
    await terpPage.waitForSelector('img[alt="AMN Healthcare Logo"]');

  });

  it('SV-5243: Verify RTR displays correct Status Transitions per individual user', async () => {

    await rtrPageObjects.navigateToWorkforce(page);

    currentStatus = await rtrPageObjects.getUserStatus(page, config.terpUser3.username);
    await expect(currentStatus).toEqual('Unavailable');
    await htmlReport.attachScreenshot(page, "Terp Status Unavaiable");

    await iwsPageObjects.changeUserStatus(terpPage, "Available");
    await page.waitFor(2000);
    currentStatus = await rtrPageObjects.getUserStatus(page, config.terpUser3.username);
    await expect(currentStatus).toEqual('Available');
    await htmlReport.attachScreenshot(page, "Terp Status Avaiable");


    await iwsPageObjects.changeUserStatus(terpPage, "Break");
    await page.waitFor(2000);
    currentStatus = await rtrPageObjects.getUserStatus(page, config.terpUser3.username);
    await expect(currentStatus).toEqual('Available');
    await htmlReport.attachScreenshot(page, "Terp Status Break");
    await delay(3000);
 
  });

  it('client dials', async () => {

    const b = await clientPage.$x('//*[text()="Spanish"]');
    await b[0].click();
    
    //await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await expect(clientPage).toMatch('Finding a match...', { timeout: config.timeout });
  });

  it('SV-5165: Verify logging into rtr and verify QueueRequest tab', async () => {

    await rtrPageObjects.navigateToQueueRequests(page);
    await expect(page).toMatchElement('div', { text: 'Status' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'Username' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'Language' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'Skills' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'Enterprise' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'Age' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'Priority' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('span', { text: 'Waiting' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('span', { text: 'Matched' }, { timeout: config.timeout }, { visible: true });

    await htmlReport.attachScreenshot(page, "Queue Requests Tab UI");


    var queueStatus;
    queueStatus = await rtrPageObjects.getQueueRequestsStatus(page, config.clientUser1.username);
    await expect(queueStatus).toEqual('matched');
    await htmlReport.attachScreenshot(page, "Queue Request Waiting");

    await iwsPageObjects.changeUserStatus(terpPage, "Available");
    await page.waitFor(2000);
    queueStatus = await rtrPageObjects.getQueueRequestsStatus(page, config.clientUser1.username);
    await expect(queueStatus).toEqual('matched');
    await htmlReport.attachScreenshot(page, "Queue Request Matched");
 
  });

  it('terp answers', async () => {
    
    await iwsPageObjects.iwsAcceptCall(terpPage, "Queue");
    await htmlReport.attachScreenshot(terpPage, "Terp Answers");
    await page.waitFor(2000);

  });

  it('SV-5164: Verify logging into rtr and verify ACD tab', async () => {

    await rtrPageObjects.navigateToACD(page);
    await expect(page).toMatchElement('div', { text: 'Status' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'Client' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'Selected' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'Waiting' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('div', { text: 'Time' }, { timeout: config.timeout }, { visible: true });

    await htmlReport.attachScreenshot(page, "ACD Tab UI");
    
    await expect(page).toMatchElement('div', { text: config.clientUser1.username }, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Client Connected To Agent");
 
  });

  it('client ends video and returns to homepage', async () => {
    //await clientPage.click('button');
    const endbtn = clientPage.$x('/html/body/div[2]/div/div[3]/div/div[3]/div/button[2]/span');
    await endbtn[0].click;
    await clientPage.waitFor(2000);
    await clientPage.waitForXPath("//i[text()=' Skip to Dashboard']", { timeout: config.timeout }, { visible: true });
    const elementsSkipToDashboard = await clientPage.$x("//i[text()='Go to languages']");
    await elementsSkipToDashboard[0].click();
    await expect(clientPage).toMatchElement('button', { text: 'Other Languages (Audio)' }, { timeout: config.timeout }, { visible: true });
    await expect(clientPage).toMatchElement(".dashboard-content", { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(clientPage, "Client To Homepage");
    
  });

  it('terp logout', async () => {
    
    await iwsPageObjects.iwsSignout(terpPage);
    await htmlReport.attachScreenshot(terpPage, "Terp Sign Out");
    
  });


});

