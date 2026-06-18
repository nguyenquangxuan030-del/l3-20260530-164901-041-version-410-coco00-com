(function() {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');
    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function() {
            var open = mobileNav.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('[data-hero-slider]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var current = 0;
        var show = function(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle('active', i === current);
            });
        };
        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                show(Number(dot.getAttribute('data-slide')) || 0);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function() {
                show(current + 1);
            }, 5200);
        }
    }

    var searchPanel = document.querySelector('[data-search-panel]');
    if (searchPanel) {
        var input = document.querySelector('[data-search-input]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-grid] .movie-card'));
        var empty = document.querySelector('[data-empty-state]');
        var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
        var activeFilter = 'all';
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (input) {
            input.value = initial;
        }
        var apply = function() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var shown = 0;
            cards.forEach(function(card) {
                var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                var category = card.getAttribute('data-category') || '';
                var matchesText = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesFilter = activeFilter === 'all' || category === activeFilter;
                var visible = matchesText && matchesFilter;
                card.classList.toggle('is-hidden', !visible);
                if (visible) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('visible', shown === 0);
            }
        };
        if (input) {
            input.addEventListener('input', apply);
        }
        buttons.forEach(function(button) {
            button.addEventListener('click', function() {
                activeFilter = button.getAttribute('data-filter') || 'all';
                buttons.forEach(function(item) {
                    item.classList.toggle('active', item === button);
                });
                apply();
            });
        });
        var clear = document.querySelector('[data-clear-search]');
        if (clear && input) {
            clear.addEventListener('click', function() {
                input.value = '';
                activeFilter = 'all';
                buttons.forEach(function(item) {
                    item.classList.toggle('active', item.getAttribute('data-filter') === 'all');
                });
                apply();
            });
        }
        apply();
    }

    var shells = Array.prototype.slice.call(document.querySelectorAll('.video-shell'));
    shells.forEach(function(shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('.video-cover-button');
        var loaded = false;
        var start = function() {
            if (!video) {
                return;
            }
            var stream = video.getAttribute('data-stream');
            if (!stream) {
                return;
            }
            if (!loaded) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls();
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
                loaded = true;
            }
            shell.classList.add('is-playing');
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function() {});
            }
        };
        if (button) {
            button.addEventListener('click', start);
        }
        if (video) {
            video.addEventListener('click', function() {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener('play', function() {
                shell.classList.add('is-playing');
            });
        }
    });
})();
