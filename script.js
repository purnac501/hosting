(function () {

  // --- Site base path (from layout). "" locally / on custom domains,
  // --- "/repository-name" on a GitHub Pages project site.
  var baseMeta = document.querySelector('meta[name="site-base"]');
  var BASE = baseMeta && baseMeta.getAttribute('content') !== '/'
    ? baseMeta.getAttribute('content').replace(/\/$/, '')
    : '';

  function baseUrl(path) {
    return BASE + '/' + path;
  }

  // --- Live Clock ---
  function updateClock() {
    var now = new Date();
    var h = String(now.getHours()).padStart(2, '0');
    var m = String(now.getMinutes()).padStart(2, '0');
    var s = String(now.getSeconds()).padStart(2, '0');
    var el = document.getElementById('live-clock');
    if (el) el.textContent = h + ':' + m + ':' + s;
  }
  updateClock();
  setInterval(updateClock, 1000);

  // --- Visitor count ---
  // Counts page views in THIS browser only (localStorage). It is a toy,
  // not a real site-wide counter, and it is labeled as such.
  var countEl = document.getElementById('visitor-count');
  if (countEl) {
    var count = localStorage.getItem('piggii_visits');
    count = count === null ? 42 : parseInt(count, 10) + 1;
    localStorage.setItem('piggii_visits', count);
    countEl.textContent = String(count).padStart(6, '0');
  }

  // --- Music Player ---
  var tracks = [
    { file: "01_cm_song.mp3", name: "\u8d85\u6642\u7a7a\u98ef\u5e97 \u5a18\u3005 CM\u30bd\u30f3\u30b0", artist: "Unknown" },
    { file: "02_love_and_joy.mp3", name: "LOVE & JOY", artist: "\u6728\u6751\u7531\u59ec" },
    { file: "03_kerodestiny.mp3", name: "\u30b1\u30ed\u2468destiny", artist: "Silver Forest" },
    { file: "04_true_my_heart.mp3", name: "True my heart", artist: "Nursery Rhyme" },
    { file: "05_kokoro.mp3", name: "\u30b3\u30b3\u30ed", artist: "Toraboruta-P feat. \u93e1\u97f3\u30ea\u30f3" },
    { file: "06_sakuranbo.mp3", name: "Sakuranbo", artist: "Otsuka Ai" },
    { file: "07_love_shine.mp3", name: "LOVE\u2665SHINE", artist: "\u5c0f\u5742\u308a\u3086" },
    { file: "08_only_my_railgun.mp3", name: "only my railgun", artist: "fripSide" },
    { file: "09_marisa_stole.mp3", name: "Marisa Stole The Precious Thing", artist: "IOSYS" },
    { file: "10_migi_kata_no_cho.mp3", name: "\u53f3\u80a9\u306e\u8776", artist: "Nori-P" },
    { file: "11_kokoro_no_tamago.mp3", name: "\u3053\u3053\u308d\u306e\u305f\u307e\u3054", artist: "Buono!" },
    { file: "12_melt.mp3", name: "melt", artist: "supercell feat. \u521d\u97f3\u30df\u30af" },
    { file: "13_seikan_hikou.mp3", name: "Seikan Hikou", artist: "Megumi Nakajima" }
  ];

  var audio = new Audio();
  var currentTrack = -1;
  var isPlaying = false;
  var hasStarted = false;
  var pendingSeek = 0;

  var trackNameEl = document.getElementById('player-track-name');
  var trackArtistEl = document.getElementById('player-track-artist');
  var playBtn = document.getElementById('btn-play');
  var prevBtn = document.getElementById('btn-prev');
  var nextBtn = document.getElementById('btn-next');
  var progressBar = document.getElementById('player-progress-bar');
  var progressWrap = document.getElementById('player-progress');
  var timeCurrent = document.getElementById('player-time-current');
  var timeTotal = document.getElementById('player-time-total');
  var volumeSlider = document.getElementById('player-volume');
  var trackListEl = document.getElementById('track-list');

  function formatTime(secs) {
    if (isNaN(secs) || secs < 0) return "0:00";
    var m = Math.floor(secs / 60);
    var s = Math.floor(secs % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function loadTrack(index, resumePos) {
    if (index < 0 || index >= tracks.length) return;
    currentTrack = index;
    pendingSeek = resumePos || 0;
    audio.src = baseUrl("assets/tracks/" + tracks[index].file);
    audio.load();
    if (trackNameEl) trackNameEl.textContent = tracks[index].name;
    if (trackArtistEl) trackArtistEl.textContent = tracks[index].artist;
    updateTrackList();
  }

  // Jump back to the saved position once the file is ready
  audio.addEventListener('loadedmetadata', function () {
    if (pendingSeek > 0 && audio.duration && pendingSeek < audio.duration - 1) {
      audio.currentTime = pendingSeek;
    }
    pendingSeek = 0;
  });

  // --- Remember where the listener was (same track + position on
  // --- every page, instead of a different random song per page).
  function savePlayerState() {
    if (currentTrack < 0) return;
    try {
      localStorage.setItem('piggii_player', JSON.stringify({
        track: currentTrack,
        pos: Math.floor(audio.currentTime || 0)
      }));
    } catch (e) { /* storage unavailable, no big deal */ }
  }

  function restorePlayerState() {
    try {
      var raw = localStorage.getItem('piggii_player');
      if (!raw) return null;
      var s = JSON.parse(raw);
      if (typeof s.track !== 'number' || s.track < 0 || s.track >= tracks.length) return null;
      return s;
    } catch (e) {
      return null;
    }
  }

  // --- Track list (click a title to play it) ---
  function buildTrackList() {
    if (!trackListEl) return;
    tracks.forEach(function (track, i) {
      var li = document.createElement('li');
      li.textContent = (i + 1) + ". " + track.name;
      li.addEventListener('click', function () {
        loadTrack(i);
        hasStarted = true;
        audio.play();
      });
      trackListEl.appendChild(li);
    });
  }

  function updateTrackList() {
    if (!trackListEl) return;
    var items = trackListEl.children;
    for (var i = 0; i < items.length; i++) {
      items[i].className = i === currentTrack ? 'active' : '';
    }
  }

  buildTrackList();

  function togglePlay() {
    if (!hasStarted) {
      hasStarted = true;
      if (currentTrack < 0) {
        var rand = Math.floor(Math.random() * tracks.length);
        loadTrack(rand);
      }
    }
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }

  function updatePlayButton() {
    if (!playBtn) return;
    var img = playBtn.querySelector('img');
    if (img) {
      img.src = baseUrl(audio.paused ? "assets/icon_play.png" : "assets/icon_pause.png");
      img.alt = audio.paused ? "Play" : "Pause";
    }
  }

  function prevTrack() {
    if (currentTrack > 0) {
      loadTrack(currentTrack - 1);
    } else {
      loadTrack(tracks.length - 1);
    }
    if (isPlaying) audio.play();
  }

  function nextTrack() {
    if (currentTrack < tracks.length - 1) {
      loadTrack(currentTrack + 1);
    } else {
      loadTrack(0);
    }
    if (isPlaying) audio.play();
  }

  var DEFAULT_VOLUME = 0.15; // gentle default so opening the site is not deafening
  if (volumeSlider) {
    var savedVol = localStorage.getItem('piggii_volume');
    if (savedVol !== null) {
      volumeSlider.value = savedVol;
    }
    audio.volume = parseFloat(volumeSlider.value);
    volumeSlider.addEventListener('input', function () {
      audio.volume = parseFloat(this.value);
      localStorage.setItem('piggii_volume', this.value);
    });
  } else {
    // Post pages have no visible player; keep the saved volume anyway
    var storedVol = localStorage.getItem('piggii_volume');
    audio.volume = storedVol !== null ? parseFloat(storedVol) : DEFAULT_VOLUME;
  }

  // --- Starting the music ---
  // Browsers only allow sound after a user gesture, so the splash
  // screen collects that click once per session. On later pages we
  // try to resume; if the browser refuses, the player just sits
  // paused at the right spot until Play is pressed.
  function startPlayback() {
    if (hasStarted) return;
    hasStarted = true;
    var saved = restorePlayerState();
    if (saved) {
      loadTrack(saved.track, saved.pos);
    } else {
      loadTrack(Math.floor(Math.random() * tracks.length));
    }
    var playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(function () { /* blocked, Play button works */ });
    }
  }

  (function initEnterGate() {
    var gate = document.getElementById('enter-gate');
    var entered = false;
    try { entered = sessionStorage.getItem('piggii_entered') === '1'; } catch (e) {}

    if (!gate || entered) {
      if (gate && gate.parentNode) gate.parentNode.removeChild(gate);
      startPlayback();
      return;
    }

    function enter() {
      try { sessionStorage.setItem('piggii_entered', '1'); } catch (e) { }
      gate.classList.add('gate-leave');
      setTimeout(function () {
        if (gate.parentNode) gate.parentNode.removeChild(gate);
      }, 450);
      startPlayback();
    }

    gate.addEventListener('click', enter);
    gate.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') enter();
    });
  })();

  // Player events
  if (playBtn) playBtn.addEventListener('click', togglePlay);
  if (prevBtn) prevBtn.addEventListener('click', prevTrack);
  if (nextBtn) nextBtn.addEventListener('click', nextTrack);

  audio.addEventListener('play', function () {
    isPlaying = true;
    updatePlayButton();
  });

  audio.addEventListener('pause', function () {
    isPlaying = false;
    updatePlayButton();
    savePlayerState();
  });

  window.addEventListener('pagehide', savePlayerState);

  audio.addEventListener('ended', function () {
    if (currentTrack < tracks.length - 1) {
      loadTrack(currentTrack + 1);
    } else {
      loadTrack(0);
    }
    audio.play();
  });

  var lastStateSave = 0;
  audio.addEventListener('timeupdate', function () {
    if (progressBar && audio.duration) {
      progressBar.style.width = (audio.currentTime / audio.duration * 100) + '%';
    }
    if (timeCurrent) timeCurrent.textContent = formatTime(audio.currentTime);
    if (timeTotal && audio.duration) timeTotal.textContent = formatTime(audio.duration);
    // Persist the listening position (throttled) so other pages resume it
    var now = Date.now();
    if (isPlaying && now - lastStateSave > 2000) {
      lastStateSave = now;
      savePlayerState();
    }
  });

  if (progressWrap) {
    progressWrap.addEventListener('click', function (e) {
      if (!audio.duration) return;
      var rect = progressWrap.getBoundingClientRect();
      var pct = (e.clientX - rect.left) / rect.width;
      audio.currentTime = pct * audio.duration;
    });
  }

  // Keyboard shortcut: Space to toggle play
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (document.getElementById('enter-gate')) return; // gate handles Space itself
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      togglePlay();
    }
  });

  // --- Service worker (PWA install + offline reads) ---
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(function () {
      // No SW is fine (http:// local dev, old browsers).
    });
  }

  // --- Light / Dark Mode Toggle ---
  var themeToggleBtn = document.getElementById('theme-toggle');
  var themeIcon = document.getElementById('theme-icon');

  function isDarkActive() {
    if (document.documentElement.classList.contains('dark-theme')) return true;
    if (document.documentElement.classList.contains('light-theme')) return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function updateThemeUI() {
    var dark = isDarkActive();
    if (themeIcon) {
      themeIcon.textContent = dark ? '☀️' : '🌙';
    }
    if (themeToggleBtn) {
      var label = dark ? 'Switch to Light mode' : 'Switch to Dark mode';
      themeToggleBtn.setAttribute('title', label);
      themeToggleBtn.setAttribute('aria-label', label);
    }
  }

  if (themeToggleBtn) {
    updateThemeUI();
    themeToggleBtn.addEventListener('click', function () {
      var dark = isDarkActive();
      if (dark) {
        document.documentElement.classList.remove('dark-theme');
        document.documentElement.classList.add('light-theme');
        localStorage.setItem('piggii_theme', 'light');
      } else {
        document.documentElement.classList.remove('light-theme');
        document.documentElement.classList.add('dark-theme');
        localStorage.setItem('piggii_theme', 'dark');
      }
      updateThemeUI();
    });
  }

  // Listen for system theme changes if user has no manual override
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!localStorage.getItem('piggii_theme')) {
        if (e.matches) {
          document.documentElement.classList.add('dark-theme');
          document.documentElement.classList.remove('light-theme');
        } else {
          document.documentElement.classList.remove('dark-theme');
          document.documentElement.classList.remove('light-theme');
        }
        updateThemeUI();
      }
    });
  }

})();
