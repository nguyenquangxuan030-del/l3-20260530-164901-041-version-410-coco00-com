(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileNavigation() {
    var button = document.querySelector(".mobile-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  function setupGlobalSearch() {
    var input = document.querySelector(".global-search");
    var panel = document.querySelector(".search-panel");
    if (!input || !panel || !Array.isArray(window.SITE_SEARCH_INDEX || SITE_SEARCH_INDEX)) {
      return;
    }
    var data = window.SITE_SEARCH_INDEX || SITE_SEARCH_INDEX;

    function closePanel() {
      panel.classList.remove("open");
      panel.innerHTML = "";
    }

    function render(items) {
      if (!items.length) {
        panel.innerHTML = '<div class="no-results">没有找到匹配内容</div>';
        panel.classList.add("open");
        return;
      }
      panel.innerHTML = items.slice(0, 12).map(function (item) {
        return [
          '<a class="search-result" href="' + item.url + '">',
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">',
          '<div>',
          '<strong>' + escapeHtml(item.title) + '</strong>',
          '<span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.category) + '</span>',
          '</div>',
          '</a>'
        ].join("");
      }).join("");
      panel.classList.add("open");
    }

    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      if (!query) {
        closePanel();
        return;
      }
      var result = data.filter(function (item) {
        var text = [item.title, item.year, item.region, item.genre, item.category, item.oneLine].join(" ").toLowerCase();
        return text.indexOf(query) !== -1;
      });
      render(result);
    });

    document.addEventListener("click", function (event) {
      if (!panel.contains(event.target) && event.target !== input) {
        closePanel();
      }
    });
  }

  function setupPageFilter() {
    var input = document.querySelector(".page-filter");
    if (!input) {
      return;
    }
    var area = document.querySelector(".list-filter-area") || document;
    var cards = Array.prototype.slice.call(area.querySelectorAll(".movie-card"));
    var empty = document.createElement("div");
    empty.className = "no-results";
    empty.textContent = "没有找到匹配内容";

    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year"),
          card.textContent
        ].join(" ").toLowerCase();
        var match = !query || text.indexOf(query) !== -1;
        card.classList.toggle("hidden-by-filter", !match);
        if (match) {
          visible += 1;
        }
      });
      if (!visible && cards.length) {
        if (!empty.parentNode) {
          area.appendChild(empty);
        }
      } else if (empty.parentNode) {
        empty.parentNode.removeChild(empty);
      }
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var playButton = player.querySelector(".player-play");
      var muteButton = player.querySelector(".player-mute");
      var fullButton = player.querySelector(".player-fullscreen");
      var status = player.querySelector(".player-status");
      var stream = video ? video.getAttribute("data-stream") : "";
      var hlsInstance = null;
      var prepared = false;

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function prepare() {
        if (!video || prepared || !stream) {
          return;
        }
        prepared = true;
        setStatus("加载中");
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus("点击播放");
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("视频加载失败");
              if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
              }
              prepared = false;
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          video.addEventListener("loadedmetadata", function () {
            setStatus("点击播放");
          }, { once: true });
        } else {
          setStatus("当前浏览器暂不支持播放");
        }
      }

      function togglePlay() {
        if (!video) {
          return;
        }
        prepare();
        if (video.paused) {
          video.play().catch(function () {
            setStatus("再次点击播放");
          });
        } else {
          video.pause();
        }
      }

      if (playButton) {
        playButton.addEventListener("click", togglePlay);
      }
      if (video) {
        video.addEventListener("click", togglePlay);
        video.addEventListener("play", function () {
          player.classList.add("playing");
          setStatus("播放中");
        });
        video.addEventListener("pause", function () {
          player.classList.remove("playing");
          setStatus("点击播放");
        });
      }
      if (muteButton && video) {
        muteButton.addEventListener("click", function () {
          video.muted = !video.muted;
          muteButton.textContent = video.muted ? "取消静音" : "静音";
        });
      }
      if (fullButton && player) {
        fullButton.addEventListener("click", function () {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (player.requestFullscreen) {
            player.requestFullscreen();
          }
        });
      }
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  ready(function () {
    setupMobileNavigation();
    setupHero();
    setupGlobalSearch();
    setupPageFilter();
    setupPlayers();
  });
})();
