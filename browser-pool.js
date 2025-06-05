const puppeteer = require('puppeteer');
const genericPool = require('generic-pool');

const browserPool = genericPool.createPool({
  create: () => puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ]
  }),
  destroy: (browser) => browser.close(),
}, {
  min: 2, // Minimum browsers in pool
  max: 10, // Maximum browsers in pool
  idleTimeoutMillis: 30000, // Close browsers after 30s of inactivity
  evictionRunIntervalMillis: 60000 // Check for idle browsers every minute
});

// Warm up the pool during service startup
async function warmupPool() {
  const warmupPromises = [];
  for (let i = 0; i < 2; i++) {
    warmupPromises.push(browserPool.acquire());
  }
  const browsers = await Promise.all(warmupPromises);
  browsers.forEach(browser => browserPool.release(browser));
}

module.exports = {
  getBrowser: () => browserPool.acquire(),
  releaseBrowser: (browser) => browserPool.release(browser),
  warmupPool
};