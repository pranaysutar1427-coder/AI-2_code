const config = require('./config');
const newPageWithNewContext = require('./utils/newPageWithNewContext');
const client = require('twilio')(config.twilioSid, config.twilioSid);

client.calls
  .create({
    url: 'http://demo.twilio.com/docs/voice.xml',
    to: config.toPhoneNumber,
    from: config.fromPhoneNumber,
  })
  .then(call => console.log(call.sid))
  .done();

describe('2-Party Call', () => {
  let terpPage;

  beforeEach(() => {
    jest.setTimeout(30000);
  });

  beforeAll(async done => {
    terpPage = await newPageWithNewContext(browser);
    done();
  });

  // login, kill any existing session, and then go available
  it('login and prep terp', async () => {
    await terpPage.goto(`${config.url}/client`);
    await expect(terpPage).toMatch('Forgot');

    await terpPage.type('input[name="username"]', config.terpUser3.username);
    await terpPage.type('input[name="password"]', config.terpUser3.password);
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

      await expect(terpPage).toMatchElement('button.operatorStatus.available', {
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

  it('terp answers', async () => {
    await terpPage.waitForSelector('#incomingCall', { visible: true });
    await terpPage.click('#incomingCall a[data-e2e="accept"');

    await terpPage.waitForNavigation({ waitUntil: 'networkidle2' });
    await expect(terpPage).toMatchElement('#remoteVideo', {
      timeout: 3000,
    });
  });
});
