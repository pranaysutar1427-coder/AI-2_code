var config = require('./config');
var newPageWithNewContext = require('./utils/newPageWithNewContext');

describe('2-Party Call', () => {
  let terpPage;

  beforeEach(() => {
    jest.setTimeout(30000);
  });

  beforeAll(async done => {
    terpPage = await newPageWithNewContext(browser);
    done();
  });

  // login and kill any existing session
  it('login and prep client', async () => {
    await page.goto(`${config.url}/client`);
    await expect(page).toMatch('Forgot');

    await page.type('input[name="username"]', config.clientUser1.username);
    await page.type('input[name="password"]', config.clientUser1.password);
    await page.click('button');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    await expect(page).toMatchElement('a', { text: 'Languages' });

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

    await expect(page).toMatch('Provide Feedback');
    await expect(page).toClick('button', { text: 'Skip' });
    await expect(page).toMatchElement(
      'a',
      { text: 'Languages' },
      { timeout: 3000 }
    );
  });

  // login, kill any existing session, and then go available
  it('login and prep terp', async () => {
    await terpPage.goto(`${config.url}/client`);
    await expect(terpPage).toMatch('Forgot');

    await terpPage.type('input[name="username"]', config.terpUser1.username);
    await terpPage.type('input[name="password"]', config.terpUser1.password);
    await terpPage.click('button');
    await terpPage.waitForNavigation({ waitUntil: 'networkidle2' });

    await expect(terpPage).toMatchElement('a', { text: 'Station' });

    // since we don't do any backend seeding yet, we need to
    // manually kill any existing sessions
    const isFree = await terpPage.evaluate(async () => {
      const response = await fetch('/api/me/session/current');
      return response.status === 204;
    });

    if (isFree) {
      // go available
      await terpPage.evaluate(() => {
        document.querySelector('li[data-status="available"]').click();
      });

      await expect(terpPage).toMatchElement('button.operatorStatus[aria-label="Available"]', {
        timeout: 2000,
      });

      return;
    }

    await terpPage.waitForSelector('#resumeSessionModal', { visible: true });
    await terpPage.click('#resumeSessionModal a[data-e2e="cancel"');
    await terpPage.waitForNavigation({ waitUntil: 'networkidle2' });

    await expect(terpPage).toClick('button[data-e2e="Finalize"', {
      timeout: 2000,
    });

    await terpPage.waitForNavigation({ waitUntil: 'networkidle2' });
    await expect(terpPage).toMatchElement('a', { text: 'Station' });

    // go available
    await terpPage.evaluate(() => {
      document.querySelector('li[data-status="available"]').click();
    });

    await expect(terpPage).toMatchElement('button.operatorStatus.available', {
      timeout: 2000,
    });
  });

  it('client dials', async () => {
    await expect(page).toClick('span', {
      text: config.language,
      timeout: 2000,
    });

    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await expect(page).toMatch('Finding a match...', { timeout: 2000 });
  });

  it('terp answers', async () => {
    await terpPage.waitForSelector('#incomingCall', { visible: true });
    await terpPage.click('#incomingCall a[data-e2e="accept"');

    await terpPage.waitForNavigation({ waitUntil: 'networkidle2' });
    await expect(terpPage).toMatchElement('#remoteVideo', {
      timeout: 3000,
    });
  });

  it('client has video', async () => {
    await expect(page).toMatchElement('#remoteVideo video', {
      timeout: 3000,
    });
  });

  it('terp has video', async () => {
    await expect(terpPage).toMatchElement('#remoteVideo video', {
      timeout: 3000,
    });
  });

  it('client ends video and gets feedback page', async () => {
    await page.click('.controls-right-group a.controls-end');
    await page.waitForSelector('div[data-e2e="feedback-page"]', {
      timeout: 3000,
    });

    await expect(page).toMatch('Provide Feedback', { timeout: 3000 });
  });

  it('terp has video ended and gets to station', async () => {
    await expect(terpPage).toMatchElement('button[data-e2e="Finalize"]', {
      timeout: 3000,
    });
  });
});
