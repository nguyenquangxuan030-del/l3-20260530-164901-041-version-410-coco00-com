(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var isOpen = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", String(isOpen));
        });
    }

    function setupHeroCarousel() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dotsWrap = carousel.querySelector("[data-hero-dots]");
        if (!slides.length || !dotsWrap) {
            return;
        }
        var current = 0;
        var dots = slides.map(function (_, index) {
            var dot = document.createElement("button");
            dot.type = "button";
            dot.setAttribute("aria-label", "切换到第 " + (index + 1) + " 张推荐");
            dot.addEventListener("click", function () {
                show(index);
            });
            dotsWrap.appendChild(dot);
            return dot;
        });
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        show(0);
        window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var container = panel.parentElement;
            if (!container) {
                return;
            }
            var cards = Array.prototype.slice.call(container.querySelectorAll("[data-movie-card]"));
            var searchInput = panel.querySelector("[data-filter-search]");
            var typeSelect = panel.querySelector("[data-filter-type]");
            var regionSelect = panel.querySelector("[data-filter-region]");
            var yearSelect = panel.querySelector("[data-filter-year]");
            var count = panel.querySelector("[data-result-count]");
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || "";
            if (searchInput && initialQuery) {
                searchInput.value = initialQuery;
            }
            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }
            function apply() {
                var query = normalize(searchInput && searchInput.value);
                var type = normalize(typeSelect && typeSelect.value);
                var region = normalize(regionSelect && regionSelect.value);
                var year = normalize(yearSelect && yearSelect.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.category,
                        card.dataset.tags,
                        card.textContent
                    ].join(" "));
                    var isMatch = true;
                    if (query && haystack.indexOf(query) === -1) {
                        isMatch = false;
                    }
                    if (type && normalize(card.dataset.type) !== type) {
                        isMatch = false;
                    }
                    if (region && normalize(card.dataset.region) !== region) {
                        isMatch = false;
                    }
                    if (year && normalize(card.dataset.year) !== year) {
                        isMatch = false;
                    }
                    card.classList.toggle("is-hidden", !isMatch);
                    if (isMatch) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = visible + " 个结果";
                }
            }
            [searchInput, typeSelect, regionSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function setupPlayer() {
        var frame = document.querySelector("[data-player-frame]");
        var video = frame ? frame.querySelector("video[data-src]") : null;
        var playButton = frame ? frame.querySelector("[data-play-button]") : null;
        if (!frame || !video) {
            return;
        }
        var hlsInstance = null;
        var isLoaded = false;
        function loadSource() {
            if (isLoaded) {
                return;
            }
            isLoaded = true;
            var source = video.dataset.src;
            if (!source) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
                    if (!data || !data.fatal || !hlsInstance) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        hlsInstance.destroy();
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else {
                video.src = source;
            }
        }
        function startPlayback() {
            loadSource();
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    video.controls = true;
                });
            }
        }
        if (playButton) {
            playButton.addEventListener("click", startPlayback);
        }
        frame.addEventListener("click", function (event) {
            if (event.target === video) {
                return;
            }
            if (!frame.classList.contains("is-playing")) {
                startPlayback();
            }
        });
        video.addEventListener("play", function () {
            frame.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
            frame.classList.remove("is-playing");
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    function setupShareButton() {
        var button = document.querySelector("[data-share-button]");
        if (!button) {
            return;
        }
        button.addEventListener("click", function () {
            var url = window.location.href;
            function copied() {
                button.classList.add("is-copied");
                button.textContent = "已复制";
                window.setTimeout(function () {
                    button.classList.remove("is-copied");
                    button.textContent = "分享";
                }, 1800);
            }
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(copied).catch(copied);
            } else {
                copied();
            }
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHeroCarousel();
        setupFilters();
        setupPlayer();
        setupShareButton();
    });
})();
