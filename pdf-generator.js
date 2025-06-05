const puppeteer = require('puppeteer');
const logger = require('./logger');
const GenericPool = require('generic-pool');

const MAX_POOL_SIZE = process.env.PDF_POOL_SIZE || 5;
const PAGE_POOL_SIZE = process.env.PAGE_POOL_SIZE || 10;
const IDLE_TIMEOUT_MS = 30000;

const browserConfig = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--no-first-run',
    '--no-zygote',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-features=TranslateUI,VizDisplayCompositor',
    '--disable-web-security',
    '--disable-software-rasterizer',
    '--disable-font-subpixel-positioning',
    '--disable-lcd-text',
    '--font-render-hinting=none'
  ],
  defaultViewport: { width: 1200, height: 800 }
};

const browserPool = GenericPool.createPool({
  create: async () => {
    logger.info('Creating browser instance');
    const browser = await puppeteer.launch(browserConfig);
    const warmupPage = await browser.newPage();
    await warmupPage.close();
    return browser;
  },
  destroy: async browser => {
    try {
      await browser.close();
      logger.info('Browser closed');
    } catch (error) {
      logger.warn('Error closing browser', { error: error.message });
    }
  },
  validate: browser => Promise.resolve(browser.isConnected())
}, {
  max: MAX_POOL_SIZE,
  min: 1,
  idleTimeoutMillis: IDLE_TIMEOUT_MS,
  evictionRunIntervalMillis: 10000
});

const createPagePool = browser => GenericPool.createPool({
  create: async () => {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
    return page;
  },
  destroy: async page => {
    try {
      await page.close();
    } catch (error) {
      logger.warn('Error closing page', { error: error.message });
    }
  },
  validate: page => Promise.resolve(!page.isClosed())
}, {
  max: PAGE_POOL_SIZE,
  min: 1,
  idleTimeoutMillis: IDLE_TIMEOUT_MS
});

const defaultPDFOptions = {
  format: 'A4',
  printBackground: true,
  margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
  preferCSSPageSize: true,
  displayHeaderFooter: false,
  omitBackground: true,
  scale: 0.8
};

async function generatePDF(html, options = {}) {
  const startTime = Date.now();
  let browser, pagePool, page;

  try {
    browser = await browserPool.acquire();
    pagePool = createPagePool(browser);
    page = await pagePool.acquire();

    await page.emulateMediaType('screen');


    await page.setContent(html, {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });

    await page.waitForSelector('body', { timeout: 30000 });

    const pdfBuffer = await page.pdf({ ...defaultPDFOptions, ...options });

    logger.info('PDF generated', {
      totalTime: `${Date.now() - startTime}ms`,
      pdfSize: `${Math.round(pdfBuffer.length / 1024)}KB`
    });

    return pdfBuffer;
  } catch (error) {
    logger.error('PDF generation failed', {
      error: error.message,
      timeToError: `${Date.now() - startTime}ms`,
      stack: error.stack
    });
    throw error;
  } finally {
    if (pagePool && page) await pagePool.release(page).catch(async err => {
      logger.warn('Failed to release page', { error: err.message });
      try { await page.close(); } catch (_) {}
    });

    if (browser) await browserPool.release(browser).catch(async err => {
      logger.warn('Failed to release browser', { error: err.message });
      try { await browser.close(); } catch (_) {}
    });
  }
}

async function generatePDFWithResourceControl(html, options = {}) {
  const startTime = Date.now();
  let browser, page;

  try {
    browser = await browserPool.acquire();
    page = await browser.newPage();

    await page.setRequestInterception(true);
    page.on('request', req => {
      const type = req.resourceType();
      const url = req.url();
      if (url.startsWith('data:') || url.startsWith('about:')) return req.continue();
      if (['image', 'media', 'websocket', 'manifest'].includes(type)) req.abort();
      else req.continue();
    });

    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 1000));

    const pdfBuffer = await page.pdf({ ...defaultPDFOptions, ...options });

    logger.info('PDF with resource control generated', {
      totalTime: `${Date.now() - startTime}ms`,
      pdfSize: `${Math.round(pdfBuffer.length / 1024)}KB`
    });

    return pdfBuffer;
  } catch (error) {
    logger.error('Resource-controlled PDF generation failed', {
      error: error.message,
      timeToError: `${Date.now() - startTime}ms`,
      stack: error.stack
    });
    throw error;
  } finally {
    if (page) await page.close().catch(err => logger.warn('Failed to close page', { error: err.message }));
    if (browser) await browserPool.release(browser).catch(err => logger.warn('Failed to release browser', { error: err.message }));
  }
}

async function generatePDFBatch(htmlArray, options = {}) {
  const startTime = Date.now();
  try {
    const results = await Promise.all(htmlArray.map(html => generatePDF(html, options)));
    logger.info('Batch PDF generation completed', {
      count: htmlArray.length,
      totalTime: `${Date.now() - startTime}ms`,
      avgTime: `${Math.round((Date.now() - startTime) / htmlArray.length)}ms`
    });
    return results;
  } catch (error) {
    logger.error('Batch PDF generation failed', { error: error.message });
    throw error;
  }
}

function getBrowserStatus() {
  return {
    size: browserPool.size,
    available: browserPool.available,
    borrowed: browserPool.borrowed,
    pending: browserPool.pending,
    max: browserPool.max,
    min: browserPool.min
  };
}


async function closeBrowser() {
  try {
    await browserPool.drain();
    await browserPool.clear();
    logger.info('Browser pool drained and cleared');
  } catch (error) {
    logger.error('Error closing browser pool', { error: error.message });
  }
}

setInterval(async () => {
   const stats = {
    size: browserPool.size,
    available: browserPool.available,
    borrowed: browserPool.borrowed,
    pending: browserPool.pending
  };
  logger.info('Browser pool status', stats);
  if (stats.borrowed > 0 && stats.available === 0 && stats.pending > 0) {
    logger.warn('Potential pool starvation detected', stats);
  }
}, 30000);

module.exports = {
  generatePDF,
  generatePDFWithResourceControl,
  generatePDFBatch,
  getBrowserStatus,
  closeBrowser
};
