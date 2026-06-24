document.getElementById('calc-form').addEventListener('submit', function (e) {
  e.preventDefault();
  var form = e.target;
  clearErrors(form);

  var salaryR = parseIntField(document.getElementById('currentSalary').value, '입사 연봉');
  var growthR = parseFloatField(document.getElementById('growthRate').value, '평균 연봉 인상률');
  var bonusR = parseIntField(document.getElementById('performanceBonus').value, '연평균 성과급 비율');
  var investR = parseFloatField(document.getElementById('investmentReturn').value, '연간 투자수익률');
  var yearsR = parseIntField(document.getElementById('yearsOfService').value, '근속연수');
  if (!salaryR.ok) { showError('currentSalary', salaryR.msg); return; }
  if (!growthR.ok) { showError('growthRate', growthR.msg); return; }
  if (!bonusR.ok) { showError('performanceBonus', bonusR.msg); return; }
  if (!investR.ok) { showError('investmentReturn', investR.msg); return; }
  if (!yearsR.ok) { showError('yearsOfService', yearsR.msg); return; }

  var growthRate = growthR.value / 100;
  var investmentReturn = investR.value / 100;
  var years = yearsR.value;

  var annual = (salaryR.value * (1 + bonusR.value / 100)) * Math.pow(1 + growthRate, years - 1);
  var monthly = annual / 12;
  var dcAmount;
  if (investmentReturn === growthRate) {
    dcAmount = monthly * years;
  } else {
    var ratio = (1 + investmentReturn) / (1 + growthRate);
    dcAmount = monthly * (Math.pow(ratio, years) - 1) / (ratio - 1);
  }
  var tax = calcRetirementTax(dcAmount, years, 0);

  document.getElementById('result-content').innerHTML =
    buildResultRow('퇴직시 연봉과 성과급', formatManwon(annual), 'color-blue') +
    buildResultRow('퇴직시 월급과 환산 성과급', formatManwon(monthly), 'color-green') +
    buildResultRow('DC 퇴직금', formatManwon(dcAmount), 'color-red') +
    buildResultRow('퇴직소득세', formatManwon(tax.taxAmount / 10000), 'color-red') +
    buildResultRow('실효세율', formatPercent(tax.effectiveRate), 'color-purple');

  var tableData = generateComparisonData(salaryR.value, growthRate, bonusR.value, investmentReturn, years);
  var rows = [];
  for (var i = 0; i < tableData.length; i++) {
    var row = tableData[i];
    rows.push([
      row.year + '년차',
      row.dbAmount.toFixed(0),
      row.dcAmount.toFixed(0),
      (row.dcAmount - row.dbAmount).toFixed(0)
    ]);
  }
  document.getElementById('compare-table').innerHTML = buildTable(
    ['연차', 'DB 퇴직금\n(만원)', 'DC 퇴직금\n(만원)', '차이\n(만원)'],
    rows,
    { highlightRow: years - 1 }
  );

  var dbData = [];
  var dcData = [];
  for (var j = 0; j < tableData.length; j++) {
    dbData.push(tableData[j].dbAmount);
    dcData.push(tableData[j].dcAmount);
  }
  showElement('result-area');
  showElement('compare-area');
  showElement('chart-area');

  var chartTicks = buildChartXTicks(years);
  var chartSeries = [
    { color: '#6CAEDD', data: dbData },
    { color: '#81C784', data: dcData }
  ];
  requestAnimationFrame(function () {
    drawLineChart('compare-chart', chartTicks, chartSeries, { totalYears: years });
  });
});
