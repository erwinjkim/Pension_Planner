function drawLineChart(canvasId, xTicks, series, options) {
  var canvas = document.getElementById(canvasId);
  if (!canvas || !series || series.length === 0) return;

  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var rect = canvas.parentElement.getBoundingClientRect();
  var W = rect.width;
  var H = rect.height;
  if (W <= 0 || H <= 0) {
    W = canvas.parentElement.clientWidth || 320;
    H = canvas.parentElement.clientHeight || 280;
  }

  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.scale(dpr, dpr);
  var padL = 56;
  var padR = 16;
  var padT = 16;
  var padB = 36;
  var chartW = W - padL - padR;
  var chartH = H - padT - padB;

  var maxVal = 0;
  for (var s = 0; s < series.length; s++) {
    for (var i = 0; i < series[s].data.length; i++) {
      if (series[s].data[i] > maxVal) maxVal = series[s].data[i];
    }
  }
  var interval = getYInterval(maxVal);
  var maxY = Math.ceil(maxVal / interval) * interval || interval;

  ctx.clearRect(0, 0, W, H);

  // grid
  ctx.strokeStyle = '#444444';
  ctx.lineWidth = 1;
  var gridCount = Math.round(maxY / interval);
  for (var g = 0; g <= gridCount; g++) {
    var yVal = g * interval;
    var y = padT + chartH - (yVal / maxY) * chartH;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + chartW, y);
    ctx.stroke();

    ctx.fillStyle = '#B5B5B5';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(formatYLabel(yVal), padL - 6, y + 4);
  }

  // border
  ctx.strokeStyle = '#555555';
  ctx.strokeRect(padL, padT, chartW, chartH);

  options = options || {};
  var totalYears = options.totalYears;
  if (!totalYears && xTicks.length > 0) {
    totalYears = xTicks[xTicks.length - 1].year;
  }
  if (!totalYears) totalYears = 1;

  function yearToX(year) {
    return padL + (year / totalYears) * chartW;
  }

  // x labels
  ctx.fillStyle = '#B5B5B5';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  for (var x = 0; x < xTicks.length; x++) {
    var tick = xTicks[x];
    if (!tick || !tick.label) continue;
    ctx.fillText(tick.label, yearToX(tick.year), H - 8);
  }

  // lines
  for (var si = 0; si < series.length; si++) {
    var data = series[si].data;
    ctx.strokeStyle = series[si].color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (var di = 0; di < data.length; di++) {
      var cx = yearToX(di + 1);
      var cy = padT + chartH - (data[di] / maxY) * chartH;
      if (di === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    ctx.fillStyle = series[si].color;
    for (var di2 = 0; di2 < data.length; di2++) {
      var cx2 = yearToX(di2 + 1);
      var cy2 = padT + chartH - (data[di2] / maxY) * chartH;
      ctx.beginPath();
      ctx.arc(cx2, cy2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1E1E1E';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }
}

function getYInterval(maxValue) {
  if (maxValue >= 600000) return 100000;
  if (maxValue >= 300000) return 50000;
  if (maxValue >= 100000) return 20000;
  if (maxValue >= 50000) return 10000;
  if (maxValue >= 20000) return 5000;
  if (maxValue >= 10000) return 2000;
  return 1000;
}

function formatYLabel(value) {
  if (value === 0) return '0';
  if (value >= 10000) {
    var eok = value / 10000;
    return (eok % 1 === 0 ? eok.toFixed(0) : eok.toFixed(1)) + '억';
  }
  return Math.round(value / 1000) + '천만';
}

function getChartXTickStep(totalYears) {
  if (totalYears <= 6) return 1;
  var steps = [2, 3, 5, 10];
  var bestStep = 5;
  var bestScore = -1;
  for (var i = 0; i < steps.length; i++) {
    var step = steps[i];
    var count = Math.floor(totalYears / step) + 1;
    if (totalYears % step !== 0) count++;
    if (count >= 5 && count <= 7) {
      var score = 7 - Math.abs(count - 6);
      if (score > bestScore) {
        bestScore = score;
        bestStep = step;
      }
    }
  }
  if (bestScore >= 0) return bestStep;
  return totalYears >= 20 ? 5 : 2;
}

function buildChartXTicks(totalYears) {
  if (totalYears <= 0) return [{ year: 0, label: '0년' }];
  var step = getChartXTickStep(totalYears);
  var ticks = [];
  for (var y = 0; y <= totalYears; y += step) {
    ticks.push({ year: y, label: y + '년' });
  }
  if (ticks[ticks.length - 1].year !== totalYears) {
    ticks.push({ year: totalYears, label: totalYears + '년' });
  }
  return ticks;
}

function generateComparisonData(currentSalary, growthRate, performanceBonus, investmentReturn, yearsOfService) {
  var tableData = [];
  for (var year = 1; year <= yearsOfService; year++) {
    var dbAnnual = currentSalary * (1 + performanceBonus / 100) * Math.pow(1 + growthRate, year - 1);
    var dbMonthly = dbAnnual / 12;
    var dbAmount = dbMonthly * year;
    var dcAmount;
    if (investmentReturn === growthRate) {
      dcAmount = dbAmount;
    } else {
      var ratio = (1 + investmentReturn) / (1 + growthRate);
      dcAmount = dbMonthly * (Math.pow(ratio, year) - 1) / (ratio - 1);
    }
    tableData.push({ year: year, dbAmount: dbAmount, dcAmount: dcAmount });
  }
  return tableData;
}
