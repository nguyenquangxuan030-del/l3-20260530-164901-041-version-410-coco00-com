(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-main-nav]');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    var activate = function (next) {
      if (!slides.length) {
        return;
      }

      index = (next + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activate(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    setInterval(function () {
      activate(index + 1);
    }, 5600);
  }

  var syncInput = document.querySelector('[data-query-sync]');
  var filterInput = document.querySelector('[data-filter-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  var applyFilter = function (value) {
    var query = String(value || '').trim().toLowerCase();

    cards.forEach(function (card) {
      var haystack = String(card.getAttribute('data-search') || '').toLowerCase();
      card.classList.toggle('is-hidden', query !== '' && haystack.indexOf(query) === -1);
    });
  };

  if (syncInput) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    syncInput.value = query;
    applyFilter(query);
  }

  if (filterInput) {
    filterInput.addEventListener('input', function () {
      applyFilter(filterInput.value);
    });
  }
})();
