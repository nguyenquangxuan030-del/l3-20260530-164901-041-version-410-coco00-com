(function () {
    function select(selector, root) {
        return (root || document).querySelector(selector);
    }

    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initMenu() {
        var header = select('.site-header');
        var toggle = select('.nav-toggle');
        if (!header || !toggle) {
            return;
        }
        toggle.addEventListener('click', function () {
            header.classList.toggle('nav-open');
        });
    }

    function initHero() {
        var slider = select('.hero-slider');
        if (!slider) {
            return;
        }
        var slides = selectAll('.hero-slide', slider);
        var dots = selectAll('.hero-dot', slider);
        var next = select('.hero-next', slider);
        var prev = select('.hero-prev', slider);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
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
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        var input = select('.filter-input');
        var cards = selectAll('.movie-card[data-title]');
        var chips = selectAll('.filter-chip[data-filter-value]');
        if (!input && cards.length === 0) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        var activeValue = 'all';
        if (input && query) {
            input.value = query;
        }

        function cardText(card) {
            return normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.getAttribute('data-kind')
            ].join(' '));
        }

        function apply() {
            var keyword = normalize(input ? input.value : '');
            cards.forEach(function (card) {
                var text = cardText(card);
                var chipMatched = activeValue === 'all' || text.indexOf(activeValue) !== -1;
                var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
                card.classList.toggle('is-hidden', !(chipMatched && keywordMatched));
            });
        }

        if (input) {
            input.addEventListener('input', apply);
            apply();
        }
        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (item) {
                    item.classList.remove('is-active');
                });
                chip.classList.add('is-active');
                activeValue = normalize(chip.getAttribute('data-filter-value'));
                apply();
            });
        });
    }

    function initPlayer() {
        var meta = select('meta[name="video:stream"]');
        var video = select('.video-player');
        var overlay = select('.player-overlay');
        if (!meta || !video || !overlay) {
            return;
        }
        var mounted = false;
        var hls = null;

        function mount() {
            if (mounted) {
                return;
            }
            var streamUrl = meta.getAttribute('content');
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            mounted = true;
        }

        function play() {
            mount();
            overlay.classList.add('is-hidden');
            video.setAttribute('controls', 'controls');
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    video.setAttribute('controls', 'controls');
                });
            }
        }

        overlay.addEventListener('click', function (event) {
            event.preventDefault();
            play();
        });
        video.addEventListener('click', function () {
            if (!mounted) {
                play();
                return;
            }
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
        initPlayer();
    });
}());
