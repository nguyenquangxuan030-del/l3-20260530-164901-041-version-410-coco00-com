(function () {
  function attachStream(video, streamUrl) {
    if (video.getAttribute('data-ready') === '1') {
      return;
    }

    video.setAttribute('data-ready', '1');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          try {
            hls.destroy();
          } catch (error) {}
          video.removeAttribute('data-ready');
          video.src = streamUrl;
        }
      });
      return;
    }

    video.src = streamUrl;
  }

  window.startMoviePlayer = function (streamUrl) {
    var video = document.getElementById('movie-video');
    var layer = document.querySelector('[data-play-layer]');
    var state = document.querySelector('[data-video-state]');
    var started = false;

    if (!video || !layer || !streamUrl) {
      return;
    }

    function begin() {
      attachStream(video, streamUrl);
      started = true;
      layer.classList.add('is-hidden');

      if (state) {
        state.textContent = '加载中…';
      }

      video.play().catch(function () {
        if (!video.paused) {
          return;
        }
        layer.classList.remove('is-hidden');
        if (state) {
          state.textContent = '点击播放';
        }
      });
    }

    layer.addEventListener('click', begin);

    video.addEventListener('click', function () {
      if (video.paused) {
        begin();
      }
    });

    video.addEventListener('canplay', function () {
      if (started && video.paused) {
        video.play().catch(function () {});
      }
    });

    video.addEventListener('play', function () {
      layer.classList.add('is-hidden');
    });

    video.addEventListener('error', function () {
      if (state) {
        state.textContent = '请稍后重试';
      }
      layer.classList.remove('is-hidden');
    });
  };
})();
