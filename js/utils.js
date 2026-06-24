function formatManwon(value) {
  return Math.round(value).toLocaleString('ko-KR') + '만원';
}

function formatPercent(value, digits) {
  return value.toFixed(digits || 2) + '%';
}

function parseIntField(value, fieldName) {
  if (value === '' || value === null || value === undefined) {
    return { ok: false, msg: fieldName + '을(를) 입력해주세요' };
  }
  var n = parseInt(value, 10);
  if (isNaN(n) || String(n) !== String(parseFloat(value))) {
    return { ok: false, msg: '올바른 정수를 입력해주세요' };
  }
  return { ok: true, value: n };
}

function parseFloatField(value, fieldName) {
  if (value === '' || value === null || value === undefined) {
    return { ok: false, msg: fieldName + '을(를) 입력해주세요' };
  }
  var n = parseFloat(value);
  if (isNaN(n)) {
    return { ok: false, msg: '올바른 숫자를 입력해주세요' };
  }
  return { ok: true, value: n };
}

function showError(inputId, message) {
  var input = document.getElementById(inputId);
  var err = document.getElementById(inputId + '-error');
  if (input) input.classList.add('error');
  if (err) {
    err.textContent = message;
    err.classList.add('show');
  }
}

function clearErrors(form) {
  var inputs = form.querySelectorAll('input');
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].classList.remove('error');
  }
  var errs = form.querySelectorAll('.error-msg');
  for (var j = 0; j < errs.length; j++) {
    errs[j].classList.remove('show');
    errs[j].textContent = '';
  }
}

function setResultRow(id, value) {
  var el = document.getElementById(id);
  if (el) el.textContent = value;
}

function showElement(id) {
  var el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

function hideElement(id) {
  var el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

function buildResultRow(label, value, colorClass) {
  return '<div class="result-row"><span>' + label + '</span><span class="value ' + (colorClass || '') + '">' + value + '</span></div>';
}

function buildTable(headers, rows, options) {
  options = options || {};
  var html = '<div class="table-wrap"><table class="data-table"><thead><tr>';
  for (var h = 0; h < headers.length; h++) {
    html += '<th>' + headers[h] + '</th>';
  }
  html += '</tr></thead><tbody>';
  for (var r = 0; r < rows.length; r++) {
    var cls = '';
    if (options.highlightRow === r) cls = ' class="highlight"';
    if (options.lastYearRow === r) cls = ' class="last-year"';
    html += '<tr' + cls + '>';
    for (var c = 0; c < rows[r].length; c++) {
      html += '<td>' + rows[r][c] + '</td>';
    }
    html += '</tr>';
  }
  html += '</tbody></table></div>';
  return html;
}
