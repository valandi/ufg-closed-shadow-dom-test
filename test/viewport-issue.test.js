'use strict';

const { Builder, By } = require('selenium-webdriver');
const { Eyes, VisualGridRunner, RunnerOptions, Target, RectangleSize, Configuration, BatchInfo, BrowserType, DeviceName, ScreenOrientation, IosDeviceName} = require('@applitools/eyes-selenium');
const chrome = require('selenium-webdriver/chrome')
const { ConsoleLogHandler } = require ('@applitools/eyes-selenium')

describe('usa today - Ultrafast Grid', function () {
  let runner, eyes, driver;

  before(async () => {

    // Create a new chrome web driver
    const options = new chrome.Options();
    if (process.env.CI === 'true') options.headless();

    driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    // Create a runner with concurrency of 1
    const runnerOptions = new RunnerOptions().testConcurrency(5);
    runner = new VisualGridRunner(runnerOptions);

    // Create Eyes object with the runner, meaning it'll be a Visual Grid eyes.
    eyes = new Eyes(runner);
    eyes.setLogHandler(new ConsoleLogHandler(true));
    // Initialize the eyes configuration.
    let conf = new Configuration()

    // You can get your api key from the Applitools dashboard
    conf.setApiKey(process.env.APPLITOOLS_API_KEY)

    // create a new batch info instance and set it to the configuration
    conf.setBatch(new BatchInfo("viewport garnett Batch"));

    // Add browsers with different viewports
    conf.addBrowser(1920, 1080, BrowserType.CHROME);
    conf.addBrowser(1240, 860, BrowserType.FIREFOX);
    // conf.addDeviceEmulation(IosDeviceName.iPhone_11_Pro, ScreenOrientation.LANDSCAPE);

    // set the configuration to eyes
    eyes.setConfiguration(conf)
  });

  it('ultraFastTest', async () => {

    await eyes.open(
      driver, 
      'garnett viewport', 
      'garnett viewport', 
      new RectangleSize(800, 600)
    );

    await driver.get("https://www.jsonline.com/story/communities/northwest/news/germantown/2022/04/06/new-germantown-subdivision-heritage-park-north-begin-construction-soon/9466231002/#gnt-disable-x&gnt-disable-taboola");
    await eyes.check(
      "Page", 
      Target.window().fully().visualGridOption('polyfillAdoptedStyleSheets', true)
      //Target.shadow("body > aside > gnt-rbc").frame("frame").fully()
    );

    // Call Close on eyes to let the server know it should display the results
    await eyes.closeAsync();
  });

  after(async () => {
    // Close the browser.
    await driver.quit();

    // If the test was aborted before eyes.close was called, ends the test as aborted.
    await eyes.abortAsync();

    // we pass false to this method to suppress the exception that is thrown if we
    // find visual differences
    const allTestResults = await runner.getAllTestResults();
    console.log(allTestResults);
  });
});

