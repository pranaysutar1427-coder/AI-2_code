var config = require('./config');
var newPageWithNewContext = require('./utils/newPageWithNewContext');
var chooseReactSelect = require('./utils/chooseReactSelect');

describe('Regression Test', () => {
  let terpPage;
  let rtrPage;

  beforeEach(() => {
    jest.setTimeout(config.timeout);
  });

  beforeAll(async done => {
    terpPage = await newPageWithNewContext(browser);
    rtrPage = await newPageWithNewContext(browser);
    done();
  });

  it('SV-1387: Bad Login', async () => {
    await page.goto(`${config.url}/client`);
    await expect(page).toMatch('Forgot');
    await page.type('input[name="username"]', config.clientUser1.username);
    await page.type('input[name="password"]', 'invalidPassword');
    await page.click('button');
    
    await expect(page).toMatchElement('span', { text: 'Username or password is incorrect. Try again.' });

    });

    it('SV-1388: Verify Forgot Password Functionality', async () => {
      await page.goto(`${config.url}/client`);
      await expect(page).toMatch('Forgot');
      const elementsForgotPassword = await page.$x('//a[text()=\'Forgot Password?\']')
      await elementsForgotPassword[0].click()
      await page.type('input[name="username"]', config.clientUser1.username);
      await page.click('button');

      await expect(page).toMatchElement('span', { text: 'Please request a passwordchange from your IT administrator' });
  
      });

      it('SV-1387: Validate Login', async () => {
        await page.goto(`${config.url}/client`);
        await expect(page).toMatch('Forgot');
        await page.type('input[name="username"]', config.clientUser1.username);
        await page.type('input[name="password"]', config.clientUser1.password);
        await page.click('button');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        await expect(page).toMatchElement('div', { text: config.clientUser1.username });
        await expect(page).toMatchElement('a', { text: 'Languages' }); 
    
        });

  // login and kill any existing session
  it('Post Login Prep Client', async () => {

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

  it('SV-5200: Verify user is able to play the training video in the support menu', async () => {
    
    const elementsSupport = await page.$x("//a[text()=\'Support\']")
    await elementsSupport[0].click();
    const elementsTrainingVid = await page.$x('//li[text()=\'Training Video\']')
    await elementsTrainingVid[0].click()
    await expect(page).toMatchElement('source[type="video/mp4"]')
  
    });
  
  
  it('SV-5201: Verify the microphone test and the camera test in the media diagnostics menu', async () => {
    const elementsMediaDiag = await page.$x("//li[text()=\'Media Diagnostics\']")
    await elementsMediaDiag[0].click();
    await expect(page).toMatchElement('h2', { text: 'Media Diagnostics' });
    const elementsYes1 = await page.$x("//button[text()=\'Yes\']")
    await elementsYes1[0].click();
    const elementsYes2 = await page.$x("//button[text()=\'Yes\']")
    await elementsYes2[0].click();
    await expect(page).toMatchElement('div', { text: 'All tests passed.' });
  
    });
  
  it('SV-5202: Verify that the user is able to view language hours in the language hours menu option', async () => {
    const elementsLangHours = await page.$x("//li[text()=\'Language Hours\']")
    await elementsLangHours[0].click();
    await expect(page).toMatchElement('h4', { text: 'Hours of Operation by Language' });
   
    });
  
  it('SV-5203: Verify that the user is able to view the contact information by clicking on the Contact menu and verify contacting the support through the app', async () => {
    const elementsLangHours = await page.$x("//li[text()=\'Contact\']")
    await elementsLangHours[0].click();
    await expect(page).toMatchElement('strong', { text: 'Phone:' });
  
    });


  // login, kill any existing session, and then go available
  it('verify terp status is displayed as unavailable on login', async () => {
    await terpPage.goto(`${config.url}/client`);
    await expect(terpPage).toMatch('Forgot');

    await terpPage.type('input[name="username"]', config.terpUser1.username);
    await terpPage.type('input[name="password"]', config.terpUser1.password);
    await terpPage.click('button');
    await terpPage.waitForNavigation({ waitUntil: 'networkidle2' });
    await expect(terpPage).toMatchElement('button[aria-label="Unavailable"]');
  });


  it('verify the header section of the terp station', async () => {
    await expect(terpPage).toMatchElement('a', { text: 'Station' });
    await terpPage.click('a', { text: 'Station' });
    await expect(terpPage).toMatch('section[class="stratus-module hero lazy-bg tiny "]', {
        timeout: config.timeout});
    await terpPage.click('a', { text: 'Support' });
    await expect(terpPage).toMatchElement('h2', { text: 'Stratus Customer Support' });
    await terpPage.click('a', { text: 'Settings' });
    await expect(terpPage).toMatchElement('h2', {text: 'Settings'});
   
});

it('Verify logging into rtr and verify the tabs', async () => {
    await rtrPage.goto(`${config.url}/client`);
    await expect(rtrPage).toMatch('Forgot');

    await rtrPage.type('input[name="username"]', config.rtrUser.username);
    await rtrPage.type('input[name="password"]', config.rtrUser.password);
    await rtrPage.click('button');
    await rtrPage.waitForNavigation({ waitUntil: 'networkidle2' });
    await expect(rtrPage).toMatchElement('a', {text: 'Stratus Video'});
    await expect(rtrPage).toMatchElement('a', {text: 'Workforce'});
    await expect(rtrPage).toMatchElement('a', {text: 'Point-to-Point'});
    await expect(rtrPage).toMatchElement('a', {text: 'ACD'});
    await expect(rtrPage).toMatchElement('a', {text: 'Queue Requests'});
    await expect(rtrPage).toMatchElement('a', {text: 'Alerts'});
});

/*it('Verify Terp can change statuses(Available, Standby, Unavailable, Break, Offline)',
'and verify RTR displays right status for all status changes', async() => {
    await terpPage.evaluate(() => {
        document.querySelector('li[data-status="available"]').click();
      });
    await expect(rtrPage).

});*/


});
