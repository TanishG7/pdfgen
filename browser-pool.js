const puppeteer = require('puppeteer');
const genericPool = require('generic-pool');
const logger = require('./logger');

const DEFAULT_CONFIG = {
  min: parseInt(process.env.BROWSER_POOL_MIN) || 2,
  max: parseInt(process.env.BROWSER_POOL_MAX) || 10,
  idleTimeoutMillis: parseInt(process.env.BROWSER_POOL_IDLE_TIMEOUT) || 30000,
  evictionRunIntervalMillis: parseInt(process.env.BROWSER_POOL_EVICTION_INTERVAL) || 60000,
  acquireTimeoutMillis: parseInt(process.env.BROWSER_POOL_ACQUIRE_TIMEOUT) || 30000
};

const BROWSER_LAUNCH_OPTIONS = {
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu',
    '--single-process',
    '--no-zygote',
    '--disable-setuid-sandbox',
    '--disable-infobars',
    '--window-position=0,0',
    '--ignore-certificate-errors',
    '--ignore-certificate-errors-spki-list'
  ],
  timeout: parseInt(process.env.BROWSER_LAUNCH_TIMEOUT) || 30000
};

class BrowserPool {
  constructor() {
    this.pool = genericPool.createPool({
      create: this._createBrowser,
      destroy: this._destroyBrowser,
      validate: this._validateBrowser
    }, DEFAULT_CONFIG);

    this.pool.on('factoryCreateError', (err) => {
      logger.error('Browser creation failed', { error: err.message, stack: err.stack });
    });

    this.pool.on('factoryDestroyError', (err) => {
      logger.error('Browser destruction failed', { error: err.message, stack: err.stack });
    });
  }

  async _createBrowser() {
    try {
      const browser = await puppeteer.launch(BROWSER_LAUNCH_OPTIONS);
      logger.debug('Browser instance created');
      return browser;
    } catch (error) {
      logger.error('Browser creation failed', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  async _destroyBrowser(browser) {
    try {
      if (browser && browser.isConnected()) {
        await browser.close();
        logger.debug('Browser instance closed');
      }
    } catch (error) {
      logger.warn('Browser destruction failed', { error: error.message });
      throw error;
    }
  }

  async _validateBrowser(browser) {
    try {
      return browser && browser.isConnected();
    } catch (error) {
      logger.warn('Browser validation failed', { error: error.message });
      return false;
    }
  }

  async acquire() {
    try {
      return await this.pool.acquire();
    } catch (error) {
      logger.error('Failed to acquire browser from pool', { error: error.message });
      throw error;
    }
  }

  async release(browser) {
    try {
      if (browser && this.pool.isBorrowedResource(browser)) {
        await this.pool.release(browser);
        logger.debug('Browser released back to pool');
      }
    } catch (error) {
      logger.warn('Failed to release browser to pool', { error: error.message });
      throw error;
    }
  }

  async warmup() {
    try {
      const warmupPromises = [];
      for (let i = 0; i < DEFAULT_CONFIG.min; i++) {
        warmupPromises.push(this.acquire().then(browser => this.release(browser)));
      }
      await Promise.all(warmupPromises);
      logger.info(`Browser pool warmed up with ${DEFAULT_CONFIG.min} instances`);
    } catch (error) {
      logger.error('Browser pool warmup failed', { error: error.message });
      throw error;
    }
  }

  async drain() {
    try {
      await this.pool.drain();
      await this.pool.clear();
      logger.info('Browser pool drained successfully');
    } catch (error) {
      logger.error('Failed to drain browser pool', { error: error.message });
      throw error;
    }
  }

  getStats() {
    return {
      size: this.pool.size,
      available: this.pool.available,
      borrowed: this.pool.borrowed,
      pending: this.pool.pending,
      max: this.pool.max,
      min: this.pool.min
    };
  }
}

module.exports = new BrowserPool();