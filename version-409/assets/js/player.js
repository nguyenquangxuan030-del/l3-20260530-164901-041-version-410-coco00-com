(function () {
  var shells = Array.prototype.slice.call(document.querySelectorAll('.video-shell'));

  shells.forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-layer');

    if (!video || !button) {
      return;
    }

    var stream = video.getAttribute('data-stream');
    var loaded = false;

    var loadStream = function () {
      if (loaded || !stream) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(stream);
        hls.attachMedia(video);
        video.hlsInstance = hls;
        return;
      }

      video.src = stream;
    };

    var start = function () {
      loadStream();
      shell.classList.add('is-playing');

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    };

    button.addEventListener('click', start);

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        shell.classList.remove('is-playing');
      }
    });
  });
})();
