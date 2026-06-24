function calcYearsOfServiceDeduction(years) {
  if (years <= 5) return years * 1000000;
  if (years <= 10) return 5000000 + (years - 5) * 2000000;
  if (years <= 20) return 15000000 + (years - 10) * 2500000;
  return 40000000 + (years - 20) * 3000000;
}

function calcConvertedIncomeDeduction(convertedIncome) {
  if (convertedIncome <= 8000000) return convertedIncome;
  if (convertedIncome <= 70000000) return 8000000 + (convertedIncome - 8000000) * 0.6;
  if (convertedIncome <= 100000000) return 45200000 + (convertedIncome - 70000000) * 0.55;
  if (convertedIncome <= 300000000) return 61700000 + (convertedIncome - 100000000) * 0.45;
  return 151700000 + (convertedIncome - 300000000) * 0.35;
}

function calcConvertedTax(taxableBase) {
  if (taxableBase <= 14000000) return taxableBase * 0.06;
  if (taxableBase <= 50000000) return taxableBase * 0.15 - 1260000;
  if (taxableBase <= 88000000) return taxableBase * 0.24 - 5760000;
  if (taxableBase <= 150000000) return taxableBase * 0.35 - 15440000;
  if (taxableBase <= 300000000) return taxableBase * 0.38 - 19940000;
  if (taxableBase <= 500000000) return taxableBase * 0.40 - 25940000;
  if (taxableBase <= 1000000000) return taxableBase * 0.42 - 35940000;
  return taxableBase * 0.45 - 65940000;
}

function calcRetirementTax(retirementAmountMan, yearsOfService, nonTaxableMan) {
  var benefit = retirementAmountMan * 10000;
  var nonTaxable = (nonTaxableMan || 0) * 10000;
  var incomeAmount = benefit - nonTaxable;
  var serviceDeduction = calcYearsOfServiceDeduction(yearsOfService);
  var adjusted = Math.max(incomeAmount - serviceDeduction, 0);
  var convertedIncome = adjusted * 12 / yearsOfService;
  var convertedDeduction = calcConvertedIncomeDeduction(convertedIncome);
  var taxableBase = convertedIncome - convertedDeduction;
  var convertedTax = calcConvertedTax(taxableBase);
  var finalTax = convertedTax / 12 * yearsOfService;
  return {
    taxAmount: finalTax,
    effectiveRate: benefit > 0 ? (finalTax / benefit) * 100 : 0,
    retirementBenefit: benefit,
    retirementIncomeAmount: incomeAmount,
    yearsOfServiceDeduction: serviceDeduction,
    convertedIncome: convertedIncome,
    convertedIncomeDeduction: convertedDeduction,
    taxableBase: taxableBase,
    convertedCalculatedTax: convertedTax,
    finalTaxAmount: finalTax
  };
}

function calcRetirementTaxDetailed(retirementBenefitMan, yearsOfService, nonTaxableMan) {
  var benefit = retirementBenefitMan * 10000;
  var nonTaxable = (nonTaxableMan || 0) * 10000;
  var incomeAmount = benefit - nonTaxable;
  var serviceDeduction = calcYearsOfServiceDeduction(yearsOfService);
  var adjusted = Math.max(incomeAmount - serviceDeduction, 0);
  var convertedIncome = adjusted * 12 / yearsOfService;
  var convertedDeduction = calcConvertedIncomeDeduction(convertedIncome);
  var taxableBase = convertedIncome - convertedDeduction;
  var convertedTax = calcConvertedTax(taxableBase);
  var finalTax = convertedTax / 12 * yearsOfService;
  return {
    retirementBenefit: benefit,
    retirementIncomeAmount: incomeAmount,
    yearsOfServiceDeduction: serviceDeduction,
    convertedIncome: convertedIncome,
    convertedIncomeDeduction: convertedDeduction,
    taxableBase: taxableBase,
    convertedCalculatedTax: convertedTax,
    finalTaxAmount: finalTax,
    effectiveRate: benefit > 0 ? (finalTax / benefit) * 100 : 0,
    netReceipt: benefit - finalTax
  };
}

function toManwon(won) {
  return (won / 10000).toFixed(0);
}
