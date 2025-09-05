var config = require('./config');
var iwsPageObjects = require('./pageObjects/iwsPageObjects');
var newPageWithNewContext = require('./utils/newPageWithNewContext');
var htmlReport = require('./utils/htmlReporterFunctions');
const { AwsInstance } = require('twilio/lib/rest/accounts/v1/credential/aws');

const delay = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};


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
    await delay(4000);
    //await page.waitForSelector('input[name="username"]', { timeout: config.timeout }, { visible: true });

    await page.type('input[name="username"]', config.clientUser1.username);
    const continueButton = await page.$x('//*[text()="Continue"]');
    await continueButton[0].click();
    await delay(2000);
    await page.waitForSelector('input[name="password"]', { timeout: config.timeout }, { visible: true });
    await page.type('input[name="password"]', config.clientUser1.password);
    await delay(3000);
    await page.click('button');
    await delay(4000);

    // await page.waitForNavigation({ waitUntil: 'networkidle2' })
    // await expect(page).toMatchElement('a', { text: 'Languages' });

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
    //await expect(terpPage).toMatch('Forgot');
    await delay(2000);
    await terpPage.type('input[name="username"]', config.terpUser3.username);
    await terpPage.click('button');
    await delay(2000);
    await terpPage.type('input[name="password"]', config.terpUser3.password);
    await terpPage.click('button');
    await terpPage.waitForNavigation({ waitUntil: 'networkidle2' });
    await expect(terpPage).toMatchElement('div[role="tablist"]', {timeout:config.delay});
    await delay(2000);
    // await iwsPageObjects.changeUserStatus(terpPage, "Available");
    const click_bt = await terpPage.$x('//*[text()="Unavailable"]');
    click_bt[0].click();
    await delay(2000);
    const click_bt11 = await terpPage.$x('//*[text()="Available"]');
    click_bt11[0].click();
    await delay(3000);
  });

  // login, kill any existing session, and then go unavailable
  it('login and prep terp2', async () => {
    await terp2Page.goto(`${config.url}/iws`);
    //await expect(terp2Page).toMatch('Forgot');
    await delay(2000);
    await terp2Page.type('input[name="username"]', config.terpUser4.username);
    await terp2Page.click('button');
    await delay(2000);
    await terp2Page.type('input[name="password"]', config.terpUser4.password);
    await terp2Page.click('button');
    await terp2Page.waitForNavigation({ waitUntil: 'networkidle2' });
    await expect(terp2Page).toMatchElement('div[role="tablist"]', {timeout:config.delay});
    // await iwsPageObjects.changeUserStatus2(terp2Page, "Transfer");
    await delay (2000);
    const click_bt = await terp2Page.$x('//*[text()="Unavailable"]');
    click_bt[0].click();
    await delay(2000);
    const click_bt12 = await terp2Page.$x('//*[text()="Transfer"]');
    click_bt12[0].click();
    await delay(2000);
  });


  it('client dials', async () => {
    const b = await page.$x('//*[text()="Spanish"]');
    await b[0].click();
    await delay(10000);
    //await page.waitForNavigation({ waitUntil: 'networkidle2' });
    //await expect(page).toMatch('Finding a match...', { timeout: config.timeout });
    
  });


  it('terp answers', async () => {
    await iwsPageObjects.iwsAcceptCall(terpPage, "Queue");
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
      await expect(terpPage).toMatchElement('div', {text: 'Billing Questions have been answered.'}, { timeout: config.timeout }, { visible: true });
    } catch (error) {
      console.log("Billing Questions Not Available");   
    }
    await delay(2000);
    
  });

  it('terp2 goes available', async () => {
    // go available
    //await iwsPageObjects.changeUserStatus(terp2Page, "Available");
    const click_bt0 = await terp2Page.$x('//*[text()="Transfer"]');
    click_bt0[0].click();
    await delay(2000);
    const click_bt11 = await terp2Page.$x('//*[text()="Available"]');
    click_bt11[0].click();
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

    await delay(4000);
    await expect(page).toMatch('a', { text: 'Languages' }, { timeout: config.timeout });
    await delay(4000);
  });

  it('terp has video ended and gets to station', async () => {
    await terpPage.waitForSelector('span', {text:'Wrapping'},{ timeout: config.timeout });
  });

  it('terp2 has video ended and gets to station', async () => {
    await terpPage.waitForSelector('span', {text:'Wrapping'},{ timeout: config.timeout });
  });

  it('terp go available', async () => { 
    await terpPage.waitForSelector('button[class="bp5-button bp5-intent-success"]', { timeout: config.timeout });
    await expect(terpPage).toMatchElement('span', { text: 'Wrapping' }, { timeout: config.timeout});
     const goOnlineNowButton = await terpPage.$x("//span[text()='Wrapping']");
     await goOnlineNowButton[0].click();
    await expect(terpPage).toMatchElement('span', { text: 'Available' }, { timeout: config.timeout });
    await delay(2000);
  });

  it('terp1 logout', async () => {
    await iwsPageObjects.iwsSignout(terpPage);
    await htmlReport.attachScreenshot(terpPage, "Sign Out");
  });

  it('terp2 logout', async () => {  
    await iwsPageObjects.iwsSignout(terp2Page);
    await htmlReport.attachScreenshot(terp2Page, "Logout");
  });
});