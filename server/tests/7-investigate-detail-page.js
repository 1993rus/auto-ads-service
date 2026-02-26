/**
 * Исследование HTML детальной страницы автомобиля
 *
 * Запуск: node tests/7-investigate-detail-page.js
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function investigateDetailPage() {
  console.log('=== ИССЛЕДОВАНИЕ ДЕТАЛЬНОЙ СТРАНИЦЫ ===\n');

  try {
    // Читаем результаты скрапинга
    const resultsPath = path.join(__dirname, 'scraper-results.json');

    if (!fs.existsSync(resultsPath)) {
      console.log('❌ Файл scraper-results.json не найден!');
      console.log('   Сначала запустите: node tests/5-test-scraper-real.js');
      process.exit(1);
    }

    const carsData = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
    const car = carsData[0]; // Берем первый автомобиль

    if (!car || !car.url) {
      console.log('❌ В файле нет автомобилей с URL');
      process.exit(1);
    }

    console.log(`📋 Тестовый автомобиль:`);
    console.log(`   External ID: ${car.external_id}`);
    console.log(`   Марка: ${car.brand}`);
    console.log(`   Модель: ${car.model.substring(0, 50)}...`);
    console.log(`   URL: ${car.url}`);
    console.log(`   Текущее изображение: ${car.image_url || 'отсутствует'}\n`);

    console.log('📡 Загружаю детальную страницу...\n');

    const response = await axios.get(car.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);

    console.log('🔍 Ищу изображения на странице...\n');

    // Стратегия 1: Ищем все img теги
    const allImages = [];
    $('img').each((i, img) => {
      const $img = $(img);
      const src = $img.attr('src');
      const dataSrc = $img.attr('data-src');
      const dataOriginal = $img.attr('data-original');
      const alt = $img.attr('alt');
      const width = $img.attr('width');
      const height = $img.attr('height');

      if (src || dataSrc || dataOriginal) {
        allImages.push({
          index: i,
          src,
          dataSrc,
          dataOriginal,
          alt,
          width,
          height,
          class: $img.attr('class')
        });
      }
    });

    console.log(`Найдено изображений всего: ${allImages.length}\n`);

    // Показываем первые 10 изображений
    console.log('📸 Первые 10 изображений:');
    allImages.slice(0, 10).forEach((img, i) => {
      console.log(`\n--- Изображение ${i + 1} ---`);
      console.log(`Src: ${img.src || 'нет'}`);
      console.log(`Data-src: ${img.dataSrc || 'нет'}`);
      console.log(`Data-original: ${img.dataOriginal || 'нет'}`);
      console.log(`Alt: ${img.alt || 'нет'}`);
      console.log(`Size: ${img.width}x${img.height}`);
      console.log(`Class: ${img.class || 'нет'}`);
    });

    // Стратегия 2: Ищем мета-теги с изображениями
    console.log('\n\n🔍 Проверяю мета-теги...\n');

    const ogImage = $('meta[property="og:image"]').attr('content');
    const twitterImage = $('meta[name="twitter:image"]').attr('content');

    if (ogImage) {
      console.log(`✅ og:image найден: ${ogImage}`);
    }
    if (twitterImage) {
      console.log(`✅ twitter:image найден: ${twitterImage}`);
    }

    // Стратегия 3: Ищем специфичные классы/ID для галереи
    console.log('\n\n🔍 Ищу галерею изображений...\n');

    const gallerySelectors = [
      '.photo', '.photos', '.gallery', '.image-gallery',
      '.car-image', '.car-photo', '.main-image', '.detail-image',
      '#photos', '#gallery', '#carImage'
    ];

    gallerySelectors.forEach(selector => {
      const $gallery = $(selector);
      if ($gallery.length > 0) {
        console.log(`✅ Найден элемент: ${selector} (${$gallery.length} элементов)`);

        // Ищем img внутри
        const $imgs = $gallery.find('img');
        if ($imgs.length > 0) {
          console.log(`   Содержит ${$imgs.length} изображений`);
          $imgs.slice(0, 3).each((i, img) => {
            const $img = $(img);
            console.log(`   - img ${i + 1}: src="${$img.attr('src')}", data-original="${$img.attr('data-original')}"`);
          });
        }
      }
    });

    // Стратегия 4: Ищем JSON-LD с изображениями
    console.log('\n\n🔍 Проверяю JSON-LD структурированные данные...\n');

    $('script[type="application/ld+json"]').each((i, script) => {
      try {
        const data = JSON.parse($(script).html());
        if (data.image) {
          console.log(`✅ JSON-LD ${i + 1} содержит изображение:`);
          console.log(`   ${typeof data.image === 'string' ? data.image : JSON.stringify(data.image)}`);
        }
      } catch (e) {
        // Ignore parsing errors
      }
    });

    // Сохраняем HTML для ручного анализа
    const htmlPath = path.join(__dirname, 'detail-page.html');
    fs.writeFileSync(htmlPath, response.data, 'utf-8');
    console.log(`\n\n💾 HTML сохранен в: ${htmlPath}`);
    console.log('   Вы можете открыть его в браузере для визуального анализа');

    console.log('\n\n✅ ИССЛЕДОВАНИЕ ЗАВЕРШЕНО!');

  } catch (error) {
    console.error('\n❌ ОШИБКА:', error.message);
    if (error.response) {
      console.error('HTTP Status:', error.response.status);
    }
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Запуск исследования
investigateDetailPage();
