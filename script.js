(function () {

  // --- Site base path ---
  var baseMeta = document.querySelector('meta[name="site-base"]');
  var BASE = baseMeta && baseMeta.getAttribute('content') !== '/'
    ? baseMeta.getAttribute('content').replace(/\/$/, '')
    : '';

  function baseUrl(path) {
    return BASE + '/' + path;
  }

  // --- Music Player ---
  var tracks = [
    { file: "01_cm_song.mp3", name: "超時空飯店 娘々 CMソング", artist: "Unknown" },
    { file: "02_love_and_joy.mp3", name: "LOVE & JOY", artist: "木村由姬" },
    { file: "03_kerodestiny.mp3", name: "ケロ⑨destiny", artist: "Silver Forest" },
    { file: "04_true_my_heart.mp3", name: "True my heart", artist: "Nursery Rhyme" },
    { file: "05_kokoro.mp3", name: "ココロ", artist: "Toraboruta-P feat. 鏡音リン" },
    { file: "06_sakuranbo.mp3", name: "Sakuranbo", artist: "Otsuka Ai" },
    { file: "07_love_shine.mp3", name: "LOVE♥SHINE", artist: "小坂りゆ" },
    { file: "08_only_my_railgun.mp3", name: "only my railgun", artist: "fripSide" },
    { file: "09_marisa_stole.mp3", name: "Marisa Stole The Precious Thing", artist: "IOSYS" },
    { file: "10_migi_kata_no_cho.mp3", name: "右肩の蝶", artist: "Nori-P" },
    { file: "11_kokoro_no_tamago.mp3", name: "こころのたまご", artist: "Buono!" },
    { file: "12_melt.mp3", name: "melt", artist: "supercell feat. 初音ミク" },
    { file: "13_seikan_hikou.mp3", name: "Seikan Hikou", artist: "Megumi Nakajima" }
  ];

  var audio = new Audio();
  var currentTrack = -1;
  var isPlaying = false;
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
  }

  audio.addEventListener('loadedmetadata', function () {
    if (pendingSeek > 0 && audio.duration && pendingSeek < audio.duration - 1) {
      audio.currentTime = pendingSeek;
    }
    pendingSeek = 0;
    if (timeTotal && audio.duration) timeTotal.textContent = formatTime(audio.duration);
  });

  function savePlayerState() {
    if (currentTrack < 0) return;
    try {
      localStorage.setItem('piggii_player', JSON.stringify({
        track: currentTrack,
        pos: Math.floor(audio.currentTime || 0)
      }));
    } catch (e) {}
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

  function updatePlayButton() {
    if (!playBtn) return;
    var isPaused = audio.paused;
    playBtn.classList.toggle('is-playing', !isPaused);
    var label = isPaused ? 'Play' : 'Pause';
    playBtn.setAttribute('title', label);
    playBtn.setAttribute('aria-label', label);
  }

  function togglePlay() {
    if (currentTrack < 0) {
      var saved = restorePlayerState();
      if (saved) {
        loadTrack(saved.track, saved.pos);
      } else {
        loadTrack(0);
      }
    }
    if (audio.paused) {
      audio.play().catch(function() {});
    } else {
      audio.pause();
    }
  }

  function prevTrack() {
    if (currentTrack < 0) {
      loadTrack(0);
    } else if (currentTrack > 0) {
      loadTrack(currentTrack - 1);
    } else {
      loadTrack(tracks.length - 1);
    }
    audio.play().catch(function() {});
  }

  function nextTrack() {
    if (currentTrack < 0) {
      loadTrack(0);
    } else if (currentTrack < tracks.length - 1) {
      loadTrack(currentTrack + 1);
    } else {
      loadTrack(0);
    }
    audio.play().catch(function() {});
  }

  // Restore saved track label initially
  var savedInitial = restorePlayerState();
  if (savedInitial && tracks[savedInitial.track]) {
    currentTrack = savedInitial.track;
    if (trackNameEl) trackNameEl.textContent = tracks[savedInitial.track].name;
    if (trackArtistEl) trackArtistEl.textContent = tracks[savedInitial.track].artist;
    pendingSeek = savedInitial.pos;
  } else {
    if (trackNameEl) trackNameEl.textContent = tracks[0].name;
    if (trackArtistEl) trackArtistEl.textContent = tracks[0].artist;
  }

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
    nextTrack();
  });

  var lastStateSave = 0;
  audio.addEventListener('timeupdate', function () {
    if (progressBar && audio.duration) {
      progressBar.style.width = (audio.currentTime / audio.duration * 100) + '%';
    }
    if (timeCurrent) timeCurrent.textContent = formatTime(audio.currentTime);
    if (timeTotal && audio.duration) timeTotal.textContent = formatTime(audio.duration);
    
    var now = Date.now();
    if (isPlaying && now - lastStateSave > 2000) {
      lastStateSave = now;
      savePlayerState();
    }
  });

  if (progressWrap) {
    progressWrap.addEventListener('click', function (e) {
      if (!audio.duration) {
        if (currentTrack < 0) loadTrack(0);
        return;
      }
      var rect = progressWrap.getBoundingClientRect();
      var pct = (e.clientX - rect.left) / rect.width;
      pct = Math.max(0, Math.min(1, pct));
      audio.currentTime = pct * audio.duration;
    });
  }

  // Keyboard shortcut: Space to toggle play (when not focused on input)
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      togglePlay();
    }
  });

  // --- Service worker (PWA install + offline reads) ---
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }

  // --- Light / Dark Mode Toggle ---
  var themeToggleBtn = document.getElementById('theme-toggle');

  function isDarkActive() {
    if (document.documentElement.classList.contains('dark-theme')) return true;
    if (document.documentElement.classList.contains('light-theme')) return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function updateThemeUI() {
    if (themeToggleBtn) {
      var dark = isDarkActive();
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
        try { localStorage.setItem('piggii_theme', 'light'); } catch (e) {}
      } else {
        document.documentElement.classList.remove('light-theme');
        document.documentElement.classList.add('dark-theme');
        try { localStorage.setItem('piggii_theme', 'dark'); } catch (e) {}
      }
      updateThemeUI();
    });
  }

  // System theme changes (when no manual override)
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
