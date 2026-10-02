/* =========================================================
   SHALINI'S LITTLE UNIVERSE — SCRIPT & INTERACTION ENGINE
   - Zero Overlap Slide Deck (Next / Prev in-card flow)
   - Photo Spotlight Switchers (100% face visibility, no cropping)
   - Soothing, gentle warm ambient audio (headache-free)
   ========================================================= */

(function () {
  'use strict';

  /* =========================================================
     1. SOOTHING AMBIENT MUSIC ENGINE (GENTLE & CALMING)
     Warm, mellow low-pass chords (no harsh high beeps)
     ========================================================= */
  let audioCtx = null;
  let isMusicPlaying = false;
  let ambientInterval = null;
  let currentChordIndex = 0;
  let activeGainNodes = [];

  // Very soft, relaxing chord voicings (Hz)
  const SOOTHING_CHORDS = [
    [130.81, 196.00, 246.94, 329.63], // C3, G3, B3, E4 (Warm Cmaj7)
    [110.00, 164.81, 220.00, 261.63], // A2, E3, A3, C4 (Mellow Am)
    [87.31, 130.81, 174.61, 220.00],  // F2, C3, F3, A3 (Peaceful F)
    [98.00, 146.83, 196.00, 246.94]   // G2, D3, G3, B3 (Soft G)
  ];

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playWarmAmbientChord(frequencies) {
    const ctx = getAudioContext();
    if (!ctx || !isMusicPlaying) return;

    // Fade out previous chord
    activeGainNodes.forEach((g) => {
      try {
        g.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
      } catch (e) {}
    });
    activeGainNodes = [];

    const chordMasterGain = ctx.createGain();
    const warmFilter = ctx.createBiquadFilter();
    warmFilter.type = 'lowpass';
    warmFilter.frequency.setValueAtTime(320, ctx.currentTime);

    chordMasterGain.gain.setValueAtTime(0, ctx.currentTime);
    chordMasterGain.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 1.5);
    chordMasterGain.gain.linearRampToValueAtTime(0.018, ctx.currentTime + 3.8);

    frequencies.forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.connect(chordMasterGain);
      osc.start();
      osc.stop(ctx.currentTime + 4.5);
    });

    chordMasterGain.connect(warmFilter);
    warmFilter.connect(ctx.destination);
    activeGainNodes.push(chordMasterGain);
  }

  function playSoftTwinkle() {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const chimeFreqs = [523.25, 659.25, 783.99];
      chimeFreqs.forEach((f, idx) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, ctx.currentTime);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1200, ctx.currentTime);

          gain.gain.setValueAtTime(0, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        }, idx * 80);
      });
    } catch (e) {}
  }

  // Web Audio Sound Effect 1: Candle Blow Breeze Whoosh
  function playCandleBlowWhooshSound() {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const duration = 0.55;
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const env = Math.sin((i / bufferSize) * Math.PI);
        data[i] = (Math.random() * 2 - 1) * env;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + duration);
      filter.Q.value = 1.2;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch (e) {}
  }
  const playSoftBlow = playCandleBlowWhooshSound;

  // Web Audio Sound Effect 2: Crisp Wax Seal Break / Pop
  function playWaxSealSnapSound() {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      // Crackle Noise Burst
      const bufferSize = ctx.sampleRate * 0.08;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const hpFilter = ctx.createBiquadFilter();
      hpFilter.type = 'highpass';
      hpFilter.frequency.setValueAtTime(1500, ctx.currentTime);

      const gainNoise = ctx.createGain();
      gainNoise.gain.setValueAtTime(0.24, ctx.currentTime);
      gainNoise.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      noise.connect(hpFilter);
      hpFilter.connect(gainNoise);
      gainNoise.connect(ctx.destination);

      // Low thump body
      const osc = ctx.createOscillator();
      const gainOsc = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.09);

      gainOsc.gain.setValueAtTime(0.28, ctx.currentTime);
      gainOsc.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

      osc.connect(gainOsc);
      gainOsc.connect(ctx.destination);

      noise.start();
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  }

  // Web Audio Sound Effect 3: Tactile Foil Scratching Sound
  let lastScratchSoundTime = 0;
  function playScratchFoilSound() {
    const now = Date.now();
    if (now - lastScratchSoundTime < 65) return;
    lastScratchSoundTime = now;

    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const duration = 0.045;
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800 + (Math.random() - 0.5) * 600, ctx.currentTime);
      filter.Q.value = 2.4;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch (e) {}
  }

  // Web Audio Sound Effect 4: Dreamy Sky Lantern Ascending Chime
  function playLanternLaunchSound() {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const freqs = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
      freqs.forEach((f, idx) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, ctx.currentTime);

          gain.gain.setValueAtTime(0, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.85);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 0.85);
        }, idx * 90);
      });
    } catch (e) {}
  }

  // Web Audio Sound Effect 5: Gift Box Pop & Sparkle
  function playGiftPopSound() {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(850, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);

      setTimeout(() => {
        playLanternLaunchSound();
      }, 140);
    } catch (e) {}
  }

  // Web Audio Sound Effect 6: Magic Eraser Sparkle Sound
  function playThangoEraseSound() {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const freqs = [987.77, 1318.51, 1567.98];
      freqs.forEach((f, idx) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, ctx.currentTime);

          gain.gain.setValueAtTime(0, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        }, idx * 60);
      });
    } catch (e) {}
  }

  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const bgMusic = document.getElementById('bgMusic');

  let musicFadeInterval = null;

  function fadeAudioIn(audio, targetVolume = 0.5, duration = 1200) {
    if (!audio) return;
    clearInterval(musicFadeInterval);
    audio.volume = 0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => console.log('Audio autoplay prevented'));
    }
    const stepTime = 50;
    const steps = duration / stepTime;
    const stepDelta = targetVolume / steps;

    musicFadeInterval = setInterval(() => {
      if (audio.volume + stepDelta >= targetVolume) {
        audio.volume = targetVolume;
        clearInterval(musicFadeInterval);
      } else {
        audio.volume = Math.min(targetVolume, audio.volume + stepDelta);
      }
    }, stepTime);
  }

  function fadeAudioOut(audio, duration = 1000) {
    if (!audio || audio.paused) return;
    clearInterval(musicFadeInterval);
    const stepTime = 50;
    const steps = duration / stepTime;
    const stepDelta = audio.volume / steps;

    musicFadeInterval = setInterval(() => {
      if (audio.volume - stepDelta <= 0.01) {
        audio.volume = 0;
        audio.pause();
        clearInterval(musicFadeInterval);
      } else {
        audio.volume = Math.max(0, audio.volume - stepDelta);
      }
    }, stepTime);
  }

  let musicNotesInterval = null;

  function startFloatingNotes() {
    if (musicNotesInterval) clearInterval(musicNotesInterval);
    const notes = ['♪', '♫', '♩', '♬', '✨', '🌸'];
    musicNotesInterval = setInterval(() => {
      if (!isMusicPlaying || !musicToggleBtn) return;
      const note = document.createElement('div');
      note.className = 'floating-music-note';
      note.innerText = notes[Math.floor(Math.random() * notes.length)];
      
      const rect = musicToggleBtn.getBoundingClientRect();
      const startX = rect.left + rect.width / 2 + (Math.random() * 20 - 10);
      const startY = rect.top + rect.height / 2;
      
      note.style.left = `${startX}px`;
      note.style.top = `${startY}px`;
      note.style.setProperty('--drift-x', `${(Math.random() - 0.6) * 50}px`);
      
      document.body.appendChild(note);
      setTimeout(() => note.remove(), 2200);
    }, 900);
  }

  function stopFloatingNotes() {
    if (musicNotesInterval) clearInterval(musicNotesInterval);
  }

  function startAmbientMusic() {
    if (bgMusic) {
      fadeAudioIn(bgMusic, 0.5, 1200);
    }
  }

  function stopAmbientMusic() {
    if (bgMusic) {
      fadeAudioOut(bgMusic, 1000);
    }
  }

  function toggleAmbientMusic() {
    getAudioContext(); // For sound effects
    if (bgMusic && !bgMusic.paused) {
      stopAmbientMusic();
    } else {
      startAmbientMusic();
    }
  }

  if (bgMusic) {
    bgMusic.addEventListener('play', () => {
      isMusicPlaying = true;
      if (musicToggleBtn) musicToggleBtn.classList.add('playing');
      startFloatingNotes();
    });
    bgMusic.addEventListener('pause', () => {
      isMusicPlaying = false;
      if (musicToggleBtn) musicToggleBtn.classList.remove('playing');
      stopFloatingNotes();
    });
  }

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', toggleAmbientMusic);
  }

  // Play music when she clicks "Enter Her Universe"
  const enterUniverseBtn = document.getElementById('enterUniverseBtn');
  if (enterUniverseBtn) {
    enterUniverseBtn.addEventListener('click', () => {
      if (bgMusic && bgMusic.paused) {
        startAmbientMusic();
      }
    });
  }


  /* =========================================================
     2. SLIDE DECK CONTROLLER (CLEAN IN-FLOW NAVIGATION)
     ========================================================= */
  const slides = Array.from(document.querySelectorAll('.story-slide'));
  const totalSlides = slides.length;
  let currentSlide = 0;

  const topProgressFill = document.getElementById('topProgressFill');
  const globalBackBtn = document.getElementById('globalBackBtn');

  function updateSlideUI() {
    slides.forEach((slide, idx) => {
      slide.classList.remove('active', 'exit-left');
      if (idx === currentSlide) {
        slide.classList.add('active');
        slide.scrollTop = 0; // Scroll slide card to top
      } else if (idx < currentSlide) {
        slide.classList.add('exit-left');
      }
    });

    // Update ultra-thin top progress line
    if (topProgressFill) {
      const progressPercent = ((currentSlide + 1) / totalSlides) * 100;
      topProgressFill.style.width = `${progressPercent}%`;
    }

    // Toggle global back button visibility
    if (globalBackBtn) {
      if (currentSlide === 0) {
        globalBackBtn.classList.add('hidden');
      } else {
        globalBackBtn.classList.remove('hidden');
      }
    }

    // Tangled Lanterns on Slide 10
    if (currentSlide === 10) {
      if (typeof startTangledLanterns === 'function') startTangledLanterns();
    } else {
      if (typeof stopTangledLanterns === 'function') stopTangledLanterns();
    }

    // Milestone Rolling Stats on Slide 5
    if (currentSlide === 5) {
      if (typeof triggerMilestoneStats === 'function') triggerMilestoneStats();
    }

    // Friendship Scratch Voucher on Slide 8
    if (currentSlide === 8) {
      if (typeof initScratchCardIfNeeded === 'function') initScratchCardIfNeeded();
    }
  }

  function goToSlide(index) {
    if (index < 0 || index >= totalSlides) return;
    currentSlide = index;
    updateSlideUI();
    playSoftTwinkle();
    if (typeof spawnShootingStar === 'function') spawnShootingStar();
  }

  function nextSlide() {
    if (currentSlide < totalSlides - 1) {
      currentSlide++;
      updateSlideUI();
      playSoftTwinkle();
    } else {
      goToSlide(0);
    }
  }

  function prevSlide() {
    if (currentSlide > 0) {
      currentSlide--;
      updateSlideUI();
      playSoftTwinkle();
    }
  }

  // Attach Next/Prev events to all in-slide triggers
  document.querySelectorAll('.btn-next-trigger').forEach((btn) => {
    btn.addEventListener('click', nextSlide);
  });

  document.querySelectorAll('.btn-prev-trigger').forEach((btn) => {
    btn.addEventListener('click', prevSlide);
  });

  // Replay Button on final slide
  const btnReplaySlide = document.getElementById('btnReplaySlide');
  if (btnReplaySlide) {
    btnReplaySlide.addEventListener('click', () => {
      const candles = document.querySelectorAll('#candlesRow .candle');
      candles.forEach((c) => c.classList.remove('blown-out'));
      goToSlide(0);
    });
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      prevSlide();
    }
  });

  /* =========================================================
     3. SPOTLIGHT PHOTO SWITCHERS (100% FACE VISIBILITY)
     ========================================================= */
  function setupSpotlightSwitcher(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const cards = Array.from(container.querySelectorAll('.spotlight-card'));
    const dots = Array.from(container.querySelectorAll('.spotlight-dot'));
    const prevBtn = container.querySelector('.btn-spotlight-prev');
    const nextBtn = container.querySelector('.btn-spotlight-next');
    let currentIndex = 0;

    function showPhoto(index) {
      if (index < 0) index = cards.length - 1;
      if (index >= cards.length) index = 0;
      currentIndex = index;

      cards.forEach((card, i) => {
        card.classList.toggle('active', i === currentIndex);
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
      playSoftTwinkle();
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showPhoto(currentIndex + 1);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showPhoto(currentIndex - 1);
      });
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        showPhoto(i);
      });
    });

    // Touch swipe between photos within container
    let touchX = 0;
    container.addEventListener('touchstart', (e) => {
      touchX = e.changedTouches[0].screenX;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      const diffX = e.changedTouches[0].screenX - touchX;
      if (Math.abs(diffX) > 40) {
        if (diffX < 0) showPhoto(currentIndex + 1);
        else showPhoto(currentIndex - 1);
      }
    }, { passive: true });
  }

  // Initialize all photo switchers
  setupSpotlightSwitcher('childhoodSpotlight');
  setupSpotlightSwitcher('grewSpotlight');
  setupSpotlightSwitcher('soloSpotlight');
  setupSpotlightSwitcher('usSpotlight');

  // 3D Polaroid Hover (Desktop Only)
  document.querySelectorAll('.polaroid-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      if (window.innerWidth < 900) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xPct = (x / rect.width - 0.5) * 2;
      const yPct = (y / rect.height - 0.5) * 2;
      card.style.transform = `perspective(1000px) rotateX(${yPct * -8}deg) rotateY(${xPct * 8}deg) scale(1.05)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* =========================================================
     4. BACKGROUND CANVAS (STARS & HEARTS)
     ========================================================= */
  const uCanvas = document.getElementById('universeCanvas');
  const uCtx = uCanvas ? uCanvas.getContext('2d') : null;
  let width = (uCanvas.width = window.innerWidth);
  let height = (uCanvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    if (uCanvas) {
      width = uCanvas.width = window.innerWidth;
      height = uCanvas.height = window.innerHeight;
      initStars();
    }
    if (fxCanvas) {
      fxWidth = fxCanvas.width = window.innerWidth;
      fxHeight = fxCanvas.height = window.innerHeight;
    }
  });

  const stars = [];
  const starColors = ['#FFFFFF', '#FFD6E7', '#FFF1B8', '#DCCBFF', '#CDEBFF'];

  function initStars() {
    stars.length = 0;
    const count = Math.floor((width * height) / 12000);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
        speed: (Math.random() * 0.02 + 0.005) * (Math.random() < 0.5 ? 1 : -1),
        color: starColors[Math.floor(Math.random() * starColors.length)]
      });
    }
  }

  const shootingStars = [];

  function spawnShootingStar() {
    if (shootingStars.length >= 2) return;
    const startX = Math.random() * (width * 0.75) + width * 0.15;
    const startY = Math.random() * (height * 0.25);
    const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.25; // ~45 deg
    const speed = Math.random() * 8 + 12;
    const length = Math.random() * 80 + 100;
    
    shootingStars.push({
      x: startX,
      y: startY,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      length: length,
      speed: speed,
      opacity: 1,
      fadeSpeed: Math.random() * 0.012 + 0.014,
      color: Math.random() > 0.5 ? '#ffd6e7' : '#fff1b8'
    });
  }

  // Periodic random shooting stars across the universe
  setInterval(() => {
    if (Math.random() < 0.75) {
      spawnShootingStar();
    }
  }, 7500);

  const floatingHearts = [];
  const heartColors = [
    'rgba(255, 214, 231, 0.45)',
    'rgba(220, 203, 255, 0.45)',
    'rgba(255, 217, 199, 0.40)',
    'rgba(213, 245, 227, 0.40)',
    'rgba(205, 235, 255, 0.45)'
  ];

  function drawHeart(ctx, x, y, size, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(0, topCurveHeight);
    ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
    ctx.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, (size + topCurveHeight) / 2, 0, size);
    ctx.bezierCurveTo(0, (size + topCurveHeight) / 2, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
    ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  initStars();

  function renderUniverse() {
    if (!uCtx) return;
    uCtx.clearRect(0, 0, width, height);

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.alpha += s.speed;
      if (s.alpha > 0.95 || s.alpha < 0.15) s.speed = -s.speed;
      uCtx.save();
      uCtx.globalAlpha = Math.max(0.1, Math.min(1, s.alpha));
      uCtx.fillStyle = s.color;
      uCtx.beginPath();
      uCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      uCtx.fill();
      uCtx.restore();
    }

    // Shooting Stars
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const ss = shootingStars[i];
      ss.x += ss.dx;
      ss.y += ss.dy;
      ss.opacity -= ss.fadeSpeed;

      const tailX = ss.x - ss.dx * (ss.length / ss.speed);
      const tailY = ss.y - ss.dy * (ss.length / ss.speed);

      const grad = uCtx.createLinearGradient(tailX, tailY, ss.x, ss.y);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(0.6, ss.color);
      grad.addColorStop(1, '#ffffff');

      uCtx.save();
      uCtx.globalAlpha = Math.max(0, ss.opacity);
      uCtx.strokeStyle = grad;
      uCtx.lineWidth = 2.5;
      uCtx.lineCap = 'round';
      uCtx.beginPath();
      uCtx.moveTo(tailX, tailY);
      uCtx.lineTo(ss.x, ss.y);
      uCtx.stroke();

      // Glowing star head
      uCtx.fillStyle = '#ffffff';
      uCtx.shadowColor = ss.color;
      uCtx.shadowBlur = 10;
      uCtx.beginPath();
      uCtx.arc(ss.x, ss.y, 2.5, 0, Math.PI * 2);
      uCtx.fill();
      uCtx.restore();

      if (ss.opacity <= 0 || ss.x > width + 100 || ss.y > height + 100) {
        shootingStars.splice(i, 1);
      }
    }

    if (Math.random() < 0.04 && floatingHearts.length < 20) {
      floatingHearts.push({
        x: Math.random() * width,
        y: height + 20,
        size: Math.random() * 12 + 8,
        speedY: Math.random() * 0.7 + 0.3,
        driftX: (Math.random() - 0.5) * 0.5,
        color: heartColors[Math.floor(Math.random() * heartColors.length)]
      });
    }

    for (let i = floatingHearts.length - 1; i >= 0; i--) {
      const h = floatingHearts[i];
      h.y -= h.speedY;
      h.x += h.driftX;
      drawHeart(uCtx, h.x, h.y, h.size, h.color);
      if (h.y < -30) floatingHearts.splice(i, 1);
    }

    requestAnimationFrame(renderUniverse);
  }
  renderUniverse();

  /* =========================================================
     5. EFFECTS CANVAS (CONFETTI & BALLOONS)
     ========================================================= */
  const fxCanvas = document.getElementById('fxCanvas');
  const fxCtx = fxCanvas ? fxCanvas.getContext('2d') : null;
  let fxWidth = (fxCanvas.width = window.innerWidth);
  let fxHeight = (fxCanvas.height = window.innerHeight);

  const fxParticles = [];
  const fxBalloons = [];
  const celebrationColors = ['#FF8FA3', '#FFD6E7', '#DCCBFF', '#CDEBFF', '#FFF1B8', '#D5F5E3', '#FFD9C7'];

  function triggerCelebrationBlast() {
    for (let i = 0; i < 160; i++) {
      fxParticles.push({
        x: fxWidth / 2 + (Math.random() - 0.5) * 80,
        y: fxHeight * 0.45,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 15 - 3,
        size: Math.random() * 8 + 5,
        color: celebrationColors[Math.floor(Math.random() * celebrationColors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 14,
        gravity: 0.35,
        drag: 0.98,
        opacity: 1
      });
    }

    for (let i = 0; i < 15; i++) {
      fxBalloons.push({
        x: Math.random() * fxWidth,
        y: fxHeight + Math.random() * 150 + 30,
        radius: Math.random() * 20 + 18,
        speedY: Math.random() * 2.2 + 1.8,
        wobble: Math.random() * 10,
        wobbleSpeed: 0.03,
        color: celebrationColors[Math.floor(Math.random() * celebrationColors.length)]
      });
    }
  }

  function renderFx() {
    if (!fxCtx) return;
    fxCtx.clearRect(0, 0, fxWidth, fxHeight);

    for (let i = fxParticles.length - 1; i >= 0; i--) {
      const p = fxParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.vy += p.gravity;
      p.rotation += p.rotSpeed;
      if (p.y > fxHeight * 0.7) p.opacity -= 0.015;

      fxCtx.save();
      fxCtx.translate(p.x, p.y);
      fxCtx.rotate((p.rotation * Math.PI) / 180);
      fxCtx.globalAlpha = Math.max(0, p.opacity);
      fxCtx.fillStyle = p.color;
      fxCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
      fxCtx.restore();

      if (p.opacity <= 0 || p.y > fxHeight + 40) {
        fxParticles.splice(i, 1);
      }
    }

    for (let i = fxBalloons.length - 1; i >= 0; i--) {
      const b = fxBalloons[i];
      b.y -= b.speedY;
      b.wobble += b.wobbleSpeed;
      const curX = b.x + Math.sin(b.wobble) * 18;

      fxCtx.save();
      fxCtx.fillStyle = b.color;
      fxCtx.beginPath();
      fxCtx.ellipse(curX, b.y, b.radius * 0.85, b.radius, 0, 0, Math.PI * 2);
      fxCtx.fill();

      fxCtx.strokeStyle = 'rgba(120, 100, 130, 0.4)';
      fxCtx.lineWidth = 1.5;
      fxCtx.beginPath();
      fxCtx.moveTo(curX, b.y + b.radius + 4);
      fxCtx.quadraticCurveTo(curX + 6, b.y + b.radius + 20, curX - 3, b.y + b.radius + 40);
      fxCtx.stroke();
      fxCtx.restore();

      if (b.y < -80) fxBalloons.splice(i, 1);
    }

    requestAnimationFrame(renderFx);
  }
  renderFx();

  /* =========================================================
     6. CAKE & WISH CEREMONY
     ========================================================= */
  const btnMakeWish = document.getElementById('btnMakeWish');
  const btnEnableMic = document.getElementById('btnEnableMic');
  const wishHintText = document.getElementById('wishHintText');
  const candlesRow = document.getElementById('candlesRow');
  const wishOverlay = document.getElementById('wishOverlay');
  const btnContinueToSurprise = document.getElementById('btnContinueToSurprise');

  function triggerWishSequence() {
    playSoftBlow();
    const candles = candlesRow ? candlesRow.querySelectorAll('.candle') : [];
    candles.forEach((c) => c.classList.add('blown-out'));

    setTimeout(() => {
      if (wishOverlay) wishOverlay.classList.add('active');
      playSoftTwinkle();
      triggerCelebrationBlast();
    }, 600);
  }

  if (btnMakeWish) {
    btnMakeWish.addEventListener('click', () => {
      triggerWishSequence();
    });
  }

  // removed mic logic

  if (btnContinueToSurprise) {
    btnContinueToSurprise.addEventListener('click', () => {
      if (wishOverlay) wishOverlay.classList.remove('active');
      // Jump to Slide 8: Final Surprise: Us
      goToSlide(8);
    });
  }

  /* =========================================================
     7. COMPLIMENT PILLS (SLIDE 4)
     ========================================================= */
  document.querySelectorAll('.compliment-pill').forEach((pill) => {
    pill.addEventListener('click', (e) => {
      pill.classList.toggle('active');
      playSoftTwinkle();
      
      const rect = pill.getBoundingClientRect();
      const startX = e.clientX || rect.left + rect.width / 2;
      const startY = e.clientY || rect.top + rect.height / 2;
      
      // Mini confetti burst
      for(let i = 0; i < 8; i++) {
        const heart = document.createElement('div');
        heart.innerText = ['💖', '✨', '🌸', '⭐'][Math.floor(Math.random()*4)];
        heart.style.position = 'fixed';
        heart.style.left = startX + 'px';
        heart.style.top = startY + 'px';
        heart.style.fontSize = (Math.random() * 10 + 12) + 'px';
        heart.style.pointerEvents = 'none';
        heart.style.zIndex = '9999';
        heart.style.transition = 'all 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
        
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 30 + 20;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity - 20; // upward bias
        
        document.body.appendChild(heart);
        
        // Ensure browser renders initial state before applying transition
        setTimeout(() => {
          heart.style.transform = `translate(${tx}px, ${ty}px) scale(1.5)`;
          heart.style.opacity = '0';
        }, 20);
        
        setTimeout(() => heart.remove(), 800);
      }
    });
  });

  /* =========================================================
     8. CONSTELLATION TRANSFORMATION (SLIDE 9)
     ========================================================= */
  const btnTransformStars = document.getElementById('btnTransformStars');
  const timelineCardsRow = document.getElementById('timelineCardsRow');
  const constellationDisplay = document.getElementById('constellationDisplay');
  const constellationCanvas = document.getElementById('constellationCanvas');
  const constCtx = constellationCanvas ? constellationCanvas.getContext('2d') : null;
  let constAnimId = null;

  // 7 stars spelling out SHALINI
  const constellationStars = [
    { x: 50,  y: 65,  letter: 'S', baseRadius: 5 },
    { x: 125, y: 115, letter: 'H', baseRadius: 5.5 },
    { x: 205, y: 55,  letter: 'A', baseRadius: 5 },
    { x: 285, y: 125, letter: 'L', baseRadius: 5.5 },
    { x: 355, y: 65,  letter: 'I', baseRadius: 4.5 },
    { x: 435, y: 115, letter: 'N', baseRadius: 5.5 },
    { x: 510, y: 65,  letter: 'I', baseRadius: 5 }
  ];

  // Additional soft neighbor stars to form an authentic star cluster
  const clusterStars = [
    { x: 85,  y: 30, r: 2.5 },
    { x: 165, y: 145, r: 2 },
    { x: 245, y: 95, r: 2.8 },
    { x: 320, y: 40, r: 2 },
    { x: 395, y: 145, r: 2.5 },
    { x: 475, y: 35, r: 2 }
  ];

  let lineProgress = 0;
  let hoveredStarIndex = -1;

  function drawConstellationFrame(timestamp) {
    if (!constCtx || !constellationCanvas) return;
    const cw = constellationCanvas.width;
    const ch = constellationCanvas.height;
    constCtx.clearRect(0, 0, cw, ch);

    // Subtle twinkling background cluster stars
    clusterStars.forEach((cs, idx) => {
      const pulse = Math.sin((timestamp || 0) * 0.003 + idx) * 0.4 + 0.6;
      constCtx.save();
      constCtx.globalAlpha = pulse * 0.45;
      constCtx.fillStyle = '#ffffff';
      constCtx.beginPath();
      constCtx.arc(cs.x, cs.y, cs.r, 0, Math.PI * 2);
      constCtx.fill();
      constCtx.restore();
    });

    // Draw connecting lines progressively
    const totalLines = constellationStars.length - 1;
    for (let i = 0; i < totalLines; i++) {
      if (lineProgress <= i) break;
      const p1 = constellationStars[i];
      const p2 = constellationStars[i + 1];

      const segmentProgress = Math.min(1, lineProgress - i);
      const curX = p1.x + (p2.x - p1.x) * segmentProgress;
      const curY = p1.y + (p2.y - p1.y) * segmentProgress;

      constCtx.save();
      const lineGlow = Math.sin((timestamp || 0) * 0.004 + i) * 0.2 + 0.8;
      constCtx.strokeStyle = `rgba(255, 230, 160, ${0.75 * lineGlow})`;
      constCtx.lineWidth = 2.2;
      constCtx.shadowColor = '#ffd6e7';
      constCtx.shadowBlur = 10;
      constCtx.beginPath();
      constCtx.moveTo(p1.x, p1.y);
      constCtx.lineTo(curX, curY);
      constCtx.stroke();
      constCtx.restore();
    }

    // Advance line drawing smoothly
    if (lineProgress < totalLines) {
      lineProgress += 0.04;
      if (lineProgress >= totalLines) {
        lineProgress = totalLines;
      }
    }

    // Draw the 7 Primary Stars
    constellationStars.forEach((star, idx) => {
      const isReached = lineProgress >= idx;
      if (!isReached) return;

      const isHovered = hoveredStarIndex === idx;
      const pulse = Math.sin((timestamp || 0) * 0.004 + idx * 0.8) * 0.35 + 1;
      const r = isHovered ? star.baseRadius * 1.8 : star.baseRadius * pulse;

      constCtx.save();
      // Outer glow halo
      constCtx.fillStyle = isHovered ? 'rgba(255, 220, 130, 0.5)' : 'rgba(255, 214, 231, 0.35)';
      constCtx.beginPath();
      constCtx.arc(star.x, star.y, r * 2.8, 0, Math.PI * 2);
      constCtx.fill();

      // Diamond starlight rays
      constCtx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      constCtx.lineWidth = 1.2;
      const rayLen = r * 2.2;
      constCtx.beginPath();
      constCtx.moveTo(star.x - rayLen, star.y);
      constCtx.lineTo(star.x + rayLen, star.y);
      constCtx.moveTo(star.x, star.y - rayLen);
      constCtx.lineTo(star.x, star.y + rayLen);
      constCtx.stroke();

      // Core star
      constCtx.fillStyle = '#ffffff';
      constCtx.shadowColor = '#fff1b8';
      constCtx.shadowBlur = 12;
      constCtx.beginPath();
      constCtx.arc(star.x, star.y, r, 0, Math.PI * 2);
      constCtx.fill();

      // Letter label above star
      constCtx.font = 'bold 15px "Comfortaa", cursive, sans-serif';
      constCtx.fillStyle = isHovered ? '#ffe57f' : '#ffd6e7';
      constCtx.textAlign = 'center';
      constCtx.shadowColor = '#ff6b97';
      constCtx.shadowBlur = 8;
      constCtx.fillText(star.letter, star.x, star.y - r - 8);

      constCtx.restore();
    });

    constAnimId = requestAnimationFrame(drawConstellationFrame);
  }

  function startConstellationAnimation() {
    if (!constellationCanvas) return;
    if (constAnimId) cancelAnimationFrame(constAnimId);
    lineProgress = 0;
    hoveredStarIndex = -1;
    constAnimId = requestAnimationFrame(drawConstellationFrame);
  }

  if (constellationCanvas) {
    const handleStarHover = (clientX, clientY) => {
      const rect = constellationCanvas.getBoundingClientRect();
      const scaleX = constellationCanvas.width / rect.width;
      const scaleY = constellationCanvas.height / rect.height;
      const mouseX = (clientX - rect.left) * scaleX;
      const mouseY = (clientY - rect.top) * scaleY;

      let found = -1;
      constellationStars.forEach((star, idx) => {
        const dist = Math.hypot(mouseX - star.x, mouseY - star.y);
        if (dist < 28) found = idx;
      });
      if (found !== hoveredStarIndex) {
        hoveredStarIndex = found;
        if (found !== -1) playSoftTwinkle();
      }
    };

    constellationCanvas.addEventListener('mousemove', (e) => handleStarHover(e.clientX, e.clientY));
    constellationCanvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        handleStarHover(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });
    constellationCanvas.addEventListener('mouseleave', () => { hoveredStarIndex = -1; });
  }

  if (btnTransformStars) {
    btnTransformStars.addEventListener('click', () => {
      playSoftTwinkle();
      if (timelineCardsRow) {
        timelineCardsRow.style.opacity = '0.15';
        timelineCardsRow.style.transform = 'scale(0.85)';
      }
      if (constellationDisplay) {
        constellationDisplay.classList.add('active');
        startConstellationAnimation();
      }
      triggerCelebrationBlast();
    });
  }

  /* =========================================================
     9. LIGHTBOX MODAL FOR POLAROIDS
     ========================================================= */
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxSub = document.getElementById('lightboxSub');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');

  function openLightbox(src, title, sub) {
    if (!lightboxModal) return;
    lightboxImg.src = src;
    lightboxTitle.textContent = title || '';
    lightboxSub.textContent = sub || '';
    lightboxModal.classList.add('active');
    playSoftTwinkle();
  }

  function closeLightbox() {
    if (lightboxModal) lightboxModal.classList.remove('active');
  }

  document.querySelectorAll('[data-lightbox]').forEach((el) => {
    el.addEventListener('click', () => {
      const src = el.getAttribute('data-lightbox');
      const caption = el.getAttribute('data-caption') || '';
      const sub = el.getAttribute('data-sub') || '';
      openLightbox(src, caption, sub);
    });
  });

  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
      if (wishOverlay && wishOverlay.classList.contains('active')) {
        wishOverlay.classList.remove('active');
      }
    }
  });


  /* =========================================================
     INTERACTIVE WAX SEAL & ENVELOPE (SLIDE 6)
     ========================================================= */
  const envelopePresentation = document.getElementById('envelopePresentation');
  const envelopeBox = document.getElementById('envelopeBox');
  const waxSealBtn = document.getElementById('waxSealBtn');
  const parchmentLetterWrapper = document.getElementById('parchmentLetterWrapper');
  const btnRefoldLetter = document.getElementById('btnRefoldLetter');
  const btnSaveKeepsake = document.getElementById('btnSaveKeepsake');
  const saveKeepsakeText = document.getElementById('saveKeepsakeText');

  function openEnvelope() {
    if (!envelopeBox) return;
    playWaxSealSnapSound();
    playSoftTwinkle();
    envelopeBox.classList.add('opened');

    setTimeout(() => {
      if (envelopePresentation) envelopePresentation.classList.add('fade-out');
      if (parchmentLetterWrapper) parchmentLetterWrapper.classList.remove('hidden');
      const slide6 = document.querySelector('.story-slide[data-slide="6"]');
      if (slide6) slide6.scrollTop = 0;
    }, 700);
  }

  function refoldEnvelope() {
    playSoftTwinkle();
    if (parchmentLetterWrapper) parchmentLetterWrapper.classList.add('hidden');
    if (envelopePresentation) {
      envelopePresentation.classList.remove('fade-out');
    }
    if (envelopeBox) {
      envelopeBox.classList.remove('opened');
    }
    const slide6 = document.querySelector('.story-slide[data-slide="6"]');
    if (slide6) slide6.scrollTop = 0;

    // Reset password lock
    const letterPasswordWrap = document.getElementById('letterPasswordWrap');
    const envelopePromptText = document.getElementById('envelopePromptText');
    const letterPasswordInput = document.getElementById('letterPasswordInput');
    const waxSealBtn = document.getElementById('waxSealBtn');
    
    if (waxSealBtn) waxSealBtn.style.pointerEvents = 'auto';
    if (letterPasswordWrap) letterPasswordWrap.style.display = 'none';
    if (envelopePromptText) envelopePromptText.style.display = 'block';
    if (letterPasswordInput) letterPasswordInput.value = '';
  }

  const letterPasswordWrap = document.getElementById('letterPasswordWrap');
  const letterPasswordInput = document.getElementById('letterPasswordInput');
  const btnLetterPasswordSubmit = document.getElementById('btnLetterPasswordSubmit');
  const letterPasswordError = document.getElementById('letterPasswordError');
  const envelopePromptText = document.getElementById('envelopePromptText');

  if (waxSealBtn) {
    waxSealBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (envelopePromptText) envelopePromptText.style.display = 'none';
      if (letterPasswordWrap) {
        letterPasswordWrap.style.display = 'flex';
        waxSealBtn.style.pointerEvents = 'none'; // Prevent double clicking the seal
      } else {
        openEnvelope();
      }
    });
  }

  if (btnLetterPasswordSubmit) {
    btnLetterPasswordSubmit.addEventListener('click', (e) => {
      e.stopPropagation();
      if (letterPasswordInput && letterPasswordInput.value === 'ShaShi@2917') {
        if (letterPasswordError) letterPasswordError.style.display = 'none';
        openEnvelope();
      } else {
        if (letterPasswordError) letterPasswordError.style.display = 'block';
        if (letterPasswordInput) letterPasswordInput.value = '';
      }
    });
  }

  const btnTogglePassword = document.getElementById('btnTogglePassword');
  if (btnTogglePassword && letterPasswordInput) {
    btnTogglePassword.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (letterPasswordInput.type === 'password') {
        letterPasswordInput.type = 'text';
      } else {
        letterPasswordInput.type = 'password';
      }
    });
  }

  const btnEraseThango = document.getElementById('btnEraseThango');
  const thangoText = document.getElementById('thangoText');
  let isThangoErased = false;
  if (btnEraseThango && thangoText) {
    btnEraseThango.addEventListener('click', () => {
      isThangoErased = !isThangoErased;
      playThangoEraseSound();
      if (isThangoErased) {
        thangoText.style.opacity = '0';
        setTimeout(() => {
          thangoText.innerText = 'Shalini';
          thangoText.style.opacity = '1';
          btnEraseThango.innerHTML = 'Bring back 🪄';
        }, 300);
      } else {
        thangoText.style.opacity = '0';
        setTimeout(() => {
          thangoText.innerText = 'Thango';
          thangoText.style.opacity = '1';
          btnEraseThango.innerHTML = 'Erase 🪄';
        }, 300);
      }
    });
  }
  if (envelopeBox) {
    envelopeBox.addEventListener('click', (e) => {
      // Trigger the wax seal click so the password prompt is shown
      if (waxSealBtn && waxSealBtn.style.pointerEvents !== 'none') {
        waxSealBtn.click();
      }
    });
  }
  if (btnRefoldLetter) btnRefoldLetter.addEventListener('click', refoldEnvelope);

  /* =========================================================
     SAVE LETTER AS KEEPSAKE PHOTO (SLIDE 6)
     ========================================================= */
  function showToast(message) {
    let toast = document.querySelector('.toast-notice');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>💌</span><span>${message}</span>`;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  if (btnSaveKeepsake) {
    btnSaveKeepsake.addEventListener('click', () => {
      const target = document.getElementById('letterCaptureTarget');
      if (!target) return;

      if (typeof html2canvas === 'undefined') {
        showToast('Saving letter image...');
        return;
      }

      playSoftTwinkle();
      if (saveKeepsakeText) saveKeepsakeText.textContent = 'Saving your letter... 💖';
      btnSaveKeepsake.disabled = true;

      html2canvas(target, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFDF8',
        logging: false
      }).then((canvas) => {
        const link = document.createElement('a');
        link.download = 'Shalni_25th_Birthday_Letter_From_Rishi.png';
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('Saved to your photos! Keep it forever 💌');
        if (saveKeepsakeText) saveKeepsakeText.textContent = 'Letter Saved! 💖';

        setTimeout(() => {
          if (saveKeepsakeText) saveKeepsakeText.textContent = 'Save Letter as Keepsake 💌';
          btnSaveKeepsake.disabled = false;
        }, 3000);
      }).catch((err) => {
        console.error('html2canvas error:', err);
        if (saveKeepsakeText) saveKeepsakeText.textContent = 'Save Letter as Keepsake 💌';
        btnSaveKeepsake.disabled = false;
      });
    });
  }

  /* =========================================================
     10. INTERACTIVE GIFT BOX & VIRTUAL HUG (SLIDE 10)
     ========================================================= */
  const giftBox = document.getElementById('giftBox');
  const giftBoxContainer = document.getElementById('giftBoxContainer');
  const finalWishesBox = document.getElementById('finalWishesBox');
  const btnVirtualHug = document.getElementById('btnVirtualHug');

  if (giftBox) {
    giftBox.addEventListener('click', () => {
      // Prevent multiple clicks
      if (giftBox.classList.contains('opened')) return;

      playSoftTwinkle();
      giftBox.classList.add('shaking');

      setTimeout(() => {
        giftBox.classList.remove('shaking');
        giftBox.classList.add('opened');
        playGiftPopSound();
        triggerCelebrationBlast(); // Confetti!

        setTimeout(() => {
          if (giftBoxContainer) giftBoxContainer.classList.add('hidden');
          if (finalWishesBox) finalWishesBox.classList.remove('hidden');
        }, 600);
      }, 500);
    });
  }

  if (btnVirtualHug) {
    btnVirtualHug.addEventListener('click', () => {
      playSoftTwinkle();
      document.body.classList.remove('virtual-hug-active');
      
      // Force reflow to restart animation
      void document.body.offsetWidth;
      document.body.classList.add('virtual-hug-active');

      // Generate falling/floating hearts
      for (let i = 0; i < 30; i++) {
        setTimeout(() => {
          const heart = document.createElement('div');
          heart.className = 'floating-hug-heart';
          heart.innerText = ['💖', '💗', '💕', '💓', '🤗'][Math.floor(Math.random() * 5)];
          heart.style.left = (Math.random() * 100) + 'vw';
          heart.style.fontSize = (Math.random() * 2 + 1.5) + 'rem';
          heart.style.animationDuration = (Math.random() * 2 + 2) + 's';
          document.body.appendChild(heart);

          setTimeout(() => {
            if (heart.parentNode) heart.remove();
          }, 5000);
        }, i * 50); // Stagger hearts creation
      }
    });
  }

  /* =========================================================
     11. HERO OPENING ANIMATIONS (SLIDE 0)
     ========================================================= */
  const heroOrb = document.getElementById('heroOrb');
  const heroFlash = document.getElementById('heroFlash');
  // enterUniverseBtn is already declared at line 174
  const typeLine1 = document.getElementById('typeLine1');
  const typeLine2 = document.getElementById('typeLine2');
  const typeLine3 = document.getElementById('typeLine3');
  const typeStats = document.getElementById('typeStats');
  const heroBtnWrap = document.getElementById('heroBtnWrap');

  // Stardust trailing cursor (Global)
  window.addEventListener('mousemove', (e) => {
    if (Math.random() > 0.4) return; // throttle a bit
    const dust = document.createElement('div');
    dust.className = 'stardust';
    dust.style.left = e.clientX + 'px';
    dust.style.top = e.clientY + 'px';
    document.body.appendChild(dust);
    setTimeout(() => dust.remove(), 1000);
  });

  const slide0 = document.getElementById('slide0');
  if (slide0) {
    slide0.addEventListener('click', (e) => {
      if (e.target.closest('#enterUniverseBtn')) return; // Ignore if clicking button
      // Small explosion on click
      for(let i=0; i<8; i++) {
        const dust = document.createElement('div');
        dust.className = 'stardust';
        dust.style.left = e.clientX + (Math.random()*40-20) + 'px';
        dust.style.top = e.clientY + (Math.random()*40-20) + 'px';
        document.body.appendChild(dust);
        setTimeout(() => dust.remove(), 1000);
      }
    });
  }

  // Tiny typing sound
  function playTypingSound() {
    if (!audioCtx || audioCtx.state !== 'running') return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(150 + Math.random() * 50, audioCtx.currentTime);
    
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.05);
  }

  // Fairy tale typing
  function typeText(el, text, speed, callback) {
    if (!el) return;
    el.innerHTML = '';
    el.classList.add('typing');
    let i = 0;
    const interval = setInterval(() => {
      if (text.charAt(i) !== ' ') playTypingSound();
      el.innerHTML += text.charAt(i);
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        el.classList.remove('typing');
        if (callback) setTimeout(callback, 500);
      }
    }, speed);
  }

  function startHeroTyping() {
    if (currentSlide === 0 && typeLine1) {
      setTimeout(() => {
        typeText(typeLine1, "Before you became who you are today...", 60, () => {
          typeText(typeLine2, "There was a little girl named Shalini.", 70, () => {
            typeText(typeLine3, "She had no idea how beautiful her journey would become.", 55, () => {
              if (typeStats) typeStats.classList.remove('hidden');
              setTimeout(() => {
                if (heroBtnWrap) heroBtnWrap.classList.remove('hidden');
              }, 1000);
            });
          });
        });
      }, 800);
    }
  }

  // Countdown Logic
  const countdownOverlay = document.getElementById('countdownOverlay');
  const btnStartJourney = document.getElementById('btnStartJourney');
  const countdownTimer = document.getElementById('countdownTimer');
  const countdownTitle = document.getElementById('countdownTitle');
  
  if (countdownOverlay && btnStartJourney) {
    const targetDate = new Date('2026-09-29T00:00:00').getTime();
    const isOverride = window.location.search.includes('override=1');
    
    function updateCountdown() {
      const now = new Date().getTime();
      const distance = targetDate - now;
      
      if (distance <= 0 || isOverride) {
        // Unlock
        if (countdownTimer) countdownTimer.style.display = 'none';
        countdownTitle.innerText = 'Are you ready? ✨';
        btnStartJourney.classList.remove('hidden');
        return true; // Done
      } else {
        // Calculate
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById('cdDays').innerText = String(days).padStart(2, '0');
        document.getElementById('cdHours').innerText = String(hours).padStart(2, '0');
        document.getElementById('cdMins').innerText = String(minutes).padStart(2, '0');
        document.getElementById('cdSecs').innerText = String(seconds).padStart(2, '0');
        
        return false; // Continue
      }
    }
    
    if (!updateCountdown()) {
      const cdInterval = setInterval(() => {
        if (updateCountdown()) clearInterval(cdInterval);
      }, 1000);
    }
    
    // Playful interactive messages when she taps the countdown screen
    const playfulMessages = [
      "Hey Shalini, wait some time! 😂",
      "I know you're excited...",
      "But it's not the 29th sept yet!",
      "Just a little longer... 🥺",
      "Patience is a virtue, shalni!",
      "I promise it'll be worth it ❤️",
      "Stop tapping! 😂",
      "There's a whole universe waiting for you... ✨",
      "Are you ready to see some stars? 🌟",
      "Maybe even release a magical lantern... 🏮",
      "A quarter of a century is a big deal! 🎂",
      "I promise you won't cry (maybe a little) 🥺",
      "Okay fine, almost there... ✨"
    ];
    let messageIndex = 0;
    
    countdownOverlay.addEventListener('click', (e) => {
      // Don't cycle if it's the start button
      if (e.target.id === 'btnStartJourney' || !countdownTimer || countdownTimer.style.display === 'none') return;
      
      countdownTitle.style.opacity = '0';
      setTimeout(() => {
        countdownTitle.innerText = playfulMessages[messageIndex];
        countdownTitle.style.opacity = '1';
        messageIndex = (messageIndex + 1) % playfulMessages.length;
      }, 200); // quick fade out/in
    });

    btnStartJourney.addEventListener('click', () => {
      try { getAudioContext(); } catch(e) {}
      countdownOverlay.classList.add('hidden');
      startHeroTyping();
    });
  } else {
    startHeroTyping();
  }

  // Orb explosion transition
  if (enterUniverseBtn) {
    enterUniverseBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent stardust click
      playSoftTwinkle();
      if (heroOrb) heroOrb.classList.add('exploding');
      setTimeout(() => {
        if (heroFlash) heroFlash.classList.add('active');
        setTimeout(() => {
          nextSlide();
          // Fade flash out after switching
          setTimeout(() => {
            if (heroFlash) heroFlash.classList.remove('active');
            if (heroOrb) heroOrb.classList.remove('exploding'); // reset orb
          }, 400);
        }, 800); // switch slide when flash is fully white
      }, 300);
    });
  }

  // removed scratch logic

  /* =========================================================
     13. TANGLED NIGHT SKY & FLOATING LANTERN RELEASE (SLIDE 10)
     ========================================================= */
  const tangledLanternsSky = document.getElementById('tangledLanternsSky');
  let tangledLanternsInterval = null;
  let isTangledActive = false;

  function spawnAmbientLantern(initialBottomPct = null) {
    if (!tangledLanternsSky) return;
    const lantern = document.createElement('div');
    lantern.className = 'ambient-tangled-lantern';

    // Random size between 16px and 34px (depth perspective)
    const width = Math.floor(Math.random() * 18 + 16);
    const height = Math.floor(width * 1.35);
    const leftPct = Math.random() * 92 + 4; // 4% to 96%
    const duration = Math.random() * 10 + 15; // 15s to 25s
    const drift = (Math.random() - 0.5) * 80;
    const opacity = (Math.random() * 0.45 + 0.45).toFixed(2);
    const scale = (width / 24).toFixed(2);

    lantern.style.width = `${width}px`;
    lantern.style.height = `${height}px`;
    lantern.style.left = `${leftPct}%`;
    lantern.style.animationDuration = `${duration}s`;
    lantern.style.setProperty('--lantern-drift', `${drift}px`);
    lantern.style.setProperty('--lantern-opacity', opacity);
    lantern.style.setProperty('--lantern-scale', scale);

    if (initialBottomPct !== null) {
      lantern.style.bottom = `${initialBottomPct}%`;
      lantern.style.opacity = opacity;
    }

    tangledLanternsSky.appendChild(lantern);

    setTimeout(() => {
      if (lantern.parentNode) lantern.remove();
    }, duration * 1000);
  }

  function startTangledLanterns() {
    if (isTangledActive || !tangledLanternsSky) return;
    isTangledActive = true;
    
    // Clear any previous
    tangledLanternsSky.innerHTML = '';

    // Pre-populate 14 lanterns at different heights in the sky
    for (let i = 0; i < 14; i++) {
      spawnAmbientLantern(Math.random() * 75 + 10);
    }

    // Continuous spawner
    tangledLanternsInterval = setInterval(() => {
      if (!isTangledActive) return;
      spawnAmbientLantern();
    }, 1400);
  }

  function stopTangledLanterns() {
    isTangledActive = false;
    if (tangledLanternsInterval) {
      clearInterval(tangledLanternsInterval);
      tangledLanternsInterval = null;
    }
  }

  const lanternWishInput = document.getElementById('lanternWishInput');
  const btnReleaseLantern = document.getElementById('btnReleaseLantern');
  
  if (btnReleaseLantern && lanternWishInput) {
    btnReleaseLantern.addEventListener('click', () => {
      const text = lanternWishInput.value.trim();
      if (!text) return;
      
      playLanternLaunchSound();
      const lantern = document.createElement('div');
      lantern.className = 'floating-lantern';
      lantern.innerText = text;
      
      const anim = Math.random() > 0.5 ? 'floatLanternUp' : 'floatLanternUpAlt';
      const duration = 7 + Math.random() * 4;
      lantern.style.animation = `${anim} ${duration}s ease-in forwards`;
      
      document.body.appendChild(lantern);

      // Trigger extra celebration sparkles
      triggerCelebrationBlast();
      
      // Send wish secretly to ntfy.sh
      fetch('https://ntfy.sh/', {
        method: 'POST',
        body: JSON.stringify({
          topic: 'shalini_wish_rishi_25',
          message: text,
          title: 'Shalini made a wish! 🏮✨',
          tags: ['sparkles', 'tada']
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch(err => console.error('Wish error:', err));

      lanternWishInput.value = '';
      lanternWishInput.placeholder = "Wish released into the stars! ✨";
      
      setTimeout(() => {
        lantern.remove();
      }, duration * 1000);
    });
  }

  /* =========================================================
     14. TAP TO REVEAL CONSTELLATION PILLS (SLIDE 6)
     ========================================================= */
  const starsRingContainer = document.querySelector('.stars-ring-compact');
  if (starsRingContainer) {
    const pills = Array.from(starsRingContainer.querySelectorAll('.compliment-pill'));
    
    const revealBtn = document.createElement('button');
    revealBtn.className = 'btn-wish-sparkle';
    revealBtn.style.margin = '1rem auto 1.5rem auto';
    revealBtn.style.display = 'block';
    revealBtn.innerHTML = `<span>Tap to reveal ✨ (${pills.length} more)</span>`;
    
    // Insert button just before the stars ring
    starsRingContainer.parentNode.insertBefore(revealBtn, starsRingContainer);

    // Hide all pills initially
    pills.forEach(pill => pill.classList.add('hidden-pill'));

    let currentRevealIndex = 0;

    const revealNext = () => {
      if (currentRevealIndex < pills.length) {
        pills[currentRevealIndex].classList.remove('hidden-pill');
        currentRevealIndex++;
        
        const remaining = pills.length - currentRevealIndex;
        if (remaining > 0) {
          revealBtn.innerHTML = `<span>Tap to reveal ✨ (${remaining} more)</span>`;
        }
        
        // Add a tiny pop effect
        if (typeof playSoftTwinkle === 'function') {
            playSoftTwinkle();
        }
      }
      
      if (currentRevealIndex >= pills.length) {
        revealBtn.style.display = 'none';
      }
    };

    revealBtn.addEventListener('click', revealNext);
    // Also allow tapping the container itself to pop them faster
    starsRingContainer.addEventListener('click', revealNext);
  }

  /* =========================================================
     MILESTONE STATS ANIMATOR (SLIDE 5)
     ========================================================= */
  let statsAnimated = false;
  function triggerMilestoneStats() {
    if (statsAnimated) return;
    statsAnimated = true;

    const statElements = document.querySelectorAll('.stat-number');
    statElements.forEach((el) => {
      const target = parseInt(el.getAttribute('data-target'), 10);
      if (isNaN(target)) return;

      const duration = 2000;
      const startTime = performance.now();

      function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // smooth easeOutExpo
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentVal = Math.floor(ease * target);
        el.textContent = currentVal.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          el.textContent = target.toLocaleString();
        }
      }
      requestAnimationFrame(updateNumber);
    });
  }

  /* =========================================================
     FRIENDSHIP SCRATCH-OFF VOUCHER (SLIDE 8)
     ========================================================= */
  const coupons = [
    {
      badge: "VIP BEST FRIEND PASS 💖",
      title: "3 AM Emergency Call & Advice Pass 📞",
      desc: "Guaranteed to pick up your call, listen without judgment, talk sense into you, or scold you for your own good. Valid 24/7/365 for the next 25+ years!"
    },
    {
      badge: "CRAVING SATISFACTION PASS 🍗✨",
      title: "One Free Biryani & Treat on Demand 😋",
      desc: "Redeemable whenever you're hungry, having a rough day, or just want food. Rishi pays, no questions asked, plus guaranteed dessert!"
    },
    {
      badge: "MOOD RESCUE CARD 🪄🌸",
      title: "Unlimited Sulking & Mood-Fixer Pass 🧸",
      desc: "License to be dramatic, send 40 angry voice notes, or go completely quiet. Rishi is obligated to cheer you up with silly jokes and memes."
    },
    {
      badge: "CO-PILOT ADVENTURE PASS 🚗🗺️",
      title: "Spontaneous Chai & Long Drive Voucher ☕🌌",
      desc: "Whenever life gets overwhelming, we hit pause, get hot tea, play the playlist, and take a breather under the open sky."
    }
  ];

  let currentCouponIdx = 0;
  let scratchCanvas = null;
  let scratchCtx = null;
  let isScratching = false;
  let isRevealed = false;
  let scratchInitialized = false;

  function initScratchCardIfNeeded() {
    scratchCanvas = document.getElementById('scratchCanvas');
    if (!scratchCanvas || scratchInitialized) return;
    scratchInitialized = true;

    scratchCtx = scratchCanvas.getContext('2d');
    resetScratchCanvas();

    function getPos(e) {
      const rect = scratchCanvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const scaleX = scratchCanvas.width / rect.width;
      const scaleY = scratchCanvas.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    }

    function scratch(e) {
      if (!isScratching || isRevealed) return;
      e.preventDefault();
      const pos = getPos(e);
      scratchCtx.globalCompositeOperation = 'destination-out';
      scratchCtx.beginPath();
      scratchCtx.arc(pos.x, pos.y, 24, 0, Math.PI * 2);
      scratchCtx.fill();

      playScratchFoilSound();
      checkScratchPercentage();
    }

    function startScratch(e) {
      if (isRevealed) return;
      isScratching = true;
      scratch(e);
    }

    function stopScratch() {
      isScratching = false;
    }

    scratchCanvas.addEventListener('mousedown', startScratch);
    window.addEventListener('mousemove', scratch);
    window.addEventListener('mouseup', stopScratch);

    scratchCanvas.addEventListener('touchstart', startScratch, { passive: false });
    window.addEventListener('touchmove', scratch, { passive: false });
    window.addEventListener('touchend', stopScratch);

    const btnNewCoupon = document.getElementById('btnNewCoupon');
    if (btnNewCoupon) {
      btnNewCoupon.addEventListener('click', () => {
        currentCouponIdx = (currentCouponIdx + 1) % coupons.length;
        const coupon = coupons[currentCouponIdx];
        
        const contentWrap = document.getElementById('voucherContent');
        if (contentWrap) {
          contentWrap.style.transition = 'opacity 0.25s ease';
          contentWrap.style.opacity = '0';
          setTimeout(() => {
            const badgeEl = contentWrap.querySelector('.voucher-badge');
            const titleEl = document.getElementById('voucherRewardTitle');
            const descEl = document.getElementById('voucherRewardDesc');
            if (badgeEl) badgeEl.textContent = coupon.badge;
            if (titleEl) titleEl.textContent = coupon.title;
            if (descEl) descEl.textContent = coupon.desc;
            contentWrap.style.opacity = '1';
            resetScratchCanvas();
          }, 250);
        } else {
          resetScratchCanvas();
        }
      });
    }
  }

  function resetScratchCanvas() {
    if (!scratchCanvas || !scratchCtx) return;
    isRevealed = false;
    scratchCanvas.style.opacity = '1';
    scratchCanvas.style.pointerEvents = 'auto';

    const btnNewCoupon = document.getElementById('btnNewCoupon');
    if (btnNewCoupon) btnNewCoupon.classList.remove('visible');

    const width = scratchCanvas.width;
    const height = scratchCanvas.height;
    scratchCtx.globalCompositeOperation = 'source-over';

    // Rich metallic gold gradient
    const grad = scratchCtx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#e5be65');
    grad.addColorStop(0.25, '#fce59f');
    grad.addColorStop(0.5, '#cca142');
    grad.addColorStop(0.75, '#fae8b4');
    grad.addColorStop(1, '#b8860b');

    scratchCtx.fillStyle = grad;
    scratchCtx.fillRect(0, 0, width, height);

    // Subtle sparkles
    scratchCtx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    for (let i = 0; i < 45; i++) {
      const rx = (i * 37) % width;
      const ry = (i * 53) % height;
      scratchCtx.fillRect(rx, ry, 3, 3);
    }

    // Border inside
    scratchCtx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    scratchCtx.lineWidth = 3;
    scratchCtx.setLineDash([8, 6]);
    scratchCtx.strokeRect(12, 12, width - 24, height - 24);
    scratchCtx.setLineDash([]);

    // Central Icon & Instruction Text
    scratchCtx.fillStyle = '#4a2c00';
    scratchCtx.font = 'bold 20px "Outfit", sans-serif';
    scratchCtx.textAlign = 'center';
    scratchCtx.textBaseline = 'middle';
    scratchCtx.fillText('✨ SCRATCH HERE ✨', width / 2, height / 2 - 12);

    scratchCtx.fillStyle = '#6b460c';
    scratchCtx.font = '600 12px "Inter", sans-serif';
    scratchCtx.fillText('Rub with your finger or mouse to reveal!', width / 2, height / 2 + 16);
  }

  let lastCheckTime = 0;
  function checkScratchPercentage() {
    if (isRevealed || !scratchCanvas || !scratchCtx) return;
    const now = Date.now();
    if (now - lastCheckTime < 200) return;
    lastCheckTime = now;

    const width = scratchCanvas.width;
    const height = scratchCanvas.height;
    const imgData = scratchCtx.getImageData(0, 0, width, height);
    const data = imgData.data;
    let transparentCount = 0;
    const totalSampled = data.length / 16;

    for (let i = 3; i < data.length; i += 16) {
      if (data[i] === 0) {
        transparentCount++;
      }
    }

    const percent = (transparentCount / totalSampled) * 100;
    if (percent > 40) {
      revealFullVoucher();
    }
  }

  function revealFullVoucher() {
    if (isRevealed) return;
    isRevealed = true;
    if (scratchCanvas) {
      scratchCanvas.style.opacity = '0';
      scratchCanvas.style.pointerEvents = 'none';
    }
    const btnNewCoupon = document.getElementById('btnNewCoupon');
    if (btnNewCoupon) {
      btnNewCoupon.classList.add('visible');
    }

    // Celebration
    if (typeof confettiBurst === 'function') confettiBurst();
    if (typeof playSoftTwinkle === 'function') playSoftTwinkle();
  }

  // Initialize
  updateSlideUI();
  console.log("🌸 Shalini's Little Universe loaded cleanly without overlapping bars! ✨");
})();
