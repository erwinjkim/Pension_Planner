document.getElementById('calc-form').addEventListener('submit', function (e) {
  e.preventDefault();
  var form = e.target;
  clearErrors(form);

  var salaryR = parseIntField(document.getElementById('retirementSalary').value, '퇴직 예상 연봉');
  var bonusR = parseIntField(document.getElementById('performanceBonus').value, '퇴직연도 성과급 비율');
  var yearsR = parseIntField(document.getElementById('yearsOfService').value, '근속연수');
  if (!salaryR.ok) { showError('retirementSalary', salaryR.msg); return; }
  if (!bonusR.ok) { showError('performanceBonus', bonusR.msg); return; }
  if (!yearsR.ok) { showError('yearsOfService', yearsR.msg); return; }

  var annual = salaryR.value * (1 + bonusR.value / 100);
  var monthly = annual / 12;
  var severance = monthly * yearsR.value;
  var tax = calcRetirementTax(severance, yearsR.value, 0);

  document.getElementById('result-content').innerHTML =
    buildResultRow('퇴직시 연봉과 성과급', formatManwon(annual), 'color-blue') +
    buildResultRow('퇴직시 월급과 환산 성과급', formatManwon(monthly), 'color-green') +
    buildResultRow('퇴직금', formatManwon(severance), 'color-red') +
    buildResultRow('퇴직소득세', formatManwon(tax.taxAmount / 10000), 'color-red') +
    buildResultRow('실효세율', formatPercent(tax.effectiveRate), 'color-purple');

  showElement('result-area');
});
