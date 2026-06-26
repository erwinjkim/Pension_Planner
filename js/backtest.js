// 포트폴리오 백테스트 페이지 로직 (종목명 자동완성 + 기간 프리셋)

// 코드 → 종목명 인덱스
var CODE_TO_NAME = {};
(function () {
  if (window.ETF_LIST) {
    for (var i = 0; i < ETF_LIST.length; i++) CODE_TO_NAME[ETF_LIST[i].c] = ETF_LIST[i].n;
  }
})();
function nameForCode(code) { return CODE_TO_NAME[code] || code; }

var PORTFOLIO_PRESETS = {
  '60-40': [
    { symbol: '360750', weight: 60 },
    { symbol: '148070', weight: 40 }
  ],
  'allweather': [
    { symbol: '360750', weight: 30 },
    { symbol: '273130', weight: 40 },
    { symbol: '411060', weight: 15 },
    { symbol: '069500', weight: 15 }
  ],
  'sp500': [
    { symbol: '360750', weight: 100 }
  ]
};

function escapeAttr(s) { return String(s).replace(/"/g, '&quot;'); }

function assetRowHtml(code, weight) {
  var name = code ? nameForCode(code) : '';
  return (
    '<div class="asset-row">' +
    '<div class="asset-pick">' +
    '<input type="text" class="asset-search" autocomplete="off" placeholder="종목명 검색 (예: 미국S&P500)" value="' + escapeAttr(name) + '" data-code="' + (code || '') + '">' +
    '<ul class="asset-suggest hidden"></ul>' +
    '</div>' +
    '<input type="number" class="asset-weight" inputmode="numeric" min="0" max="100" placeholder="비중%" value="' + (weight != null ? weight : '') + '">' +
    '<span class="asset-pct">%</span>' +
    '<button type="button" class="asset-remove" aria-label="삭제">✕</button>' +
    '</div>'
  );
}

function getAssetRows() {
  return Array.prototype.slice.call(document.querySelectorAll('#asset-rows .asset-row'));
}

function updateWeightSum() {
  var rows = getAssetRows();
  var sum = 0;
  for (var i = 0; i < rows.length; i++) {
    var w = parseFloat(rows[i].querySelector('.asset-weight').value);
    if (!isNaN(w)) sum += w;
  }
  var el = document.getElementById('weight-sum');
  if (el) {
    el.textContent = '비중 합계: ' + (Math.round(sum * 100) / 100) + '%';
    el.classList.toggle('ok', Math.abs(sum - 100) < 0.01);
    el.classList.toggle('bad', Math.abs(sum - 100) >= 0.01);
  }
  return sum;
}

function addAssetRow(code, weight) {
  document.getElementById('asset-rows').insertAdjacentHTML('beforeend', assetRowHtml(code, weight));
  updateWeightSum();
}

function setPreset(key) {
  var preset = PORTFOLIO_PRESETS[key];
  if (!preset) return;
  document.getElementById('asset-rows').innerHTML = '';
  for (var i = 0; i < preset.length; i++) addAssetRow(preset[i].symbol, preset[i].weight);
}

// ── 자동완성 ──
function renderSuggest(listEl, query) {
  query = (query || '').trim().toLowerCase();
  if (!query) { listEl.classList.add('hidden'); listEl.innerHTML = ''; return; }
  var res = [];
  for (var i = 0; i < ETF_LIST.length && res.length < 50; i++) {
    if (ETF_LIST[i].n.toLowerCase().indexOf(query) !== -1) res.push(ETF_LIST[i]);
  }
  if (res.length === 0) {
    listEl.innerHTML = '<li class="asset-suggest-empty">검색 결과 없음</li>';
    listEl.classList.remove('hidden');
    return;
  }
  var html = '';
  for (var j = 0; j < res.length; j++) {
    html += '<li class="asset-suggest-item" data-code="' + res[j].c + '" data-name="' + escapeAttr(res[j].n) + '">' + res[j].n + '</li>';
  }
  listEl.innerHTML = html;
  listEl.classList.remove('hidden');
}

// ── 기간 프리셋 ──
function pad2(n) { return String(n).padStart(2, '0'); }
function fmtDate(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }

function selectedPeriod() {
  var b = document.querySelector('.period-btn.active');
  return b ? b.getAttribute('data-years') : '5';
}

function periodToDates(years) {
  var today = new Date();
  var end = fmtDate(today);
  var start;
  if (years === 'max') {
    start = '2000-01-01';
  } else {
    var n = parseInt(years, 10);
    var sy = today.getFullYear() - n;
    start = sy + '-' + pad2(today.getMonth() + 1) + '-01';
  }
  return { start: start, end: end };
}

// ── 결과 표시 ──
function formatWon(won) {
  var neg = won < 0;
  var man = Math.round(Math.abs(won) / 10000);
  var out;
  if (man >= 10000) {
    var eok = Math.floor(man / 10000);
    var rest = man % 10000;
    out = eok + '억' + (rest > 0 ? ' ' + rest.toLocaleString('ko-KR') + '만원' : '원');
  } else {
    out = man.toLocaleString('ko-KR') + '만원';
  }
  return (neg ? '-' : '') + out;
}

function metricCard(label, value, colorClass) {
  return (
    '<div class="metric-card">' +
    '<div class="metric-label">' + label + '</div>' +
    '<div class="metric-value ' + (colorClass || '') + '">' + value + '</div>' +
    '</div>'
  );
}

function renderMetrics(resp) {
  var m = resp.metrics;
  var profit = m.final_value - m.total_contributed;
  var totalReturn = m.total_contributed > 0 ? (m.final_value / m.total_contributed - 1) * 100 : 0;
  var cagr = (m.cagr_percent != null) ? m.cagr_percent.toFixed(2) + '%' : '-';
  var mdd = (m.mdd_percent != null) ? '-' + m.mdd_percent.toFixed(2) + '%' : '-';
  var html = '';
  html += metricCard('최종 평가금액', formatWon(m.final_value), 'color-blue');
  html += metricCard('총 납입금', formatWon(m.total_contributed), '');
  html += metricCard('총 손익', formatWon(profit), profit >= 0 ? 'color-green' : 'color-red');
  html += metricCard('누적 수익률', (totalReturn >= 0 ? '+' : '') + totalReturn.toFixed(2) + '%', totalReturn >= 0 ? 'color-green' : 'color-red');
  html += metricCard('연평균 수익률(CAGR)', cagr, 'color-purple');
  html += metricCard('최대 낙폭(MDD)', mdd, 'color-red');
  document.getElementById('bt-metrics').innerHTML = html;
}

function parseYearMonth(ym) {
  var p = String(ym || '').split('-');
  return { y: parseInt(p[0], 10), m: parseInt(p[1], 10) };
}

function fmtYearMonthLabel(ym) {
  var d = parseYearMonth(ym);
  if (!d.y) return '';
  return d.y + '.' + d.m;
}

// 실제 연·월을 x축 라벨로 사용. 시작월 기준 i/12(년) 위치에 배치해 데이터와 정렬.
function buildMonthlyTicks(series) {
  var n = series.length;
  if (n <= 1) {
    var lbl = n === 1 ? fmtYearMonthLabel(series[0].year_month) : '';
    return { ticks: [{ year: 0, label: lbl }], span: 1 / 12 };
  }
  var span = (n - 1) / 12;
  var stepYears = getChartXTickStep(Math.max(1, Math.round(span)));
  var stepMonths = Math.max(1, Math.round(stepYears * 12));
  var ticks = [];
  for (var i = 0; i < n; i += stepMonths) {
    ticks.push({ year: i / 12, label: fmtYearMonthLabel(series[i].year_month) });
  }
  var lastYear = (n - 1) / 12;
  if (ticks[ticks.length - 1].year !== lastYear) {
    // 끝점(최신월)이 직전 눈금과 너무 가까우면 그 눈금을 빼서 겹침 방지
    if (ticks.length > 1 && lastYear - ticks[ticks.length - 1].year < stepYears * 0.5) {
      ticks.pop();
    }
    ticks.push({ year: lastYear, label: fmtYearMonthLabel(series[n - 1].year_month) });
  }
  return { ticks: ticks, span: span };
}

function renderChart(resp) {
  var series = resp.series;
  var n = series.length;
  var valueData = [], contribData = [], xValues = [];
  for (var i = 0; i < n; i++) {
    valueData.push(series[i].portfolio_value / 10000);
    contribData.push(series[i].cumulative_contribution / 10000);
    xValues.push(i / 12);
  }
  var t = buildMonthlyTicks(series);
  var chartSeries = [
    { color: '#6CAEDD', data: valueData },
    { color: '#81C784', data: contribData }
  ];
  requestAnimationFrame(function () {
    drawLineChart('bt-chart', t.ticks, chartSeries, { totalYears: t.span, xValues: xValues });
  });
}

function collectRequest() {
  var rows = getAssetRows();
  var assets = [];
  for (var i = 0; i < rows.length; i++) {
    var input = rows[i].querySelector('.asset-search');
    var code = input.getAttribute('data-code');
    var typed = input.value.trim();
    var w = parseFloat(rows[i].querySelector('.asset-weight').value);
    if (!code && !typed && isNaN(w)) continue;
    if (!code) {
      return { ok: false, msg: '"' + (typed || '빈 칸') + '" 은(는) 목록에서 종목을 선택해 주세요' };
    }
    if (isNaN(w) || w < 0) {
      return { ok: false, msg: nameForCode(code) + ' 의 비중을 올바르게 입력하세요' };
    }
    assets.push({ symbol: code, weight: w });
  }
  if (assets.length === 0) return { ok: false, msg: '종목을 1개 이상 선택하세요' };

  var sum = 0;
  for (var k = 0; k < assets.length; k++) sum += assets[k].weight;
  if (Math.abs(sum - 100) > 0.01) return { ok: false, msg: '비중 합계가 100%가 되어야 합니다 (현재 ' + (Math.round(sum * 100) / 100) + '%)' };

  var p = periodToDates(selectedPeriod());
  var initialMan = parseFloat(document.getElementById('initial-amount').value);
  var monthlyMan = parseFloat(document.getElementById('monthly-contribution').value);
  if (isNaN(initialMan) || initialMan <= 0) return { ok: false, msg: '초기 투자금을 입력하세요' };
  if (isNaN(monthlyMan) || monthlyMan < 0) monthlyMan = 0;

  return {
    ok: true,
    body: {
      start_date: p.start,
      end_date: p.end,
      initial_amount: Math.round(initialMan * 10000),
      monthly_contribution: Math.round(monthlyMan * 10000),
      rebalance: document.getElementById('rebalance').value,
      assets: assets
    }
  };
}

function setLoading(loading) {
  var btn = document.getElementById('run-btn');
  var spinner = document.getElementById('bt-loading');
  if (btn) {
    btn.disabled = loading;
    btn.textContent = loading ? '시뮬레이션 중...' : '백테스트 실행';
  }
  if (spinner) spinner.classList.toggle('hidden', !loading);
}

function showBtError(msg) {
  var el = document.getElementById('bt-error');
  if (!el) return;
  if (msg) { el.textContent = '⚠️ ' + msg; el.classList.remove('hidden'); }
  else { el.classList.add('hidden'); }
}

function runBacktest() {
  showBtError('');
  var req = collectRequest();
  if (!req.ok) { showBtError(req.msg); return; }

  setLoading(true);
  hideElement('bt-result');
  apiPost('/api/v1/backtest', req.body)
    .then(function (resp) {
      renderMetrics(resp);
      renderChart(resp);
      showElement('bt-result');
      document.getElementById('bt-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
    })
    .catch(function (err) {
      var msg = err && err.message ? err.message : '요청 중 오류가 발생했습니다';
      if (/Failed to fetch|NetworkError|load failed/i.test(msg)) {
        msg = 'API 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.';
      }
      showBtError(msg);
    })
    .then(function () { setLoading(false); });
}

(function initBacktestPage() {
  setPreset('60-40');

  // 금액 입력: 숫자만 허용(화살표 스피너 없음)
  ['initial-amount', 'monthly-contribution'].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', function () {
      var cleaned = el.value.replace(/[^\d]/g, '');
      if (cleaned !== el.value) el.value = cleaned;
    });
  });

  var container = document.getElementById('asset-rows');

  // 검색 입력 → 자동완성 / 비중 입력 → 합계
  container.addEventListener('input', function (e) {
    if (e.target.classList.contains('asset-search')) {
      e.target.setAttribute('data-code', ''); // 직접 타이핑 시 이전 선택 해제
      var list = e.target.parentElement.querySelector('.asset-suggest');
      renderSuggest(list, e.target.value);
    } else if (e.target.classList.contains('asset-weight')) {
      updateWeightSum();
    }
  });

  // 제안 항목 선택 (mousedown: blur보다 먼저 발생)
  container.addEventListener('mousedown', function (e) {
    var item = e.target.closest && e.target.closest('.asset-suggest-item');
    if (!item) return;
    e.preventDefault();
    var pick = item.closest('.asset-pick');
    var input = pick.querySelector('.asset-search');
    input.value = item.getAttribute('data-name');
    input.setAttribute('data-code', item.getAttribute('data-code'));
    pick.querySelector('.asset-suggest').classList.add('hidden');
  });

  // 포커스 아웃 시 드롭다운 닫기
  container.addEventListener('focusout', function (e) {
    if (e.target.classList.contains('asset-search')) {
      var list = e.target.parentElement.querySelector('.asset-suggest');
      setTimeout(function () { if (list) list.classList.add('hidden'); }, 150);
    }
  });

  // 삭제
  container.addEventListener('click', function (e) {
    if (e.target.classList.contains('asset-remove')) {
      if (getAssetRows().length <= 1) return;
      e.target.closest('.asset-row').remove();
      updateWeightSum();
    }
  });

  document.getElementById('add-asset').addEventListener('click', function () { addAssetRow('', ''); });

  // 프리셋
  var presetBtns = document.querySelectorAll('[data-preset]');
  for (var i = 0; i < presetBtns.length; i++) {
    presetBtns[i].addEventListener('click', function (e) { setPreset(e.target.getAttribute('data-preset')); });
  }

  // 기간 버튼
  var periodBtns = document.querySelectorAll('.period-btn');
  for (var j = 0; j < periodBtns.length; j++) {
    periodBtns[j].addEventListener('click', function (e) {
      for (var k = 0; k < periodBtns.length; k++) periodBtns[k].classList.remove('active');
      e.target.classList.add('active');
    });
  }

  document.getElementById('run-btn').addEventListener('click', runBacktest);
})();
