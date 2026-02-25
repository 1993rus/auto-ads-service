const cron = require('node-cron');
const scraperService = require('../services/scraper.service');
const carService = require('../services/car.service');

class ScraperWorker {
  constructor() {
    this.isRunning = false;
    this.schedule = process.env.SCRAPER_SCHEDULE || '0 */6 * * *'; // Каждые 6 часов по умолчанию
  }

  /**
   * Запустить периодический скрапинг
   */
  start() {
    console.log(`📅 Scraper worker scheduled: ${this.schedule}`);

    // Запуск по расписанию
    cron.schedule(this.schedule, async () => {
      await this.runScraping();
    });

    // Опционально: запустить сразу при старте сервера
    if (process.env.RUN_SCRAPER_ON_START === 'true') {
      setTimeout(() => this.runScraping(), 5000); // Задержка 5 сек после старта
    }
  }

  /**
   * Выполнить скрапинг
   */
  async runScraping() {
    if (this.isRunning) {
      console.log('⏭️  Scraping already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting scraping job...');

    let scrapingLog;

    try {
      // Создаём лог скрапинга
      scrapingLog = await carService.createScrapingLog();

      // Генерируем URLs для скрапинга
      const searchUrls = scraperService.generateSearchUrls();
      console.log(`🔍 Scraping ${searchUrls.length} pages...`);

      let allCars = [];

      // Скрапим каждую страницу
      for (const url of searchUrls) {
        try {
          console.log(`📄 Scraping: ${url}`);
          const cars = await scraperService.scrapeSearchPage(url);
          allCars = allCars.concat(cars);

          // Задержка между страницами, чтобы не перегружать сервер
          await scraperService.delay(2000);
        } catch (error) {
          console.error(`❌ Error scraping ${url}:`, error.message);
        }
      }

      console.log(`✅ Found ${allCars.length} cars total`);

      // Сохраняем в базу данных
      const results = await carService.bulkUpsert(allCars);

      console.log(`
📊 Scraping Results:
  - Added: ${results.added}
  - Updated: ${results.updated}
  - Unchanged: ${results.unchanged}
  - Errors: ${results.errors.length}
      `);

      // Обновляем лог
      await carService.completeScrapingLog(scrapingLog.id, results);

    } catch (error) {
      console.error('❌ Scraping failed:', error);

      if (scrapingLog) {
        await carService.failScrapingLog(scrapingLog.id, error.message);
      }
    } finally {
      this.isRunning = false;
      console.log('✅ Scraping job completed\n');
    }
  }

  /**
   * Запустить скрапинг вручную (для тестирования)
   */
  async runManually() {
    return this.runScraping();
  }
}

module.exports = new ScraperWorker();
