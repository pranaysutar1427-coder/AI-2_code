const config = require('./config');
const newPageWithNewContext = require('./utils/newPageWithNewContext');
const client = require('twilio')(config.twilioSid, config.twilioToken);

const delay = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

client.calls
  .create({
    url: 'http://demo.twilio.com/docs/voice.xml',
    to: config.toPhoneNumber,
    from: config.fromPhoneNumber,

  })
  .then(call => console.log(call.sid))
  .done();

describe('PSTN Call', () => {
  let terpPage;

  beforeEach(() => {
    jest.setTimeout(config.timeout);
  });

  beforeAll(async done => {
    terpPage = await newPageWithNewContext(browser);
    done();
  });

  // login, kill any existing session, and then go available
  it('login and prep audio terp', async () => {
    await terpPage.goto(`${config.url}/iws`);
    await expect(terpPage).toMatch('Forgot');

    await terpPage.type('input[name="username"]', config.terpUser1.username);
    await terpPage.type('input[name="password"]', config.terpUser1.password);
    await terpPage.click('button');
    await terpPage.waitForNavigation({ waitUntil: 'networkidle2' });
    await expect(terpPage).toMatchElement('div[role="tablist"]', {timeout:config.delay});

    // since we don't do any backend seeding yet, we need to
    // manually kill any existing sessions
    const isFree = await terpPage.evaluate(async () => {
      const response = await fetch('/api/me/session/current');
      return response.status === 204;
    });

    if (isFree) {
      // go available
      await delay(3000);
      const unavailableStatus = await terpPage.$x("//span[contains(text(),'Unavailable')]", {waitUntil: 'span'} );//since waitForXpath functio is not available for some reason, changed to wait until span appears
      await unavailableStatus[0].click();
      const availableStatus = await terpPage.$x("//div[contains(text(),'Available')]");
      await availableStatus[0].click();
      await expect(terpPage).toMatchElement('span', {text: 'Available'},
        {
          timeout: config.timeout,
        }
      );
      return;
    }
  });

  it('terp receives inbound PSTN call and answers', async () => {
   await terpPage.waitForSelector('span[icon="phone"]', { visible: true });
   const acceptButton = await terpPage.$x("//span[contains(text(),'Accept')]");
   await acceptButton[0].click();
   await expect(terpPage).toMatchElement('#session--remote-video-container', {
      timeout: config.timeout,
    });
  });

  it('terp has audio screen', async () => {
    await expect(terpPage).toMatchElement('#session--selfview-container', {
      timeout: config.timeout,
    });
  });

  it('terp dials outbound phone number', async () => {
    await terpPage.click('#session-controls--phone-input');
    await terpPage.type('#session-controls--phone-input', config.pstnNumber);
    await terpPage.waitForSelector('button[type="submit"]', {timeout: config.timeout });
    await terpPage.click('button[type="submit"]');
    await delay(config.delay);
  });

  it('iws displays outbound number dialed message', async () => {
    await expect(terpPage).toMatchElement('p', { text: 'Please check the Participants List.'}, {
      timeout: config.timeout,
    });
  });
});
