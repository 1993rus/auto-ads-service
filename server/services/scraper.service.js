const axios = require('axios');
const cheerio = require('cheerio');
const { mockSearchPageHTML, mockDetailPageHTML, mockCarsData } = require('./scraper.mock');

class ScraperService {
  constructor() {
    this.baseUrl = 'https://www.carsensor.net';
    this.maxRetries = 3;
    this.retryDelay = 2000; // 2 секунды
    this.mockMode = process.env.SCRAPER_MODE === 'mock'; // Mock режим для тестирования

    if (this.mockMode) {
      console.log('🎭 SCRAPER MOCK MODE ENABLED');
    }

    // Маппинг японских названий брендов в латиницу
    this.brandMapping = {
      'トヨタ': 'Toyota',
      'ホンダ': 'Honda',
      '日産': 'Nissan',
      'マツダ': 'Mazda',
      'スバル': 'Subaru',
      'スズキ': 'Suzuki',
      'ダイハツ': 'Daihatsu',
      'ミツビシ': 'Mitsubishi',
      '三菱': 'Mitsubishi',
      'レクサス': 'Lexus',
      'いすゞ': 'Isuzu',
      'ヤマハ': 'Yamaha',
      'カワサキ': 'Kawasaki',
      // Импортные бренды
      'メルセデス・ベンツ': 'Mercedes-Benz',
      'メルセデスベンツ': 'Mercedes-Benz',
      'BMW': 'BMW',
      'アウディ': 'Audi',
      'フォルクスワーゲン': 'Volkswagen',
      'ポルシェ': 'Porsche',
      'フォード': 'Ford',
      'シボレー': 'Chevrolet',
      'キャデラック': 'Cadillac',
      'ジープ': 'Jeep',
      'ボルボ': 'Volvo',
      'プジョー': 'Peugeot',
      'ルノー': 'Renault',
      'シトロエン': 'Citroen',
      'フィアット': 'Fiat',
      'アルファロメオ': 'Alfa Romeo',
      'フェラーリ': 'Ferrari',
      'ランボルギーニ': 'Lamborghini',
      'マセラティ': 'Maserati',
      'ジャガー': 'Jaguar',
      'ランドローバー': 'Land Rover',
      'ミニ': 'MINI',
      'ヒュンダイ': 'Hyundai',
      'キア': 'Kia',
      'テスラ': 'Tesla'
    };

    // Маппинг кодов брендов из URL в названия
    this.brandCodeMapping = {
      'TO': 'Toyota',
      'NI': 'Nissan',
      'HO': 'Honda',
      'MA': 'Mazda',
      'SU': 'Subaru',
      'MI': 'Mitsubishi',
      'DA': 'Daihatsu',
      'SZ': 'Suzuki',
      'IS': 'Isuzu',
      'LE': 'Lexus'
    };

    // Маппинг японских названий моделей в латиницу
    this.modelMapping = {
      // Toyota
      'プリウス': 'Prius',
      'カムリ': 'Camry',
      'カローラ': 'Corolla',
      'クラウン': 'Crown',
      'ヴォクシー': 'Voxy',
      'ノア': 'Noah',
      'アルファード': 'Alphard',
      'ヴェルファイア': 'Vellfire',
      'ハイエース': 'Hiace',
      'ランドクルーザー': 'Land Cruiser',
      'RAV4': 'RAV4',
      'ハリアー': 'Harrier',
      'アクア': 'Aqua',
      'ヤリス': 'Yaris',
      'シエンタ': 'Sienta',
      'タウンエース': 'Town Ace',
      'タウンエースバン': 'Town Ace Van',
      // Honda
      'フィット': 'Fit',
      'シビック': 'Civic',
      'アコード': 'Accord',
      'オデッセイ': 'Odyssey',
      'ステップワゴン': 'Step Wagon',
      'フリード': 'Freed',
      'ヴェゼル': 'Vezel',
      // Nissan
      'ノート': 'Note',
      'セレナ': 'Serena',
      'エクストレイル': 'X-Trail',
      'スカイライン': 'Skyline',
      'フェアレディZ': 'Fairlady Z',
      'GT-R': 'GT-R',
      // Mazda
      'デミオ': 'Demio',
      'アクセラ': 'Axela',
      'アテンザ': 'Atenza',
      'CX-3': 'CX-3',
      'CX-5': 'CX-5',
      'CX-8': 'CX-8',
      // Subaru
      'インプレッサ': 'Impreza',
      'レガシィ': 'Legacy',
      'フォレスター': 'Forester',
      'レヴォーグ': 'Levorg'
    };
  }

