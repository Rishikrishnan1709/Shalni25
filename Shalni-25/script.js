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

  function playSoftBlow() {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.25;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch (e) {}
  }

  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const bgMusic = document.getElementById('bgMusic');

  function startAmbientMusic() {
    if (bgMusic) {
      bgMusic.volume = 0.5;
      bgMusic.play().catch(e => console.log('Audio playback prevented by browser'));
    }
  }

  function stopAmbientMusic() {
    if (bgMusic) bgMusic.pause();
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
    });
    bgMusic.addEventListener('pause', () => {
      isMusicPlaying = false;
      if (musicToggleBtn) musicToggleBtn.classList.remove('playing');
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
  }

  function goToSlide(index) {
    if (index < 0 || index >= totalSlides) return;
    currentSlide = index;
    updateSlideUI();
    playSoftTwinkle();
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
    pill.addEventListener('click', () => {
      pill.classList.toggle('active');
      playSoftTwinkle();
    });
  });

  /* =========================================================
     8. CONSTELLATION TRANSFORMATION (SLIDE 9)
     ========================================================= */
  const btnTransformStars = document.getElementById('btnTransformStars');
  const timelineCardsRow = document.getElementById('timelineCardsRow');
  const constellationDisplay = document.getElementById('constellationDisplay');

  if (btnTransformStars) {
    btnTransformStars.addEventListener('click', () => {
      playSoftTwinkle();
      if (timelineCardsRow) {
        timelineCardsRow.style.opacity = '0.15';
        timelineCardsRow.style.transform = 'scale(0.85)';
      }
      if (constellationDisplay) {
        constellationDisplay.classList.add('active');
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

  function createFloatingParticles() {
    const container = document.createElement('div');
    container.className = 'global-particles-container';
    document.body.appendChild(container);

    const emojis = ['✨', '💖', '🌸', '🦋', '⭐', '☁️', '🎈', '🫧', '🌷', '🎀'];
    
    // Create one particle every 1.5 seconds
    setInterval(() => {
      const particle = document.createElement('div');
      particle.className = 'global-particle';
      particle.innerText = emojis[Math.floor(Math.random() * emojis.length)];
      
      // Random properties
      particle.style.left = Math.random() * 95 + 'vw';
      particle.style.animationDuration = (Math.random() * 12 + 15) + 's'; // 15 to 27 seconds to float up
      particle.style.setProperty('--max-opacity', (Math.random() * 0.4 + 0.2).toString()); // Random max opacity between 0.2 and 0.6
      particle.style.fontSize = (Math.random() * 1.5 + 0.8) + 'rem';
      
      container.appendChild(particle);
      
      // Clean up after it floats off screen
      setTimeout(() => {
        if (particle && particle.parentNode) {
          particle.remove();
        }
      }, 30000);
    }, 1500);
  }

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
  }

  if (waxSealBtn) waxSealBtn.addEventListener('click', (e) => { e.stopPropagation(); openEnvelope(); });

  const btnEraseThango = document.getElementById('btnEraseThango');
  const thangoText = document.getElementById('thangoText');
  let isThangoErased = false;
  if (btnEraseThango && thangoText) {
    btnEraseThango.addEventListener('click', () => {
      isThangoErased = !isThangoErased;
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
  if (envelopeBox) envelopeBox.addEventListener('click', openEnvelope);
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
        playSoftBlow(); // Just for some sound effect
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

  // Stardust trailing cursor
  const slide0 = document.getElementById('slide0');
  if (slide0) {
    slide0.addEventListener('mousemove', (e) => {
      if (Math.random() > 0.4) return; // throttle a bit
      const dust = document.createElement('div');
      dust.className = 'stardust';
      dust.style.left = e.clientX + 'px';
      dust.style.top = e.clientY + 'px';
      document.body.appendChild(dust);
      setTimeout(() => dust.remove(), 1000);
    });
    
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
     13. FLOATING LANTERN RELEASE (SLIDE 10)
     ========================================================= */
  const lanternWishInput = document.getElementById('lanternWishInput');
  const btnReleaseLantern = document.getElementById('btnReleaseLantern');
  
  if (btnReleaseLantern && lanternWishInput) {
    btnReleaseLantern.addEventListener('click', () => {
      const text = lanternWishInput.value.trim();
      if (!text) return;
      
      const lantern = document.createElement('div');
      lantern.className = 'floating-lantern';
      lantern.innerText = text;
      
      const anim = Math.random() > 0.5 ? 'floatLanternUp' : 'floatLanternUpAlt';
      const duration = 7 + Math.random() * 4;
      lantern.style.animation = `${anim} ${duration}s ease-in forwards`;
      
      document.body.appendChild(lantern);
      
      // Send wish secretly to ntfy.sh
      fetch('https://ntfy.sh/shalini_wish_rishi_25', {
        method: 'POST',
        body: text,
        headers: {
          'Title': 'Shalini made a wish! 🏮✨',
          'Tags': 'sparkles,tada'
        }
      }).catch(err => console.log('Wish sent'));

      lanternWishInput.value = '';
      lanternWishInput.placeholder = "Wish released! ✨";
      
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

  // Initialize
  updateSlideUI();
  createFloatingParticles();
  console.log("🌸 Shalini's Little Universe loaded cleanly without overlapping bars! ✨");
})();
