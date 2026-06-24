function generateDetailedReceiptTable(age, retirementAmount, yearsOfService, annualReceipt, investmentReturnPct, retirementTaxTotalWon) {
  var tableData = [];
  var principalBalance = retirementAmount;
  var profitBalance = 0;
  var currentAge = age;
  var year = 1;
  var investmentReturn = investmentReturnPct / 100;
  var retirementTaxTotal = retirementTaxTotalWon / 10000;

  while ((principalBalance > 0 || profitBalance > 0) && currentAge <= 100) {
    var carriedOver = principalBalance + profitBalance;
    var withdrawal = Math.min(annualReceipt, carriedOver);
    var principalWithdrawal = 0;
    var profitWithdrawal = 0;

    if (principalBalance > 0) {
      principalWithdrawal = Math.min(withdrawal, principalBalance);
      profitWithdrawal = withdrawal - principalWithdrawal;
      principalBalance -= principalWithdrawal;
      profitBalance -= profitWithdrawal;
    } else {
      profitWithdrawal = withdrawal;
      profitBalance -= profitWithdrawal;
    }

    var remainingBalance = carriedOver - withdrawal;
    var newProfit = remainingBalance * investmentReturn;
    profitBalance += newProfit;
    var balanceWithProfit = principalBalance + profitBalance;

    var tax = 0;
    var taxType = '';

    if (principalWithdrawal > 0) {
      var totalPrincipalYears = retirementAmount / annualReceipt;
      var taxRate;
      if (totalPrincipalYears < 10) {
        taxRate = 1.0;
        taxType = '퇴직소득세 100%';
      } else if (year <= 10) {
        taxRate = 0.70;
        taxType = '퇴직소득세 70%';
      } else {
        taxRate = 0.60;
        taxType = '퇴직소득세 60%';
      }
      var annualTaxRate = (retirementTaxTotal * taxRate) / retirementAmount;
      tax = principalWithdrawal * annualTaxRate;

      if (profitWithdrawal > 0) {
        var profitTax = 0;
        var pensionTaxText = '';
        if (profitWithdrawal > 1500) {
          profitTax = profitWithdrawal * 0.165;
          pensionTaxText = '연금소득세 16.5%';
        } else if (currentAge >= 80) {
          profitTax = profitWithdrawal * 0.033;
          pensionTaxText = '연금소득세 3.3%';
        } else if (currentAge >= 70) {
          profitTax = profitWithdrawal * 0.044;
          pensionTaxText = '연금소득세 4.4%';
        } else {
          profitTax = profitWithdrawal * 0.055;
          pensionTaxText = '연금소득세 5.5%';
        }
        tax += profitTax;
        taxType = taxType.replace('퇴직소득세', '퇴직연금세') + '\n' + pensionTaxText;
      }
    } else {
      if (withdrawal > 1500) {
        tax = withdrawal * 0.165;
        taxType = '연금소득세 16.5%';
      } else if (currentAge >= 80) {
        tax = withdrawal * 0.033;
        taxType = '연금소득세 3.3%';
      } else if (currentAge >= 70) {
        tax = withdrawal * 0.044;
        taxType = '연금소득세 4.4%';
      } else {
        tax = withdrawal * 0.055;
        taxType = '연금소득세 5.5%';
      }
    }

    var netReceipt = withdrawal - tax;
    var isLastYear = remainingBalance <= 0 || currentAge >= 100;

    tableData.push({
      pensionYear: currentAge - 54,
      year: year,
      age: currentAge,
      carriedOver: carriedOver,
      principalWithdrawal: principalWithdrawal,
      profitWithdrawal: profitWithdrawal,
      remainingBalance: remainingBalance,
      balanceWithProfit: balanceWithProfit,
      tax: tax,
      taxType: taxType,
      netReceipt: netReceipt,
      isLastYear: isLastYear
    });

    currentAge++;
    year++;
    if (isLastYear) break;
  }
  return tableData;
}

