const axios = require('axios');
const cheerio = require('cheerio');

class ScraperService {
  constructor() {
    this.baseUrl = 'https://www.carsensor.net';
    this.maxRetries = 3;
    this.retryDelay = 2000; // 2 секунды
  }

  /**
   * Получить HTML страницы с retry логикой
   */
  async fetchPage(url, retries = 0) {
    try {
      console.log(`Fetching: ${url}`);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
        },
        timeout: 10000
      });

      return response.data;
    } catch (error) {
      if (retries < this.maxRetries) {
        console.log(`Retry ${retries + 1}/${this.maxRetries} for ${url}`);
        await this.delay(this.retryDelay);
        return this.fetchPage(url, retries + 1);
      }
      throw new Error(`Failed to fetch ${url}: ${error.message}`);
    }
  }

  /**
   * Парсинг списка автомобилей со страницы поиска
   */
  async scrapeSearchPage(searchUrl) {
    const html = await this.fetchPage(searchUrl);
    const $ = cheerio.load(html);
    const cars = [];

    // Селекторы для carsensor.net (могут требовать обновления)
    // Примерная структура - нужно будет уточнить на реальном сайте
    $('.cassetteMain, .contents, .cassette_list > li').each((index, element) => {
      try {
        const $el = $(element);

        // Извлекаем данные
        const carData = {
          // external_id - уникальный идентификатор из URL
          external_id: this.extractId($el.find('a').first().attr('href')),

          // URL объявления
          url: this.buildFullUrl($el.find('a').first().attr('href')),

          // Марка и модель
          brand: this.extractBrand($el),
          model: this.extractModel($el),

          // Год
          year: this.extractYear($el),

          // Цена
          price: this.extractPrice($el),

          // Цвет
          color: this.extractColor($el),

          // Пробег
          mileage: this.extractMileage($el),

          // Изображение
          image_url: this.extractImageUrl($el),

          // Дополнительные поля
          transmission: this.extractTransmission($el),
          fuel_type: this.extractFuelType($el),
          body_type: this.extractBodyType($el),
          location: this.extractLocation($el),
          description: this.extractDescription($el),

          last_scraped_at: new Date()
        };

        // Проверяем обязательные поля
        if (carData.external_id && carData.brand && carData.model && carData.price) {
          cars.push(carData);
        }
      } catch (error) {
        console.error('Error parsing car element:', error.message);
      }
    });

    return cars;
  }

  /**
   * Извлечение ID из URL
   */
  extractId(url) {
    if (!url) return null;

    // Пример: /usedcar/detail/VU1234567/ -> VU1234567
    const match = url.match(/\/([A-Z0-9]+)\/?$/);
    return match ? match[1] : url.replace(/\//g, '_');
  }

  /**
   * Построение полного URL
   */
  buildFullUrl(relativeUrl) {
    if (!relativeUrl) return null;
    if (relativeUrl.startsWith('http')) return relativeUrl;
    return this.baseUrl + relativeUrl;
  }

  /**
   * Извлечение марки автомобиля
   */
  extractBrand($el) {
    // Пытаемся найти марку в разных возможных местах
    let brand = $el.find('.brand, .maker, .carName').first().text().trim();

    if (!brand) {
      // Парсим из заголовка, например "Toyota Camry 2020"
      const title = $el.find('h2, h3, .title').first().text().trim();
      brand = title.split(' ')[0];
    }

    return brand || null;
  }

  /**
   * Извлечение модели
   */
  extractModel($el) {
    let model = $el.find('.model, .carModel').first().text().trim();

    if (!model) {
      const title = $el.find('h2, h3, .title').first().text().trim();
      const parts = title.split(' ');
      model = parts.length > 1 ? parts.slice(1).join(' ') : null;
    }

    return model || null;
  }

  /**
   * Извлечение года
   */
  extractYear($el) {
    const yearText = $el.find('.year, .model-year').first().text().trim();

    // Ищем 4-значное число (год)
    const match = yearText.match(/(\d{4})/);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Извлечение цены
   */
  extractPrice($el) {
    const priceText = $el.find('.price, .priceArea, .totalPrice').first().text().trim();

    // Убираем все символы кроме цифр
    const priceNumbers = priceText.replace(/[^\d]/g, '');
    const price = parseFloat(priceNumbers);

    // Проверяем, что цена в разумных пределах
    return price > 0 && price < 100000000 ? price : null;
  }

  /**
   * Извлечение цвета
   */
  extractColor($el) {
    return $el.find('.color, .bodyColor').first().text().trim() || null;
  }

  /**
   * Извлечение пробега
   */
  extractMileage($el) {
    const mileageText = $el.find('.mileage, .distance').first().text().trim();

    // Извлекаем число (пробег обычно в км)
    const match = mileageText.match(/([\d,]+)/);
    if (match) {
      const mileage = parseInt(match[1].replace(/,/g, ''));
      return mileage > 0 ? mileage : null;
    }

    return null;
  }

  /**
   * Извлечение URL изображения
   */
  extractImageUrl($el) {
    const imgSrc = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src');
    return this.buildFullUrl(imgSrc);
  }

  /**
   * Извлечение типа трансмиссии
   */
  extractTransmission($el) {
    const text = $el.find('.transmission, .spec').text().toLowerCase();

    if (text.includes('at') || text.includes('オートマ')) return 'AT';
    if (text.includes('mt') || text.includes('マニュアル')) return 'MT';
    if (text.includes('cvt')) return 'CVT';

    return null;
  }

  /**
   * Извлечение типа топлива
   */
  extractFuelType($el) {
    const text = $el.find('.fuel, .spec').text().toLowerCase();

    if (text.includes('gasoline') || text.includes('ガソリン')) return 'Gasoline';
    if (text.includes('diesel') || text.includes('ディーゼル')) return 'Diesel';
    if (text.includes('hybrid') || text.includes('ハイブリッド')) return 'Hybrid';
    if (text.includes('electric') || text.includes('電気')) return 'Electric';

    return null;
  }

  /**
   * Извлечение типа кузова
   */
  extractBodyType($el) {
    return $el.find('.bodyType, .carType').first().text().trim() || null;
  }

  /**
   * Извлечение местоположения
   */
  extractLocation($el) {
    return $el.find('.location, .shopArea, .prefecture').first().text().trim() || null;
  }

  /**
   * Извлечение описания
   */
  extractDescription($el) {
    return $el.find('.description, .comment').first().text().trim() || null;
  }

  /**
   * Генерация URL для поиска
   * @param {Object} params - параметры поиска (brand, minPrice, maxPrice, etc.)
   */
  generateSearchUrls(params = {}) {
    const urls = [];

    // Базовый URL поиска на carsensor.net
    // Структура URL может быть примерно такой:
    // https://www.carsensor.net/usedcar/search.php?STID=CS210610&...

    const baseSearchUrl = `${this.baseUrl}/usedcar/search.php`;

    // Добавляем параметры
    const queryParams = new URLSearchParams({
      STID: 'CS210610',
      // Можно добавить фильтры по марке, цене и т.д.
      ...params
    });

    // Для начала просто генерируем 1-3 страницы
    for (let page = 1; page <= 3; page++) {
      queryParams.set('page', page);
      urls.push(`${baseSearchUrl}?${queryParams.toString()}`);
    }

    return urls;
  }

  /**
   * Задержка выполнения
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new ScraperService();
