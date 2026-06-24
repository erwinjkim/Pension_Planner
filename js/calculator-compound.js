document.getElementById('calc-form').addEventListener('submit', function (e) {
  e.preventDefault();
  clearErrors(e.target);

  var principalR = parseIntField(document.getElementById('principal').value, '초기 투자금');
  var rateR = parseFloatField(document.getElementById('rate').value, '연 수익률');
  var yearsR = parseIntField(document.getElementById('years').value, '투자 기간');
  var monthlyR = parseIntField(document.getElementById('monthlyContribution').value, '월 납입금');
  if (!principalR.ok) { showError('principal', principalR.msg); return; }
  if (!rateR.ok) { showError('rate', rateR.msg); return; }
  if (!yearsR.ok) { showError('years', yearsR.msg); return; }
  if (!monthlyR.ok) { showError('monthlyContribution', monthlyR.msg); return; }

  var rate = rateR.value / 100;
  var years = yearsR.value;
  var compoundAmount = principalR.value * Math.pow(1 + rate, years);
  var monthlyTotal = monthlyR.value * 12 * years;
  var monthlyFuture;
  if (rate === 0) {
    monthlyFuture = monthlyTotal;
  } else {
    monthlyFuture = monthlyR.value * 12 * ((Math.pow(1 + rate, years) - 1) / rate);
  }
  var result = compoundAmount + monthlyFuture;
  var totalContribution = principalR.value + monthlyTotal;
  var interestEarned = result - totalContribution;
  var returnRate = totalContribution > 0 ? (interestEarned / totalContribution) * 100 : 0;

  document.getElementById('result-content').innerHTML =
    buildResultRow('최종 자산', formatManwon(result), 'color-green') +
    buildResultRow('총 납입금', formatManwon(totalContribution), 'color-blue') +
    buildResultRow('복리 수익', formatManwon(interestEarned), 'color-orange') +
    buildResultRow('수익률', returnRate.toFixed(1) + '%', 'color-purple');

  showElement('result-area');
});
