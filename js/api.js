// Pension Compass API 연동 설정
//
// 배포 후: 아래 PROD_API_BASE 값을 Cloud Run 서비스 URL로 교체하세요.
//   예) https://pension-api-xxxxxxxx-an.a.run.app
// 로컬 개발(localhost/127.0.0.1)에서는 자동으로 로컬 API(127.0.0.1:8080)를 사용합니다.

var PROD_API_BASE = 'https://pension-api-uirjby6cha-du.a.run.app';

// API_KEY 보호를 켰다면 여기에 키를 넣으면 X-API-Key 헤더로 전송됩니다(선택).
var API_KEY = '';

var API_BASE_URL = (function () {
  // 기본은 배포된 Cloud Run API를 사용(어디서 열어도 동작).
  // 로컬 API(127.0.0.1:8080)로 테스트하려면 브라우저 콘솔에서:
  //   localStorage.setItem('useLocalApi','1')  // 끄려면 removeItem
  try {
    if (window.localStorage && localStorage.getItem('useLocalApi') === '1') {
      return 'http://127.0.0.1:8080';
    }
  } catch (e) {}
  return PROD_API_BASE;
})();

function apiPost(path, body) {
  var headers = { 'Content-Type': 'application/json' };
  if (API_KEY) headers['X-API-Key'] = API_KEY;
  return fetch(API_BASE_URL + path, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body)
  }).then(function (res) {
    return res.text().then(function (text) {
      var data = null;
      try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
      if (!res.ok) {
        var msg = (data && (data.detail || data.message)) || ('요청 실패 (' + res.status + ')');
        if (typeof msg !== 'string') msg = JSON.stringify(msg);
        throw new Error(msg);
      }
      return data;
    });
  });
}
