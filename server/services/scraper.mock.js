/**
 * Mock данные для тестирования скрапера без реальных HTTP запросов
 */

// Mock HTML для страницы поиска
const mockSearchPageHTML = `
<html>
  <body>
    <div>
      <h3>
        <a href="/usedcar/detail/AU6757636162/index.html">トヨタ タウンエースバン 1.5 GL 4WD</a>
      </h3>
      <dl>
        <dt>年式</dt>
        <dd>2025(R07)年</dd>
        <dt>走行距離</dt>
        <dd>12km</dd>
        <dt>ミッション</dt>
        <dd>AT</dd>
      </dl>
      <p>支払総額 271.9万円</p>
      <ul>
        <li>バン</li>
        <li>白</li>
      </ul>
      <img data-original="//ccsrpcma.carsensor.net/CSphoto/bkkn/394/002/U00051394002/U00051394002_002M.JPG" width="240">
    </div>
    <div>
      <h3>
        <a href="/usedcar/detail/AU6723842884/index.html">トヨタ アクア 1.0 X</a>
      </h3>
      <dl>
        <dt>年式</dt>
        <dd>2024(R06)年</dd>
        <dt>走行距離</dt>
        <dd>5km</dd>
        <dt>ミッション</dt>
        <dd>CVT</dd>
      </dl>
      <p>支払総額 190.9万円</p>
      <ul>
        <li>Sedan</li>
        <li>黒</li>
      </ul>
      <img data-original="//ccsrpcma.carsensor.net/CSphoto/bkkn/254/896/U00051254896/U00051254896_002M.JPG" width="240">
    </div>
    <div>
      <h3>
        <a href="/usedcar/detail/AU6567192867/index.html">ホンダ シビック 1.5 Turbo</a>
      </h3>
      <dl>
        <dt>年式</dt>
        <dd>2023(R05)年</dd>
        <dt>走行距離</dt>
        <dd>1.4万km</dd>
        <dt>ミッション</dt>
        <dd>CVT</dd>
      </dl>
      <p>車両本体価格 236.5万円</p>
      <ul>
        <li>Sedan</li>
        <li>青</li>
      </ul>
      <img data-original="//ccsrpcma.carsensor.net/CSphoto/bkkn/294/240/UJ0050294240/UJ0050294240_003M.JPG" width="240">
    </div>
  </body>
</html>
`;

// Mock HTML для детальной страницы
const mockDetailPageHTML = `
<html>
  <head>
    <meta property="og:image" content="https://ccsrpcma.carsensor.net/CSphoto/bkkn/394/002/U00051394002/U00051394002_002L.JPG">
  </head>
  <body>
    <img class="detailSlider__mainImg" src="https://ccsrpcma.carsensor.net/CSphoto/bkkn/394/002/U00051394002/U00051394002_002L.JPG" alt="Toyota">
    <h1>トヨタ タウンエースバン 1.5 GL 4WD</h1>
    <p>価格: 271.9万円</p>
  </body>
</html>
`;

// Mock JSON данные (готовые результаты)
const mockCarsData = [
  {
    external_id: 'MOCK_TOYOTA_001',
    url: 'https://www.carsensor.net/usedcar/detail/MOCK_TOYOTA_001/index.html',
    brand: 'Toyota',
    model: 'Town Ace Van 1.5 GL 4WD',
    year: 2025,
    price: 2719000,
    color: '白',
    mileage: 12,
    image_url: 'https://ccsrpcma.carsensor.net/CSphoto/bkkn/394/002/U00051394002/U00051394002_002L.JPG',
    transmission: 'AT',
    fuel_type: 'Gasoline',
    body_type: 'バン',
    location: '東京都',
    description: '4WD/ベッドキット/セーフティセンス',
    last_scraped_at: new Date()
  },
  {
    external_id: 'MOCK_TOYOTA_002',
    url: 'https://www.carsensor.net/usedcar/detail/MOCK_TOYOTA_002/index.html',
    brand: 'Toyota',
    model: 'Aqua 1.0 X',
    year: 2024,
    price: 1909000,
    color: '黒',
    mileage: 5,
    image_url: 'https://ccsrpcma.carsensor.net/CSphoto/bkkn/254/896/U00051254896/U00051254896_002L.JPG',
    transmission: 'CVT',
    fuel_type: 'Hybrid',
    body_type: 'Sedan',
    location: '神奈川県',
    description: '禁煙車 トヨタセーフティセンス',
    last_scraped_at: new Date()
  },
  {
    external_id: 'MOCK_HONDA_001',
    url: 'https://www.carsensor.net/usedcar/detail/MOCK_HONDA_001/index.html',
    brand: 'Honda',
    model: 'Civic 1.5 Turbo',
    year: 2023,
    price: 2365000,
    color: '青',
    mileage: 14000,
    image_url: 'https://ccsrpcma.carsensor.net/CSphoto/bkkn/294/240/UJ0050294240/UJ0050294240_003L.JPG',
    transmission: 'CVT',
    fuel_type: 'Gasoline',
    body_type: 'Sedan',
    location: '大阪府',
    description: 'ターボ バックカメラ レーダークルーズ',
    last_scraped_at: new Date()
  }
];

module.exports = {
  mockSearchPageHTML,
  mockDetailPageHTML,
  mockCarsData
};
