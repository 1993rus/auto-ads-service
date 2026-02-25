require('dotenv').config();
const { Car } = require('../db/models');
const carService = require('../services/car.service');

async function debugDetectChanges() {
  console.log('=== DEBUG detectChanges ===\n');

  try {
    // Получаем автомобиль из БД
    const car = await Car.findOne({
      where: { external_id: 'TEST_TOYOTA_CAMRY_001' }
    });

    if (!car) {
      console.log('Автомобиль не найден в БД');
      return;
    }

    console.log('Автомобиль из БД:');
    console.log('  Цена (тип):', typeof car.price, '=', car.price);
    console.log('  Пробег (тип):', typeof car.mileage, '=', car.mileage);

    // Тестовые данные с той же ценой
    const sameData = {
      price: 2300000, // Та же цена, что в БД
      mileage: 32000  // Тот же пробег
    };

    console.log('\nТестовые данные (те же значения):');
    console.log('  Цена (тип):', typeof sameData.price, '=', sameData.price);
    console.log('  Пробег (тип):', typeof sameData.mileage, '=', sameData.mileage);

    // Тестовые данные с другой ценой
    const differentData = {
      price: 9999999,
      mileage: 32000
    };

    console.log('\nТестовые данные (другие значения):');
    console.log('  Цена (тип):', typeof differentData.price, '=', differentData.price);

    // Проверяем нормализацию
    console.log('\n=== Нормализация значений ===');
    console.log('БД цена нормализована:', carService.normalizeValue(car.price));
    console.log('Тест цена нормализована:', carService.normalizeValue(sameData.price));
    console.log('Равны?', carService.normalizeValue(car.price) === carService.normalizeValue(sameData.price));

    // Проверяем detectChanges
    console.log('\n=== detectChanges ===');
    const noChanges = carService.detectChanges(car, sameData);
    const hasChanges = carService.detectChanges(car, differentData);

    console.log('С теми же данными (должно быть false):', noChanges);
    console.log('С другими данными (должно быть true):', hasChanges);

    if (noChanges === false && hasChanges === true) {
      console.log('\n✅ detectChanges работает КОРРЕКТНО!');
    } else {
      console.log('\n❌ detectChanges работает НЕКОРРЕКТНО!');
      console.log('  Ожидалось: noChanges=false, hasChanges=true');
      console.log('  Получено: noChanges=' + noChanges + ', hasChanges=' + hasChanges);
    }

  } catch (error) {
    console.error('Ошибка:', error);
  }

  process.exit(0);
}

debugDetectChanges();
