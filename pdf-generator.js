const puppeteer = require('puppeteer');
const logger = require('./logger');


let browser = null;
let isInitializing = false;

// Performance-optimized browser configuration
const browserConfig = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-features=TranslateUI',
    '--disable-web-security',
    '--disable-features=VizDisplayCompositor'
  ],
  defaultViewport: {
    width: 1200,
    height: 800
  }
};

// PDF generation options optimized for speed
const defaultPDFOptions = {
  format: 'A4',
  printBackground: true,
  margin: {
    top: '20px',
    right: '20px',
    bottom: '20px',
    left: '20px'
  },
  preferCSSPageSize: true,
  displayHeaderFooter: false
};

/**
 * Initialize browser instance with connection pooling
 */
async function initializeBrowser() {
  if (browser && browser.connected) {
    return browser;
  }
  
  if (isInitializing) {
    // Wait for initialization to complete
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return browser;
  }
  
  isInitializing = true;
  
  try {
    logger.info('Initializing Puppeteer browser...');
    const startTime = Date.now();
    
    browser = await puppeteer.launch(browserConfig);
    
    const initTime = Date.now() - startTime;
    logger.info(`Browser initialized in ${initTime}ms`);
    
    // Pre-warm the browser by creating and closing a page
    const warmupPage = await browser.newPage();
    await warmupPage.close();
    
    return browser;
  } catch (error) {
    logger.error('Failed to initialize browser', { error: error.message });
    throw error;
  } finally {
    isInitializing = false;
  }
}

/**
 * Generate PDF from HTML with optimized performance
 */
async function generatePDF(html, options = {}) {
  const startTime = Date.now();
  let page = null;
  
  try {
    // Ensure browser is initialized
    if (!browser || !browser.connected) {
      await initializeBrowser();
    }
    
    // Create new page
    const pageStartTime = Date.now();
    page = await browser.newPage();
    
    // Optimize page settings for performance
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9'
    });
    
    // FIXED: Removed problematic request interception that was blocking resources
    // For inline CSS/HTML content, we don't need to block external resources
    // since everything is self-contained in the HTML string
    
    const pageCreationTime = Date.now() - pageStartTime;
    
    // Set HTML content
    const contentStartTime = Date.now();
    await page.setContent(html, {
       waitUntil: ['load', 'domcontentloaded'], // Wait for network to be idle for better rendering
      timeout: 60000 // Increased timeout
    });

    await page.waitForSelector('body', { timeout: 30000 });

    await page.evaluate(async () => {
      await new Promise((resolve) => {
        if (document.readyState === 'complete') {
          resolve();
        } else {
          window.addEventListener('load', resolve);
        }
      });
    });
    const contentLoadTime = Date.now() - contentStartTime;
    
    // Wait a bit more to ensure styles are fully applied
    await new Promise(resolve => setTimeout(resolve, 500));

    
    // Merge PDF options
    const pdfOptions = { ...defaultPDFOptions, ...options };
    
    // Generate PDF
    const pdfStartTime = Date.now();
    const pdfBuffer = await page.pdf(pdfOptions);
    const pdfGenerationTime = Date.now() - pdfStartTime;
    
    const totalTime = Date.now() - startTime;
    
    logger.info('PDF generation performance metrics', {
      pageCreation: `${pageCreationTime}ms`,
      contentLoad: `${contentLoadTime}ms`,
      pdfGeneration: `${pdfGenerationTime}ms`,
      totalTime: `${totalTime}ms`,
      pdfSize: `${Math.round(pdfBuffer.length / 1024)}KB`
    });
    
    return pdfBuffer;
    
  } catch (error) {
    const errorTime = Date.now() - startTime;
    logger.error('PDF generation failed', {
      error: error.message,
      timeToError: `${errorTime}ms`,
      stack: error.stack
    });
    throw error;
  } finally {
    // Always close the page to free resources
    if (page) {
      try {
        await page.close();
      } catch (closeError) {
        logger.warn('Failed to close page', { error: closeError.message });
      }
    }
  }
}

