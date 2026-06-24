document.getElementById('calc-form').addEventListener('submit', function (e) {
  e.preventDefault();
  clearErrors(e.target);

  var benefitR = parseIntField(document.getElementById('retirementBenefit').value, '퇴직급여');
  var yearsR = parseIntField(document.getElementById('yearsOfService').value, '근속연수');
  var nonTaxR = parseIntField(document.getElementById('nonTaxableIncome').value, '비과세소득');
  if (!benefitR.ok) { showError('retirementBenefit', benefitR.msg); return; }
  if (!yearsR.ok) { showError('yearsOfService', yearsR.msg); return; }
  if (!nonTaxR.ok) { showError('nonTaxableIncome', nonTaxR.msg); return; }

  var r = calcRetirementTaxDetailed(benefitR.value, yearsR.value, nonTaxR.value);

  document.getElementById('result-content').innerHTML =
    buildResultRow('최종 세액', toManwon(r.finalTaxAmount) + '만원', 'color-red') +
    buildResultRow('실수령액', toManwon(r.netReceipt) + '만원', 'color-blue') +
    buildResultRow('실효세율', formatPercent(r.effectiveRate), 'color-orange');

  var steps = [
    { step: '1. 퇴직급여액', value: toManwon(r.retirementBenefit) + '만원', formula: '' },
    { step: '2. 퇴직소득금액', value: toManwon(r.retirementIncomeAmount) + '만원', formula: '퇴직급여 - 비과세소득' },
    { step: '3. 근속연수공제', value: toManwon(r.yearsOfServiceDeduction) + '만원', formula: '근속연수에 따른 공제' },
    { step: '4. 환산급여', value: toManwon(r.convertedIncome) + '만원', formula: '(퇴직소득금액 - 근속연수공제) × 12 ÷ 근속연수\n근속연수공제가 퇴직소득금액보다 크면 전액 공제' },
    { step: '5. 환산급여공제', value: toManwon(r.convertedIncomeDeduction) + '만원', formula: '환산급여 구간별 공제' },
    { step: '6. 과세표준', value: toManwon(r.taxableBase) + '만원', formula: '환산급여 - 환산급여공제' },
    { step: '7. 환산산출세액', value: toManwon(r.convertedCalculatedTax) + '만원', formula: '과세표준 × 세율 - 누진공제' },
    { step: '8. 산출세액', value: toManwon(r.finalTaxAmount) + '만원', formula: '환산산출세액 ÷ 12 × 근속연수' }
  ];

  var stepsHtml = '';
  for (var i = 0; i < steps.length; i++) {
    stepsHtml += '<div class="calc-step"><div class="step-header"><span>' + steps[i].step + '</span><span>' + steps[i].value + '</span></div>';
    if (steps[i].formula) stepsHtml += '<div class="step-formula">' + steps[i].formula + '</div>';
    stepsHtml += '</div>';
  }
  document.getElementById('steps-content').innerHTML = stepsHtml;

  showElement('result-area');
  showElement('steps-area');
  showElement('formula-area');
});
