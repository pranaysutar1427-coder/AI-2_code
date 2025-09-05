const config = require('./config');
const newPageWithNewContext = require('./utils/newPageWithNewContext');
const client = require('twilio')(config.twilioSid, config.twilioToken);
var chooseReactSelect = require('./utils/chooseReactSelect');

const delay = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

client.calls
  .create({
    url: 'http://demo.twilio.com/docs/voice.xml',
    to: config.csrToPhoneNumber,
    from: config.fromPhoneNumber,

  })
  .then(call => console.log(call.sid))
  .done();

describe('CSR call including multiple parties', () => {
  let csrPage;
  let terpPage;
  let terp2Page;

  beforeEach(() => {
    jest.setTimeout(config.timeout);
  });

  beforeAll(async done => {
    csrPage = await newPageWithNewContext(browser);
    terpPage = await newPageWithNewContext(browser);
    terp2Page = await newPageWithNewContext(browser);
    done();
  });

  // login, kill any existing session, and then go available
  it('login and prep csr', async () => {
    await csrPage.goto(`${config.url}/csr`);
    await expect(csrPage).toMatch('Forgot');
    await csrPage.type('input[name="username"]', config.csrUser1.username);
    await csrPage.type('input[name="password"]', config.csrUser1.password);
    await csrPage.click('button');
    await csrPage.waitForNavigation({ waitUntil: 'networkidle2' });
    await expect(csrPage).toMatchElement('h2', { text: 'Message Board' });

    // since we don't do any backend seeding yet, we need to
    // manually kill any existing sessions
    const isFree = await csrPage.evaluate(async () => {
      const response = await fetch('/api/me/session/current');
      return response.status === 204;
    });

    if (isFree) {
      // go available
      await csrPage.evaluate(() => {
        document.querySelector('div[role="option"] i.icon.check').click();
      });

      await expect(csrPage).toMatchElement('div', { text: 'Available' }, {
        timeout: config.timeout,
      });

      return;
    }
  });

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

      await expect(terpPage).toMatchElement(
        'button.operatorStatus[aria-label="Available"]',
        {
          timeout: config.timeout,
        }
      );

      return;
    }

    await terpPage.waitForSelector('#resumeSessionModal', { visible: true });
    await terpPage.click('#resumeSessionModal a[data-e2e="cancel"');
    await terpPage.waitForNavigation({ waitUntil: 'networkidle2' });

    await expect(terpPage).toClick('button[data-e2e="Finalize"', {
      timeout: config.timeout,
    });

    await terpPage.waitForNavigation({ waitUntil: 'networkidle2' });
    await expect(terpPage).toMatchElement('a', { text: 'Station' });

    // go available
    await terpPage.evaluate(() => {
      document.querySelector('li[data-status="available"]').click();
    });

    await expect(terpPage).toMatchElement(
      'button.operatorStatus[aria-label="Available"]',
      {
        timeout: config.timeout,
      }
    );
  });

  it('csr receives a call and answers', async () => {
    await csrPage.waitForFunction(() => document.querySelector('i', { text: 'incoming call' }, { visible: true }));
    await csrPage.click('button[class="ui icon positive right labeled button"]');
    await csrPage.waitForFunction(() => document.querySelector('button', { text: 'Join All' }));
    await delay(5000);
  });

  // login, kill any existing session, and then go unavailable
  it('login and prep terp2', async () => {
    await terp2Page.goto(`${config.url}/client`);
    await expect(terp2Page).toMatch('Forgot');

    await terp2Page.type('input[name="username"]', config.terpUser2.username);
    await terp2Page.type('input[name="password"]', config.terpUser2.password);
    await terp2Page.click('button');
    await terp2Page.waitForNavigation({ waitUntil: 'networkidle2' });

    await expect(terp2Page).toMatchElement('a', { text: 'Station' });

    // since we don't do any backend seeding yet, we need to
    // manually kill any existing sessions
    const isFree = await terp2Page.evaluate(async () => {
      const response = await fetch('/api/me/session/current');
      return response.status === 204;
    });

    if (isFree) {
      // go unavailable
      await terp2Page.evaluate(() => {
        document.querySelector('li[data-status="lunch"]').click();
      });

      await expect(terp2Page).toMatchElement(
        'button.operatorStatus[aria-label="Lunch"]',
        {
          timeout: config.timeout,
        }
      );

      return;
    }

    await terp2Page.waitForSelector('#resumeSessionModal', { visible: true });
    await terp2Page.click('#resumeSessionModal a[data-e2e="cancel"');
    await terp2Page.waitForNavigation({ waitUntil: 'networkidle2' });

    await expect(terp2Page).toClick('button[data-e2e="Finalize"', {
      timeout: config.timeout,
    });

    await terp2Page.waitForNavigation({ waitUntil: 'networkidle2' });
    await expect(terp2Page).toMatchElement('a', { text: 'Station' });

    // go available
    await terp2Page.evaluate(() => {
      document.querySelector('li[data-status="lunch"]').click();
    });

    await expect(terp2Page).toMatchElement(
      'button.operatorStatus[aria-label="lunch"]',
      {
        timeout: config.timeout,
      }
    );
  });


  it('csr calls terp', async () => {
    await csrPage.waitForFunction(() => document.querySelector('div[aria-label="language"]'));
    await csrPage.click('div[aria-label="language"]', { clickCount: 2 });
    await csrPage.type('div[aria-label="language"]', config.contLanguage);
    await csrPage.keyboard.press('Enter');
    await expect(csrPage).toClick('button[class="ui fluid primary button"]', {
      timeout: config.timeout
    });
    await csrPage.waitForSelector('div', { text: 'Searching ...' });
    await delay(10000); 
  });

  it('terp joins the call with csr and client', async () => {
    await terpPage.waitForSelector('#incomingCall', { visible: true });
    await terpPage.click('#incomingCall a[class="green"]');
    await expect(terpPage).toMatchElement('#remoteVideo', {
      timeout: config.timeout,
    });
  });

  it('terp2 goes available', async () => {
    // go available
    await terp2Page.evaluate(() => {
      document.querySelector('li[data-status="available"]').click();
    });
  }); 

  it('csr performs a warm transfer and adds terp2', async () => {
    await csrPage.waitForSelector('i[class="exchange icon"]', { visible: true});
    await csrPage.click('i[class="exchange icon"]');
    await csrPage.waitForSelector('div[aria-label="Language"]');
    await csrPage.click('div[aria-label="Language"]', { clickCount: 2 });
    await csrPage.type('div[aria-label="Language"]', config.contLanguage);
    await csrPage.keyboard.press('Enter');
    await delay(4000); 
    await csrPage.click('button[class="ui mini button css-1s26z8e"]')
    await delay(3000);
    await csrPage.click('div[aria-label="Interpreters"]', { clickCount: 2 });
    await csrPage.keyboard.press('Enter');
    await expect(csrPage).toClick('button', {text: 'Transfer'});
    await csrPage.waitForFunction(() => document.querySelector('div', {text: 'Your transfer request has been submitted and is awaiting a match.'}));
  });

  it('terp2 joins the call with csr and client', async () => {
    await terp2Page.waitForSelector('#warmTransferDecisionModal', { visible: true });
    await terp2Page.click('#warmTransferDecisionModal a[class="green"]');
    await expect(terp2Page).toMatchElement('#remoteVideo', {
      timeout: config.timeout,
    });
  });

  it('end the call as terp1', async () => {
    await terpPage.click('.controls-right-group a.controls-end');
    await terpPage.waitForFunction(() => document.querySelector('button[data-e2e="Finalize"]'));
  })

  it('end call as terp2', async () => {
    await terp2Page.click('.controls-right-group a.controls-end');
    await terp2Page.waitForFunction(() => document.querySelector('button[data-e2e="Finalize"]'));
});
});

  

  
  /*it('csr performs a warm transfer to another csr', async() => {

  })

  it('drop the call as second csr', async() => {

  })


  it('csr makes an outbound call',  async() => {

  }) */

