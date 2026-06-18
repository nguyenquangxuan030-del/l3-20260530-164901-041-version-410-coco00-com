(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = qs('[data-menu-toggle]');
  var menu = qs('[data-mobile-menu]');
  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var hero = qs('[data-hero]');
  if (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var thumbs = qsa('[data-hero-thumb]', hero);
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('is-active', i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    thumbs.forEach(function (thumb, i) {
      thumb.addEventListener('mouseenter', function () {
        show(i);
        restart();
      });
    });

    if (slides.length > 1) {
      restart();
    }
  }

  qsa('[data-filter-form]').forEach(function (form) {
    var input = qs('[data-filter-input]', form);
    var list = qs('[data-filter-list]');
    var selects = qsa('[data-filter-select]', form);
    if (!list) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input && query) {
      input.value = query;
    }

    function filter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var active = {};
      selects.forEach(function (select) {
        active[select.getAttribute('data-filter-select')] = select.value;
      });
      qsa('.movie-card', list).forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();
        var ok = !keyword || text.indexOf(keyword) !== -1;
        Object.keys(active).forEach(function (key) {
          if (active[key]) {
            ok = ok && (card.getAttribute('data-' + key) || '').indexOf(active[key]) !== -1;
          }
        });
        card.classList.toggle('is-hidden', !ok);
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      filter();
    });
    if (input) {
      input.addEventListener('input', filter);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', filter);
    });
    filter();
  });

  qsa('[data-player]').forEach(function (shell) {
    var video = qs('video', shell);
    var button = qs('[data-play-button]', shell);
    if (!video || !button) {
      return;
    }

    var stream = video.getAttribute('data-stream');
    var prepared = false;

    function prepare() {
      if (prepared || !stream) {
        return;
      }
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function play() {
      prepare();
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    button.addEventListener('click', function (event) {
      event.preventDefault();
      play();
    });

    shell.addEventListener('click', function (event) {
      if (event.target === video) {
        return;
      }
      play();
    });

    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        button.classList.remove('is-hidden');
      }
    });

    video.addEventListener('ended', function () {
      button.classList.remove('is-hidden');
    });
  });
})();