document.getElementById('calc-form').addEventListener('submit', function (e) {
  e.preventDefault();
  clearErrors(e.target);

  var ageR = parseIntField(document.getElementById('age').value, '연금 개시 나이');
  var amountR = parseIntField(document.getElementById('retirementAmount').value, '퇴직금');
  var yearsR = parseIntField(document.getElementById('yearsOfService').value, '근속연수');
  var receiptR = parseIntField(document.getElementById('annualReceipt').value, '연 수령액');
  var investR = parseFloatField(document.getElementById('investmentReturn').value, '연간 투자수익률');

  if (!ageR.ok) { showError('age', ageR.msg); return; }
  if (ageR.value < 55) { showError('age', '연금은 55세부터 받을 수 있습니다'); return; }
  if (ageR.value > 120) { showError('age', '올바른 나이를 입력해주세요 (18~120)'); return; }
  if (!amountR.ok) { showError('retirementAmount', amountR.msg); return; }
  if (!yearsR.ok) { showError('yearsOfService', yearsR.msg); return; }
  if (yearsR.value < 1 || yearsR.value > 50) { showError('yearsOfService', '올바른 근속연수를 입력해주세요 (1~50년)'); return; }
  if (!receiptR.ok) { showError('annualReceipt', receiptR.msg); return; }
  if (!investR.ok) { showError('investmentReturn', investR.msg); return; }

  var pensionReceiptYear = ageR.value - 54;
  var annualLimit = (amountR.value / (11 - pensionReceiptYear)) * 1.2;
  if (receiptR.value > annualLimit) {
    showError('annualReceipt', '연 수령 한도 초과입니다. 연 수령 한도: ' + annualLimit.toFixed(0) + '만원');
    return;
  }

  var tax = calcRetirementTax(amountR.value, yearsR.value, 0);
  var tableData = generateDetailedReceiptTable(
    ageR.value, amountR.value, yearsR.value, receiptR.value, investR.value, tax.taxAmount
  );

  var lastAge = tableData.length > 0 ? tableData[tableData.length - 1].age : ageR.value;
  var lastAgeText = lastAge >= 100 ? '100세 이상' : lastAge + '세';

  document.getElementById('result-content').innerHTML =
    buildResultRow('퇴직금', formatManwon(amountR.value), 'color-yellow') +
    buildResultRow('근속연수', yearsR.value + '년', 'color-blue') +
    buildResultRow('퇴직소득세', formatManwon(tax.taxAmount / 10000), 'color-red') +
    buildResultRow('실효세율', formatPercent(tax.effectiveRate), 'color-purple') +
    buildResultRow('연 수령액', formatManwon(receiptR.value), 'color-orange') +
    buildResultRow('수령 가능 나이', lastAgeText, 'color-red');

  var rows = [];
  for (var i = 0; i < tableData.length; i++) {
    var row = tableData[i];
    rows.push([
      String(row.age),
      String(row.pensionYear),
      String(row.year),
      row.carriedOver.toFixed(0),
      row.principalWithdrawal.toFixed(0),
      row.profitWithdrawal.toFixed(0),
      row.remainingBalance.toFixed(0),
      row.balanceWithProfit.toFixed(0),
      row.tax.toFixed(0),
      row.taxType,
      row.netReceipt.toFixed(0)
    ]);
  }
  document.getElementById('receipt-table').innerHTML = buildTable(
    ['나이', '연금\n수령연차', '퇴직원금\n수령연차', '이월액\n(만원)', '퇴직원금\n출금(만원)', '투자수익\n출금(만원)', '잔금\n(만원)', '잔금+투자수익\n(만원)', '세금\n(만원)', '세금종류', '실수령액\n(만원)'],
    rows,
    { lastYearRow: tableData.length - 1 }
  );

  showElement('result-area');
  showElement('receipt-area');
});
