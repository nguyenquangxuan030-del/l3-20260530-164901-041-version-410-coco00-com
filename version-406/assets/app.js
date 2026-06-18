(function () {
  const menuButton = document.querySelector('[data-open-menu]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;
    let timer = null;

    const setSlide = function (next) {
      current = (next + slides.length) % slides.length;
      slides.forEach(function (slide, index) {
        slide.classList.toggle('active', index === current);
      });
      dots.forEach(function (dot) {
        dot.classList.toggle('active', Number(dot.getAttribute('data-hero-dot')) === current);
      });
    };

    const play = function () {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        setSlide(current + 1);
      }, 5200);
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setSlide(Number(dot.getAttribute('data-hero-dot')));
        play();
      });
    });

    if (slides.length > 1) {
      play();
    }
  }

  const lists = Array.from(document.querySelectorAll('[data-card-list]'));

  lists.forEach(function (list) {
    const scope = list.closest('section') || document;
    const search = scope.querySelector('[data-search]');
    const year = scope.querySelector('[data-year-filter]');
    const empty = scope.querySelector('[data-empty-state]');
    const cards = Array.from(list.querySelectorAll('.movie-card'));
    const viewButtons = Array.from(scope.querySelectorAll('[data-view]'));

    const normalize = function (value) {
      return String(value || '').toLowerCase().trim();
    };

    const apply = function () {
      const query = normalize(search ? search.value : '');
      const selectedYear = year ? year.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));
        const cardYear = card.getAttribute('data-year') || '';
        const matchedText = !query || haystack.indexOf(query) !== -1;
        const matchedYear = !selectedYear || cardYear === selectedYear;
        const show = matchedText && matchedYear;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    };

    if (search) {
      const params = new URLSearchParams(window.location.search);
      const initial = params.get('q');
      if (initial) {
        search.value = initial;
      }
      search.addEventListener('input', apply);
    }

    if (year) {
      year.addEventListener('change', apply);
    }

    viewButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        const view = button.getAttribute('data-view');
        list.classList.toggle('list-view', view === 'list');
        viewButtons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
      });
    });

    apply();
  });
})();
