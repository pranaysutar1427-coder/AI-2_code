// jest-puppeteer.config.js
module.exports = {
  launch: {
    dumpio: true,
    //executablePath: '/usr/local/bin/chromium',
    headless: process.env.CI === 'true',
    slowMo: 30,
    defaultViewport: null,
    args: [
      '--use-fake-device-for-media-stream',
      '--use-fake-ui-for-media-stream',
      '--no-sandbox',
      '--disable-gpu',
      '--start-maximized',
      '--disable-extensions',
    ],
  },
  browserContext: 'default',
};
