(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    show(0);
    start();
  });

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (panel) {
    var section = panel.parentElement;
    var input = panel.querySelector('.page-filter-input');
    var select = panel.querySelector('.page-filter-year');
    var list = section ? section.querySelector('.filter-list') : null;
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-card')) : [];
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    if (input && initial) {
      input.value = initial;
    }

    function apply() {
      var keyword = normalize(input ? input.value : '');
      var year = select ? select.value : '';
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year')
        ].join(' '));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !year || card.getAttribute('data-year') === year;
        card.classList.toggle('hidden-by-filter', !(matchKeyword && matchYear));
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    if (select) {
      select.addEventListener('change', apply);
    }

    apply();
  });
})();
