(function () {
  var navItems = [
    { id: 'home', label: '홈', icon: '🏠', href: 'index.html' },
    { id: 'accounts', label: '연금 계좌', icon: '🏦', href: 'accounts.html' },
    { id: 'calculators', label: '계산기', icon: '🧮', href: 'calculators.html' },
    { id: 'products', label: '투자 상품', icon: '📈', href: 'products.html' },
    { id: 'portfolios', label: '포트폴리오', icon: '🥧', href: 'portfolios.html' }
  ];

  var body = document.body;
  var current = body.getAttribute('data-nav') || 'home';
  var base = body.getAttribute('data-base') || '';

  var nav = document.getElementById('bottom-nav');
  if (!nav) return;

  var html = '';
  for (var i = 0; i < navItems.length; i++) {
    var item = navItems[i];
    var active = item.id === current ? ' active' : '';
    html += '<a class="nav-item' + active + '" href="' + base + item.href + '">';
    html += '<span class="nav-icon-wrap">';
    html += '<span class="nav-icon" aria-hidden="true">' + item.icon + '</span>';
    html += '</span>';
    html += '<span class="nav-label">' + item.label + '</span></a>';
  }
  nav.innerHTML = html;
})();
