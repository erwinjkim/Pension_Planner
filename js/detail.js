function renderSectionBlock(sec, extraClass) {
  var cls = 'card detail-section' + (extraClass ? ' ' + extraClass : '');
  var html = '<div class="' + cls + '"><h3>' + sec.title + '</h3><ul>';
  for (var j = 0; j < sec.bullets.length; j++) {
    html += '<li>' + sec.bullets[j] + '</li>';
  }
  html += '</ul></div>';
  return html;
}

function renderAfterNote(note) {
  if (!note) return '';
  var html = '<div class="regulation-note">';
  if (note.title) html += '<h4>' + note.title + '</h4>';
  html += '<p>' + note.text.replace(/\n/g, '<br>') + '</p>';
  html += '</div>';
  return html;
}

function renderDetailPage(pageId) {
  var data = DETAIL_PAGES[pageId];
  if (!data) return;

  document.title = '퇴직연금 플래너 - ' + data.appBarTitle;
  var container = document.getElementById('detail-content');
  if (!container) return;

  var html = '';

  if (!data.hideHeader) {
    html += '<div class="card card-header">';
    html += '<div class="big-icon">' + (data.emoji || '📄') + '</div>';
    html += '<h2>' + data.title.replace(/\n/g, '<br>') + '</h2>';
    if (data.subtitle) html += '<p>' + data.subtitle + '</p>';
    html += '</div>';
  }

  if (data.sections) {
    for (var i = 0; i < data.sections.length; i++) {
      html += renderSectionBlock(data.sections[i]);
    }
  }

  if (data.comingSoon) {
    html += '<div class="card coming-soon-card"><p>' + data.comingSoon + '</p></div>';
  }

  if (data.tables) {
    for (var t = 0; t < data.tables.length; t++) {
      var tbl = data.tables[t];
      html += '<div class="card detail-section"><h3>' + tbl.title + '</h3>';
      html += buildTable(tbl.headers, tbl.rows);
      html += renderAfterNote(tbl.afterNote);
      html += '</div>';
    }
  }

  if (data.footerSections) {
    for (var f = 0; f < data.footerSections.length; f++) {
      var footer = data.footerSections[f];
      var footerClass = footer.title === '투자 시 주의사항' ? 'warning-card' : '';
      html += renderSectionBlock(footer, footerClass);
    }
  }

  if (!data.comingSoon) {
    html += '<p class="disclaimer">※ 본 내용은 참고용이며, 실제 제도·세법과 다를 수 있습니다.</p>';
  }
  container.innerHTML = html;
}

(function () {
  var pageId = document.body.getAttribute('data-page');
  if (pageId) renderDetailPage(pageId);
})();
