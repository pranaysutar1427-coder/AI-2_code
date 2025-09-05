var config = require('./config');
var helperFuncs = require('./utils/helperFunctions');
var htmlReport = require('./utils/htmlReporterFunctions');
var newPageWithNewContext = require('./utils/newPageWithNewContext');
var commandCenterPageObjects = require('./pageObjects/commandCenterPageObjects');
var iwsPageObjects = require('./pageObjects/iwsPageObjects');
var csrPageObjects = require('./pageObjects/csrPageObjects');
var chooseReactSelect = require('./utils/chooseReactSelect');

const delay = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};


describe('IWS Regression Test', () => {
  //let terpPage;
  let newPage;
  //let terp2Page;
  let csrPage;

  beforeEach(() => {
    jest.setTimeout(config.timeout);
  });

  beforeAll(async done => {
    //terpPage = await newPageWithNewContext(browser);
    //terp2Page = await newPageWithNewContext(browser);
    csrPage = await newPageWithNewContext(browser);
    done();
  });

  it ('login and prep client', async () =>{
    await page.goto(`${config.url}/client`);
    await page.waitForSelector('input[name="username"]', { timeout: config.timeout }, { visible: true });
    await commandCenterPageObjects.login(page,config.clientUser1.username, config.clientUser1.password);
    //await expect(page).toMatchElement('a', { text: 'Languages' });
    await commandCenterPageObjects.checkifFreeAndCancelResumeDialog(page);
    await delay(3000);
  });

    it('Verify that user can login to CWS', async () => {
        await context.overridePermissions(`${config.url}/cws`, ['notifications']);
        await csrPage.goto(`${config.url}/cws`);
        await delay(2000);
        await csrPage.type('input[name="username"]', config.csrUser2.username);
        await csrPage.click('button');
        await delay(2000);
        await csrPage.type('input[name="password"]', config.csrUser2.password);
        await csrPage.click('button');
    
        //await cwsPageObjects.loginToCWS(page, config.csrUser2.username, config.csrUser2.password);
        await page.waitForSelector(cwsPageObjects.amnLogo);
        await htmlReport.attachScreenshot(page, "Login Successful");
        await cwsPageObjects.changeUserStatus(page, "Available");
        await delay(10000);
        
      });

      it ('clcik on Audio button', async () =>{
        const AudioBtn = await page.$x("//button[text()='Other Languages (Audio)']");
        await AudioBtn[0].click();
        await delay(3000);
        });

});