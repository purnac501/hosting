(function () {

  // --- Site base path ---
  var baseMeta = document.querySelector("meta[name=\"site-base\"]");
  var BASE = baseMeta && baseMeta.getAttribute("content") !== "/"
    ? baseMeta.getAttribute("content").replace(/\/$/, "")
    : "";

  function baseUrl(path) {
    return BASE + "/" + path;
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
  audio.volume = 0.35;
  var currentTrack = 0;
  var isPlaying = false;
  var pendingSeek = 0;

  var trackNameEl = document.getElementById("player-track-name");
  var trackArtistEl = document.getElementById("player-track-artist");
  var playBtn = document.getElementById("btn-play");
  var prevBtn = document.getElementById("btn-prev");
  var nextBtn = document.getElementById("btn-next");
  var progressBar = document.getElementById("player-progress-bar");
  var progressWrap = document.getElementById("player-progress");
  var timeCurrent = document.getElementById("player-time-current");
  var timeTotal = document.getElementById("player-time-total");

  function formatTime(secs) {
    if (isNaN(secs) || secs < 0) return "0:00";
    var m = Math.floor(secs / 60);
    var s = Math.floor(secs % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function loadTrack(index, resumePos) {
    if (index < 0 || index >= tracks.length) index = 0;
    currentTrack = index;
    pendingSeek = resumePos || 0;
    audio.src = baseUrl("assets/tracks/" + tracks[index].file);
    audio.load();
    if (trackNameEl) trackNameEl.textContent = tracks[index].name;
    if (trackArtistEl) trackArtistEl.textContent = tracks[index].artist;
  }

  audio.addEventListener("loadedmetadata", function () {
    if (pendingSeek > 0 && audio.duration && pendingSeek < audio.duration - 1) {
      audio.currentTime = pendingSeek;
    }
    pendingSeek = 0;
    if (timeTotal && audio.duration) timeTotal.textContent = formatTime(audio.duration);
  });

  function savePlayerState() {
    if (currentTrack < 0) return;
    try {
      localStorage.setItem("piggii_player", JSON.stringify({
        track: currentTrack,
        pos: Math.floor(audio.currentTime || 0)
      }));
    } catch (e) {}
  }

  function restorePlayerState() {
    try {
      var raw = localStorage.getItem("piggii_player");
      if (!raw) return null;
      var s = JSON.parse(raw);
      if (typeof s.track !== "number" || s.track < 0 || s.track >= tracks.length) return null;
      return s;
    } catch (e) {
      return null;
    }
  }

  function updatePlayButton() {
    if (!playBtn) return;
    var isPaused = audio.paused;
    playBtn.classList.toggle("is-playing", !isPaused);
    var label = isPaused ? "Play" : "Pause";
    playBtn.setAttribute("title", label);
    playBtn.setAttribute("aria-label", label);
  }

  function togglePlay() {
    if (!audio.src || audio.src === window.location.href) {
      var saved = restorePlayerState();
      var trackToLoad = (saved && typeof saved.track === "number") ? saved.track : currentTrack;
      var posToLoad = (saved && typeof saved.pos === "number") ? saved.pos : 0;
      loadTrack(trackToLoad, posToLoad);
    }
    if (audio.paused) {
      audio.play().catch(function(err) {
        console.warn("Audio playback error:", err);
      });
    } else {
      audio.pause();
    }
  }

  function prevTrack() {
    var nextIdx = currentTrack > 0 ? currentTrack - 1 : tracks.length - 1;
    loadTrack(nextIdx, 0);
    audio.play().catch(function() {});
  }

  function nextTrack() {
    var nextIdx = (currentTrack >= 0 && currentTrack < tracks.length - 1) ? currentTrack + 1 : 0;
    loadTrack(nextIdx, 0);
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
    currentTrack = 0;
    if (trackNameEl) trackNameEl.textContent = tracks[0].name;
    if (trackArtistEl) trackArtistEl.textContent = tracks[0].artist;
  }

  // Pre-load audio.src
  audio.src = baseUrl("assets/tracks/" + tracks[currentTrack].file);

  // Player events
  if (playBtn) playBtn.addEventListener("click", togglePlay);
  if (prevBtn) prevBtn.addEventListener("click", prevTrack);
  if (nextBtn) nextBtn.addEventListener("click", nextTrack);

  audio.addEventListener("play", function () {
    isPlaying = true;
    updatePlayButton();
  });

  audio.addEventListener("pause", function () {
    isPlaying = false;
    updatePlayButton();
    savePlayerState();
  });

  window.addEventListener("pagehide", savePlayerState);

  audio.addEventListener("ended", function () {
    nextTrack();
  });

  var lastStateSave = 0;
  audio.addEventListener("timeupdate", function () {
    if (progressBar && audio.duration) {
      progressBar.style.width = (audio.currentTime / audio.duration * 100) + "%";
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
    progressWrap.addEventListener("click", function (e) {
      if (!audio.duration) {
        if (!audio.src) loadTrack(currentTrack);
        return;
      }
      var rect = progressWrap.getBoundingClientRect();
      var pct = (e.clientX - rect.left) / rect.width;
      pct = Math.max(0, Math.min(1, pct));
      audio.currentTime = pct * audio.duration;
    });
  }

  // Keyboard shortcut: Space to toggle play (when not focused on input)
  document.addEventListener("keydown", function (e) {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) return;
    if (e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      togglePlay();
    }
  });

  // --- Service worker (PWA install + offline reads) ---
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }

  // --- Light / Dark Mode Toggle ---
  var themeToggleBtn = document.getElementById("theme-toggle");

  function isDarkActive() {
    if (document.documentElement.classList.contains("dark-theme")) return true;
    if (document.documentElement.classList.contains("light-theme")) return false;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function updateThemeUI() {
    if (themeToggleBtn) {
      var dark = isDarkActive();
      var label = dark ? "Switch to Light mode" : "Switch to Dark mode";
      themeToggleBtn.setAttribute("title", label);
      themeToggleBtn.setAttribute("aria-label", label);
    }
  }

  if (themeToggleBtn) {
    updateThemeUI();
    themeToggleBtn.addEventListener("click", function () {
      var dark = isDarkActive();
      if (dark) {
        document.documentElement.classList.remove("dark-theme");
        document.documentElement.classList.add("light-theme");
        try { localStorage.setItem("piggii_theme", "light"); } catch (e) {}
      } else {
        document.documentElement.classList.remove("light-theme");
        document.documentElement.classList.add("dark-theme");
        try { localStorage.setItem("piggii_theme", "dark"); } catch (e) {}
      }
      updateThemeUI();
    });
  }

  // System theme changes (when no manual override)
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
      if (!localStorage.getItem("piggii_theme")) {
        if (e.matches) {
          document.documentElement.classList.add("dark-theme");
          document.documentElement.classList.remove("light-theme");
        } else {
          document.documentElement.classList.remove("dark-theme");
          document.documentElement.classList.remove("light-theme");
        }
        updateThemeUI();
      }
    });
  }

})();
