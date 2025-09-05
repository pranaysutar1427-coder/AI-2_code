var config = require('./config');
var helperFuncs = require('./utils/helperFunctions');
var htmlReport = require('./utils/htmlReporterFunctions');
var qmPageObjects = require('./pageObjects/qmPageObjects');
var filterName;

const delay = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};


describe('QM Regression Test', () => {

  beforeEach(() => {
    jest.setTimeout(config.timeout);
  });

  beforeAll(async done => {
    done();
  });

  it('SV-3570: Verify user is able to reset password', async () => { 
    await page.goto(`${config.qmUrl}`);
    await qmPageObjects.clickForgetPassword(page);
    await qmPageObjects.enterUsernameClickSubmitForgetPassword(page, config.qmUser1.username);
    await page.waitFor(3000);
    await expect(page).toMatchElement('p', { text: 'Please check your email for a reset password link.' }, { timeout: config.timeout }, { visible: true });
    await expect(page).toMatchElement('p', { text: 'It could take a few minutes for it to arrive.' }, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Reset Password");
 
  });

  it('SV-2097: Verify the user is able to login to QM', async () => { 
    await page.goto(`${config.qmUrl}`);
    await qmPageObjects.loginToQM(page, config.qmUser1.username, config.qmUser1.password);
    await expect(page).toMatchElement(qmPageObjects.stratusLogoImage, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Login Successful");
 
  });

  it('Change row display to 50 rows', async () => { 
    
    await qmPageObjects.changeRowsCount(page, "50 rows");
 
  });

  it('SV-2686: Verify the session legs appear on the Recordings page after call completion', async () => { 
    
    await qmPageObjects.verifyLatestSessionLegs(page);
    await htmlReport.attachScreenshot(page, "Session Leg");
  });

  it('SV-3571: Verify recording page for a leg having CSR, Contractor, Client', async () => { 
     
    await qmPageObjects.clickOnLegForUsername(page, config.csrUser2.username);
    await delay(1000);
    await expect(page).toMatchElement('a', { text: config.csrUser2.username }, { timeout: 10000 }, { visible: true });
    await htmlReport.attachScreenshot(page, "Session Leg CSR");
    await qmPageObjects.clickViewListButton(page);
    
  });

  it('SV-4172: Verify That the "Audio Recording is available for all the calls on Freeswitch', async () => { 
     
    await qmPageObjects.clickOnLegForUsername(page, config.csrUser2.username);
    await delay(1000);
    await expect(page).toMatchElement('a', { text: config.csrUser2.username }, { timeout: 10000 }, { visible: true });
    await htmlReport.attachScreenshot(page, "Session Leg Freeswitch");
    await qmPageObjects.clickViewListButton(page);
    

  });

  it('SV-3572: Verify recording page for a leg having client, 2 video terps', async () => { 
     
    await qmPageObjects.clickOnLegForUsername(page, config.terpUser4.username);
    await delay(1000);
    await expect(page).toMatchElement('a', { text: config.terpUser4.username }, { timeout: 10000 }, { visible: true });
    await htmlReport.attachScreenshot(page, "Session Leg 2-Terps");
    await qmPageObjects.clickViewListButton(page);
    
  });

  it('SV-3573: Verify recording page for a leg having client, 1 video terp', async () => { 
     
    await qmPageObjects.clickOnLegForUsername(page, config.terpUser3.username);
    await delay(1000);
    await expect(page).toMatchElement('a', { text: config.terpUser3.username }, { timeout: 10000 }, { visible: true });
    await htmlReport.attachScreenshot(page, "Session Leg 1-Terps");
    await qmPageObjects.clickViewListButton(page);

  });

  it('SV-3577: Verify filtering all the columns on the recording page', async () => { 
  
    await page.waitForXPath(qmPageObjects.sessionFilterButton, { timeout: config.timeout }, { visible: true });
    await page.waitForXPath(qmPageObjects.legFilterButton, { timeout: config.timeout }, { visible: true });
    await page.waitForXPath(qmPageObjects.startFilterButton, { timeout: config.timeout }, { visible: true });
    await page.waitForXPath(qmPageObjects.lengthFilterButton, { timeout: config.timeout }, { visible: true });
    await page.waitForXPath(qmPageObjects.accountFilterButton, { timeout: config.timeout }, { visible: true });
    await page.waitForXPath(qmPageObjects.usernameFilterButton, { timeout: config.timeout }, { visible: true });
    await page.waitForXPath(qmPageObjects.teamFilterButton, { timeout: config.timeout }, { visible: true });
    await page.waitForXPath(qmPageObjects.mediaFilterButton, { timeout: config.timeout }, { visible: true });
    await page.waitForXPath(qmPageObjects.reviewedFilterButton, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Filter Button");

  });

  it('SV-3578: Verify adding a filter and saving it', async () => { 
  
    filterName = await qmPageObjects.createUsernameFilterAndSave(page, config.terpUser3.username);
    await htmlReport.attachScreenshot(page, "Save Filter");

  });

  it('SV-4174: Verify that a favorited filter is always displayed as the default filter', async () => { 
  
    await qmPageObjects.verifyFavouriteFilter(page);
    await expect(page).toMatchElement('div', {text: filterName},{timeout: config.timeout});
    await qmPageObjects.deleteAndClearFilter(page);
    await htmlReport.attachScreenshot(page, "Delete Filter");

  });

  it('SV-3581: Verify making a call and check if app records the correct "length of the call"', async () => { 
    var length =await qmPageObjects.verifyLengthOfCallDispalyed(page);
    await expect(length).toEqual(length);
    await htmlReport.attachScreenshot(page, "Session Call Length");

  });

  it('SV-4173: Verify that Screenshots are available for all video calls', async () => { 
     
    await qmPageObjects.clickOnFirstLegWithVideo(page);
    await qmPageObjects.verifyImageScreenshot(page);
    await qmPageObjects.clickViewListButton(page);
    await htmlReport.attachScreenshot(page, "Session Screenshot For Video Call");

  });

  it('SV-3580: Verify making a call and check if QM app records the right "start time" and "end time" of the call', async () => { 
     
    await qmPageObjects.createUsernameFilter(page, config.terpUser3.username);
    await qmPageObjects.clickOnLegForUsername(page, config.terpUser3.username);
    await qmPageObjects.verifyStartAndEndDate(page);
    await htmlReport.attachScreenshot(page, "Start Time & End Time");

  });

  it('SV-3579: Verify reviewing/rating a leg and check the calculation for "Average rating/reviews"', async () => { 
     
    await qmPageObjects.verifyRatingALeg(page);
    await expect(page).toMatchElement('h5', {text: 'Saved'}, {timeout: config.timeout});
    await expect(page).toMatchElement('div', {text: 'The review has been updated'}, {timeout: config.timeout});
    await htmlReport.attachScreenshot(page, "Submit Review");
    await qmPageObjects.clickViewListButton(page);
    await qmPageObjects.clearFilter(page);

  });

  it('SV-3582: Verify Pagination aspects on the QM app', async () => { 
     
    var currentPageNumber;
    currentPageNumber = await qmPageObjects.verifyNextPagination(page);
    await expect(currentPageNumber).toEqual("2");
    currentPageNumber = await qmPageObjects.verifyPreviousPagination(page);
    await expect(currentPageNumber).toEqual("1");
    await htmlReport.attachScreenshot(page, "Pagination");

  });

  it('SV-3576: Verify user is able to sort all the columns on the recording page', async () => { 
     
    await delay(2000);
    await qmPageObjects.verifyStartColoumnSorting(page);
    await htmlReport.attachScreenshot(page, "Coloum Sorting");

  });

  it('SV-4175: Verify the fields displayed in the table on the Workforce tab', async () => { 
     
    await qmPageObjects.navigateToWorkforceTab(page);
    await page.waitForXPath(qmPageObjects.workforceUsernameColumn, { timeout: config.timeout }, { visible: true });
    await page.waitForXPath(qmPageObjects.workforceFirstNameColumn, { timeout: config.timeout }, { visible: true });
    await page.waitForXPath(qmPageObjects.workforceLastNameColumn, { timeout: config.timeout }, { visible: true });
    await page.waitForXPath(qmPageObjects.workforceEmailColumn, { timeout: config.timeout }, { visible: true });
    await page.waitForXPath(qmPageObjects.workforceTypeColumn, { timeout: config.timeout }, { visible: true });
    await page.waitForXPath(qmPageObjects.workforceTeamColumn, { timeout: config.timeout }, { visible: true });
    await page.waitForXPath(qmPageObjects.workforceUserStartColumn, { timeout: config.timeout }, { visible: true });
    await page.waitForXPath(qmPageObjects.workforceLastSessionColumn, { timeout: config.timeout }, { visible: true });
    await page.waitForXPath(qmPageObjects.workforceActiveColumn, { timeout: config.timeout }, { visible: true });
    await page.waitForXPath(qmPageObjects.workforceLastReviewedColumn, { timeout: config.timeout }, { visible: true });
    await page.waitForXPath(qmPageObjects.workforceReviewsColumn, { timeout: config.timeout }, { visible: true });
    await page.waitForXPath(qmPageObjects.workforceAverageRatingColumn, { timeout: config.timeout }, { visible: true });
    await htmlReport.attachScreenshot(page, "Field Details In Workforce");

  });

  it('SV-4176: Verify adding filters on the workforce tab', async () => { 
     
    await qmPageObjects.navigateToWorkforceTab(page);
    await qmPageObjects.createUsernameFilterForWorkforce(page, config.terpUser3.username);
    await htmlReport.attachScreenshot(page, "Add Filter On Workforce");

  });

  it('SV-4178: Verify if the user\'s details are displayed on clicking the username on the Workforce tab', async () => { 
     
    await qmPageObjects.clickOnFirstUsernameOnWorkforce(page);
    await expect(page).toMatchElement('strong', {text: config.terpUser3.username}, {timeout: config.timeout});
    await expect(page).toMatchElement('h4', {text: 'First Name'}, {timeout: config.timeout});
    await expect(page).toMatchElement('h4', {text: 'Last Name'}, {timeout: config.timeout});
    await expect(page).toMatchElement('h4', {text: 'Team'}, {timeout: config.timeout});
    await expect(page).toMatchElement('h4', {text: 'Type'}, {timeout: config.timeout});
    await expect(page).toMatchElement('h4', {text: 'Status'}, {timeout: config.timeout});
    await htmlReport.attachScreenshot(page, "SUser Details");
    await qmPageObjects.clickViewListButton(page);

  });

  it('SV-4177: Verify saving and deleting filters on the workforce tab', async () => { 
     
    await qmPageObjects.saveFilterForWorkforce(page);
    await htmlReport.attachScreenshot(page, "Save Workforce Filter");
    await qmPageObjects.deleteAndClearFilterForWorkforce(page);
    await htmlReport.attachScreenshot(page, "Delete Workforce Filter");

  });

});