  /**
   * Получить HTML страницы с retry логикой
   */
  async fetchPage(url, retries = 0) {
    // Mock режим: возвращаем mock данные
    if (this.mockMode) {
      console.log(`🎭 Mock fetching: ${url}`);
      await this.delay(100); // Небольшая задержка для имитации сети

      // Определяем тип страницы по URL
      if (url.includes('/usedcar/detail/')) {
        return mockDetailPageHTML;
      } else {
        return mockSearchPageHTML;
      }
    }

    // Обычный режим: реальные HTTP запросы
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
   * @param {string} searchUrl - URL страницы поиска
   * @param {boolean} withImages - Загружать ли изображения с детальных страниц (по умолчанию false)
   * @returns {Promise<Array>} Массив данных автомобилей
   */
  async scrapeSearchPage(searchUrl, withImages = false) {
    const html = await this.fetchPage(searchUrl);
    const $ = cheerio.load(html);
    const cars = [];

    // Извлекаем бренд из URL параметра BRDC (например BRDC=TO для Toyota)
    const urlBrand = this.extractBrandFromUrl(searchUrl);

    // Ищем все div, которые содержат h3 с ссылкой на детальную страницу
    // Структура: div > h3 > a[href="/usedcar/detail/..."]
    $('h3 a[href*="/usedcar/detail/"]').each((index, element) => {
      try {
        const $link = $(element);
        const $container = $link.closest('div');

        // Извлекаем данные
        const carData = {
          // external_id - уникальный идентификатор из URL
          external_id: this.extractId($link.attr('href')),

          // URL объявления
          url: this.buildFullUrl($link.attr('href')),

          // Марка из URL параметра или из заголовка
          brand: urlBrand || this.extractBrand($link),
          model: this.extractModel($link),

          // Год из dl/dt/dd
          year: this.extractYear($container, $),

          // Цена в формате "XXX万円"
          price: this.extractPrice($container),

          // Цвет из li
          color: this.extractColor($container),

          // Пробег из dl/dt/dd
          mileage: this.extractMileage($container, $),

          // Изображение (с листинга - может быть null из-за lazy loading)
          image_url: this.extractImageUrl($container, $),

          // Дополнительные поля
          transmission: this.extractTransmission($container, $),
          fuel_type: this.extractFuelType($container),
          body_type: this.extractBodyType($container),
          location: this.extractLocation($container),
          description: this.extractDescription($container),

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

    console.log(`Scraped ${cars.length} cars from ${searchUrl}`);

    // Если нужны изображения, загружаем их с детальных страниц
    if (withImages && cars.length > 0) {
      console.log('Загружаю изображения с детальных страниц...');

      for (let i = 0; i < cars.length; i++) {
        const car = cars[i];

        // Если изображение уже есть, пропускаем
        if (car.image_url) {
          console.log(`[${i + 1}/${cars.length}] ${car.external_id} - изображение уже есть`);
          continue;
        }

        console.log(`[${i + 1}/${cars.length}] Загружаю изображение для ${car.external_id}...`);

        try {
          const imageUrl = await this.scrapeCarDetail(car.url);
          if (imageUrl) {
            car.image_url = imageUrl;
            console.log(`✅ Изображение найдено`);
          } else {
            console.log(`⚠️  Изображение не найдено`);
          }
        } catch (error) {
          console.error(`❌ Ошибка при загрузке изображения: ${error.message}`);
        }

        // Задержка между запросами к детальным страницам
        if (i < cars.length - 1) {
          await this.delay(2500);
        }
      }

      console.log('Загрузка изображений завершена');
    }

    return cars;
  }

  /**
   * Скрапинг детальной страницы автомобиля для получения изображения
   * @param {string} detailUrl - URL детальной страницы
   * @returns {Promise<string|null>} URL главного изображения или null
   */
  async scrapeCarDetail(detailUrl) {
    try {
      const html = await this.fetchPage(detailUrl);
      const $ = cheerio.load(html);

      // Стратегия 1: Ищем главное изображение по классу detailSlider__mainImg
      const mainImg = $('.detailSlider__mainImg').attr('src');
      if (mainImg) {
        return this.buildFullUrl(mainImg);
      }

      // Стратегия 2: Ищем og:image в мета-тегах
      const ogImage = $('meta[property="og:image"]').attr('content');
      if (ogImage) {
        return this.buildFullUrl(ogImage);
      }

      // Стратегия 3: Ищем любое изображение с большим размером
      let largestImage = null;
      let maxWidth = 0;

      $('img').each((i, img) => {
        const $img = $(img);
        const src = $img.attr('src');
        const width = parseInt($img.attr('width')) || 0;

        // Пропускаем логотипы и иконки
        if (src && !src.includes('logo') && !src.includes('icon') && width > maxWidth) {
          largestImage = src;
          maxWidth = width;
        }
      });

      if (largestImage) {
        return this.buildFullUrl(largestImage);
      }

      return null;
    } catch (error) {
      console.error(`Error scraping detail page ${detailUrl}:`, error.message);
      return null;
    }
  }

  /**
   * Извлечение ID из URL
   */
  extractId(url) {
    if (!url) return null;

    // Формат: /usedcar/detail/AU6757636162/index.html -> AU6757636162
    const match = url.match(/\/detail\/([A-Z0-9]+)\//);
    return match ? match[1] : null;
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
   * Извлечение бренда из URL параметра
   * Например: ?BRDC=TO -> Toyota
   */
  extractBrandFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const brdc = urlObj.searchParams.get('BRDC');

      if (brdc && this.brandCodeMapping[brdc]) {
        return this.brandCodeMapping[brdc];
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Извлечение марки автомобиля
   */
  extractBrand($linkElement) {
    // $linkElement - это <a> элемент с текстом "トヨタ タウンエースバン 1.5 GL 4WD"
    const title = $linkElement.text().trim();

    // Первое слово - это марка (например: "トヨタ", "ホンダ", "日産")
    const japaneseBrand = title.split(/\s+/)[0];

    // Преобразуем в латиницу используя маппинг
    const latinBrand = this.brandMapping[japaneseBrand] || japaneseBrand;

    return latinBrand || null;
  }

  /**
   * Извлечение модели
   */
  extractModel($linkElement) {
    // Всё после первого слова - это модель
    const title = $linkElement.text().trim();
    const parts = title.split(/\s+/);

    // Берём всё кроме первого слова (бренда)
    if (parts.length <= 1) return null;

    const japaneseModel = parts[1]; // Второе слово - обычно название модели
    const restOfTitle = parts.slice(2).join(' '); // Остальное - характеристики

    // Пытаемся найти модель в маппинге
    const latinModel = this.modelMapping[japaneseModel] || japaneseModel;

    // Возвращаем модель + остальные характеристики
    const fullModel = restOfTitle ? `${latinModel} ${restOfTitle}` : latinModel;

    return fullModel;
  }

  /**
   * Извлечение года
   */
  extractYear($el, $) {
    // Ищем dt с текстом "年式", берём следующий dd
    // Формат: "2025(R07)" или "2025(R07)年"
    let yearText = '';

    $el.find('dt').each((i, dt) => {
      const $dt = $(dt);
      if ($dt.text().includes('年式')) {
        yearText = $dt.next('dd').text().trim();
        return false; // break
      }
    });

    // Извлекаем 4-значное число (год)
    const match = yearText.match(/(\d{4})/);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Извлечение цены
   */
  extractPrice($el) {
    // Ищем текст с "支払総額" или "車両本体価格" и "万円"
    // Примеры: "支払総額 263万円", "車両本体価格 249.8万円"
    const priceText = $el.text();

    // Ищем паттерн: число + "万円" (манъен = 10,000 йен)
    // Может быть с десятичной точкой: 249.8万円
    const match = priceText.match(/([\d.]+)万円/);

    if (match) {
      // Преобразуем из миллионов йен в йены
      // 263万円 = 263 * 10000 = 2,630,000 йен
      const manYen = parseFloat(match[1]);
      const yen = Math.round(manYen * 10000);

      return yen > 0 && yen < 100000000 ? yen : null;
    }

    return null;
  }

  /**
   * Извлечение цвета
   */
  extractColor($el) {
    // Цвет находится во втором li элементе (первый - тип кузова)
    // Формат: <ul><li>ミニバン</li><li>白</li></ul>
    const colorLi = $el.find('ul li').eq(1);

    if (colorLi.length > 0) {
      return colorLi.text().trim();
    }

    return null;
  }

  /**
   * Извлечение пробега
   */
  extractMileage($el, $) {
    // Ищем dt с текстом "走行距離", берём следующий dd
    // Формат: "12km", "1.8万km", "10,000km"
    let mileageText = '';

    $el.find('dt').each((i, dt) => {
      const $dt = $(dt);
      if ($dt.text().includes('走行距離')) {
        mileageText = $dt.next('dd').text().trim();
        return false; // break
      }
    });

    if (!mileageText) return null;

    // Обрабатываем формат "1.8万km" (18,000 km)
    const manKmMatch = mileageText.match(/([\d.]+)万km/);
    if (manKmMatch) {
      return Math.round(parseFloat(manKmMatch[1]) * 10000);
    }

    // Обрабатываем формат "12km" или "10,000km"
    const kmMatch = mileageText.match(/([\d,]+)km/);
    if (kmMatch) {
      return parseInt(kmMatch[1].replace(/,/g, ''));
    }

    return null;
  }

  /**
   * Извлечение URL изображения
   */
  extractImageUrl($el, $) {
    // Ищем img с атрибутом data-original и width="240" (основное изображение, не thumbnail)
    // Формат: <img data-original="//ccsrpcma.carsensor.net/CSphoto/bkkn/..." width="240">
    let imgSrc = null;

    // Сначала ищем большое изображение (width=240)
    $el.find('img[data-original]').each((i, img) => {
      const $img = $(img);
      const width = $img.attr('width');

      if (width === '240') {
        imgSrc = $img.attr('data-original');
        return false; // break
      }
    });

    // Если не нашли с width=240, берём первое с data-original
    if (!imgSrc) {
      imgSrc = $el.find('img[data-original]').first().attr('data-original');
    }

    // Если всё ещё нет, пробуем обычный src (но скорее всего это будет loading.gif)
    if (!imgSrc || imgSrc.includes('loading')) {
      imgSrc = $el.find('img').first().attr('src');
    }

    if (!imgSrc || imgSrc.includes('loading')) return null;

    // URL начинается с // - добавляем протокол
    if (imgSrc.startsWith('//')) {
      return 'https:' + imgSrc;
    }

    return this.buildFullUrl(imgSrc);
  }

  /**
   * Извлечение типа трансмиссии
   */
  extractTransmission($el, $) {
    // Ищем dt с текстом "ミッション", берём следующий dd
    // Формат: "インパネ4AT", "CVT", "5MT" и т.д.
    let transmissionText = '';

    $el.find('dt').each((i, dt) => {
      const $dt = $(dt);
      if ($dt.text().includes('ミッション')) {
        transmissionText = $dt.next('dd').text().trim();
        return false; // break
      }
    });

    if (!transmissionText) return null;

    const text = transmissionText.toLowerCase();

    // Определяем тип КПП
    if (text.includes('cvt')) return 'CVT';
    if (text.includes('at') || text.includes('オートマ')) return 'AT';
    if (text.includes('mt') || text.includes('マニュアル')) return 'MT';

    // Возвращаем оригинальный текст, если не распознали
    return transmissionText;
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
    // Тип кузова находится в первом li элементе
    // Формат: <ul><li>ミニバン</li><li>白</li></ul>
    const bodyTypeLi = $el.find('ul li').eq(0);

    if (bodyTypeLi.length > 0) {
      return bodyTypeLi.text().trim();
    }

    return null;
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
