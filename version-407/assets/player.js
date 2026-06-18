(function () {
  var video = document.getElementById('movieVideo');
  var panel = document.getElementById('playerPanel');
  var configElement = document.getElementById('play-config');
  if (!video || !panel || !configElement) {
    return;
  }

  var config = {};
  try {
    config = JSON.parse(configElement.textContent || '{}');
  } catch (error) {
    config = {};
  }

  var streamUrl = config.streamUrl || '';
  var prepared = false;

  function prepare() {
    if (prepared || !streamUrl) {
      return;
    }
    prepared = true;
    video.controls = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function start() {
    prepare();
    panel.classList.add('is-playing');
    var result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(function () {});
    }
  }

  panel.querySelectorAll('[data-play-start]').forEach(function (item) {
    item.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      start();
    });
  });

  video.addEventListener('click', function () {
    if (!prepared) {
      start();
    }
  });
})();
