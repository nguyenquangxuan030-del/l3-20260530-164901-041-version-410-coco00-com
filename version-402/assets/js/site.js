(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    document.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('is-muted');
        img.removeAttribute('src');
      });
    });

    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        var isOpen = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!isOpen));
        panel.hidden = isOpen;
      });
    }

    document.querySelectorAll('.site-search').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        if (!value) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(value);
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (slides.length > 1) {
      var current = 0;
      var showSlide = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      };
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          showSlide(dotIndex);
        });
      });
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    document.querySelectorAll('input[data-filter-input]').forEach(function (input) {
      if (q && input.closest('[data-search-page]')) {
        input.value = q;
      }
    });

    var filterGroups = Array.prototype.slice.call(document.querySelectorAll('[data-filter-group]'));
    filterGroups.forEach(function (group) {
      var input = group.querySelector('input[data-filter-input]');
      var chips = Array.prototype.slice.call(group.querySelectorAll('[data-filter]'));
      var cards = Array.prototype.slice.call(group.querySelectorAll('.movie-card, .rank-row'));
      var empty = group.querySelector('.empty-state');
      var activeFilter = '';

      function applyFilter() {
        var term = input ? input.value.trim().toLowerCase() : '';
        var visible = 0;
        cards.forEach(function (card) {
          var keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
          var matchedText = !term || keywords.indexOf(term) !== -1;
          var matchedChip = !activeFilter || keywords.indexOf(activeFilter.toLowerCase()) !== -1;
          var show = matchedText && matchedChip;
          card.style.display = show ? '' : 'none';
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', applyFilter);
      }

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          chips.forEach(function (other) {
            other.classList.remove('is-active');
          });
          chip.classList.add('is-active');
          activeFilter = chip.getAttribute('data-filter') || '';
          applyFilter();
        });
      });

      applyFilter();
    });

    document.querySelectorAll('.video-shell').forEach(function (shell) {
      var video = shell.querySelector('video');
      var layer = shell.querySelector('.play-layer');
      if (!video || !layer) {
        return;
      }
      var streamUrl = layer.getAttribute('data-stream') || '';
      var started = false;
      var hlsInstance = null;

      function startVideo() {
        if (!streamUrl) {
          return;
        }
        layer.classList.add('is-hidden');
        video.controls = true;
        if (started) {
          video.play().catch(function () {});
          return;
        }
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
          video.play().catch(function () {});
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          return;
        }
        video.src = streamUrl;
        video.play().catch(function () {});
      }

      layer.addEventListener('click', startVideo);
      video.addEventListener('click', function () {
        if (!started) {
          startVideo();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
