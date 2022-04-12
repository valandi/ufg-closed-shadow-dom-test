'use strict';

const { Builder, By } = require('selenium-webdriver');
const { Eyes, VisualGridRunner, RunnerOptions, Target, RectangleSize, Configuration, BatchInfo, BrowserType, DeviceName, ScreenOrientation, IosDeviceName} = require('@applitools/eyes-selenium');
const chrome = require('selenium-webdriver/chrome')
const { ConsoleLogHandler } = require ('@applitools/eyes-selenium')

describe('usa today - Ultrafast Grid', function () {
  let runner, eyes, driver;

  before(async () => {

    const options = new chrome.Options();
    if (process.env.CI === 'true') options.headless();

    driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    runner = new VisualGridRunner(
      new RunnerOptions().testConcurrency(5)
    );

    let conf = new Configuration()
      .setApiKey(process.env.APPLITOOLS_API_KEY)
      .setBatch(new BatchInfo("Capture frame"))
      .addBrowser(1920, 1080, BrowserType.CHROME);

    eyes = new Eyes(runner);
    eyes.setLogHandler(new ConsoleLogHandler(true));
    eyes.setConfiguration(conf);
  });

  it('ultraFastTest', async () => {

    await eyes.open(driver, 'usatoday frame', 'usatoday frame', new RectangleSize(800, 600));
    await driver.get('https://www.usatoday.com/story/news/nation/2022/04/06/harry-greenwell-i-65-killer-dna-ballistics-crack-cold-case/9485424002/?gnt-cfr=1');
    const pageCdpConnection = await driver.createCDPConnection('page');
    console.log(await pageCdpConnection.execute(
      "DOM.getDocument",
      -1,
      true
    ));
    await eyes.check("Full page", Target.window().fully());
    await eyes.check(
      "Capture the content within the shadow root", 
      Target.region("body > aside > gnt-rbc").fully()
    );
    await eyes.closeAsync();
  });

  after(async () => {
    await driver.quit();
    await eyes.abortAsync();
    const allTestResults = await runner.getAllTestResults();
    console.log(allTestResults);
  });
});