/**
 * Generate PDF from HTML with external resource control (for cases with external resources)
 */
async function generatePDFWithResourceControl(html, options = {}) {
  const startTime = Date.now();
  let page = null;
  
  try {
    // Ensure browser is initialized
    if (!browser || !browser.connected) {
      await initializeBrowser();
    }
    
    // Create new page
    page = await browser.newPage();
    
    // Set up request interception for external resources
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      const url = req.url();
      
      // Allow data URLs and inline content
      if (url.startsWith('data:') || url.startsWith('about:')) {
        req.continue();
        return;
      }
      
      // Block external images, scripts, and other non-essential resources
      if (['image', 'media', 'websocket', 'manifest'].includes(resourceType)) {
        req.abort('blockedbyclient');
      } else {
        req.continue();
      }
    });
    
    // Set HTML content
    await page.setContent(html, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });
    
    // Wait for any remaining processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    
    // Generate PDF
    const pdfOptions = { ...defaultPDFOptions, ...options };
    const pdfBuffer = await page.pdf(pdfOptions);
    
    const totalTime = Date.now() - startTime;
    logger.info('PDF with resource control generated', {
      totalTime: `${totalTime}ms`,
      pdfSize: `${Math.round(pdfBuffer.length / 1024)}KB`
    });
    
    return pdfBuffer;
    
  } catch (error) {
    const errorTime = Date.now() - startTime;
    logger.error('PDF generation with resource control failed', {
      error: error.message,
      timeToError: `${errorTime}ms`,
      stack: error.stack
    });
    throw error;
  } finally {
    if (page) {
      try {
        await page.close();
      } catch (closeError) {
        logger.warn('Failed to close page', { error: closeError.message });
      }
    }
  }
}

/**
 * Generate multiple PDFs concurrently (for high-throughput scenarios)
 */
async function generatePDFBatch(htmlArray, options = {}) {
  const startTime = Date.now();
  
  try {
    const promises = htmlArray.map(html => generatePDF(html, options));
    const results = await Promise.all(promises);
    
    const totalTime = Date.now() - startTime;
    logger.info(`Batch PDF generation completed`, {
      count: htmlArray.length,
      totalTime: `${totalTime}ms`,
      avgTime: `${Math.round(totalTime / htmlArray.length)}ms`
    });
    
    return results;
  } catch (error) {
    logger.error('Batch PDF generation failed', { error: error.message });
    throw error;
  }
}

/**
 * Get browser status for monitoring
 */
async function getBrowserStatus() {
  try {
    if (!browser) {
      return { connected: false, pages: 0 };
    }
    
    const pages = await browser.pages();
    return {
      connected: browser.connected,
      pages: pages.length,
      wsEndpoint: browser.wsEndpoint()
    };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

/**
 * Close browser and cleanup resources
 */
async function closeBrowser() {
  if (browser) {
    try {
      await browser.close();
      logger.info('Browser closed successfully');
    } catch (error) {
      logger.error('Error closing browser', { error: error.message });
    } finally {
      browser = null;
    }
  }
}

/**
 * Restart browser if it becomes unresponsive
 */
async function restartBrowser() {
  logger.info('Restarting browser...');
  await closeBrowser();
  await initializeBrowser();
}

// Health check for browser
setInterval(async () => {
  try {
    if (browser && browser.connected) {
      const pages = await browser.pages();
      if (pages.length > 10) { // Too many open pages, restart browser
        logger.warn(`Too many open pages (${pages.length}), restarting browser`);
        await restartBrowser();
      }
    }
  } catch (error) {
    logger.warn('Browser health check failed', { error: error.message });
    await restartBrowser();
  }
}, 60000); // Check every minute

module.exports = {
  generatePDF,
  generatePDFWithResourceControl,
  generatePDFBatch,
  initializeBrowser,
  closeBrowser,
  restartBrowser,
  getBrowserStatus
};