// Main Application Controller for Adanify
document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const stageCanvas = document.getElementById('stageCanvas');
  const timeScrubber = document.getElementById('timeScrubber');
  const playBtn = document.getElementById('playBtn');
  const playIcon = document.getElementById('playIcon');
  const playText = document.getElementById('playText');
  const reverseBtn = document.getElementById('reverseBtn');
  const resetBtn = document.getElementById('resetBtn');
  
  const stageStatus = document.getElementById('stageStatus');
  const stageStatusText = document.getElementById('stageStatusText');
  const particleCounter = document.getElementById('particleCounter');
  const fpsCounter = document.getElementById('fpsCounter');

  // Tabs
  const tabUpload = document.getElementById('tabUpload');
  const tabCamera = document.getElementById('tabCamera');
  const tabPresets = document.getElementById('tabPresets');
  const uploadView = document.getElementById('uploadView');
  const cameraView = document.getElementById('cameraView');
  const presetsView = document.getElementById('presetsView');

  // Upload elements
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');

  // Camera elements
  const cameraVideo = document.getElementById('cameraVideo');
  const shutterBtn = document.getElementById('shutterBtn');
  const instantSnapBtn = document.getElementById('instantSnapBtn');
  const flipCamBtn = document.getElementById('flipCamBtn');
  const cameraFlash = document.getElementById('cameraFlash');
  const countdownBadge = document.getElementById('countdownBadge');

  // Previews & Targets
  const activeSourceThumb = document.getElementById('activeSourceThumb');
  const activeSourceName = document.getElementById('activeSourceName');
  const targetCards = document.querySelectorAll('.target-card');
  const presetChips = document.querySelectorAll('.preset-chip');

  // Settings
  const animModeSelect = document.getElementById('animModeSelect');
  const gridResSelect = document.getElementById('gridResSelect');
  const colorModeSelect = document.getElementById('colorModeSelect');
  const particleShapeSelect = document.getElementById('particleShapeSelect');
  const speedBtns = document.querySelectorAll('.speed-btn');

  // Toast
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toastText');

  // Initialize Engines
  const algorithm = new AdaniAlgorithm(stageCanvas);

  // State
  let currentSourceImg = new Image();
  let currentTargetImg = new Image();
  let currentSourceName = 'Barack Obama';
  let isCameraActive = false;

  // Toast Helper
  function showToast(message, icon = '✨') {
    toastText.textContent = message;
    document.getElementById('toastIcon').textContent = icon;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // Load an image asynchronously
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = src;
    });
  }

  // Update input thumbnail preview
  function updateSourcePreview(imgOrSrc, name) {
    activeSourceThumb.src = typeof imgOrSrc === 'string' ? imgOrSrc : imgOrSrc.src;
    activeSourceName.textContent = name || 'Custom Input';
    currentSourceName = name || 'Custom Input';
  }

  // Set new source image and reprocess
  async function setSourceImage(img, name) {
    currentSourceImg = img;
    updateSourcePreview(img, name);
    algorithm.reset();
    timeScrubber.value = 0;
    await algorithm.loadImages(currentSourceImg, currentTargetImg);
    updateParticleCountBadge();
    showToast(`Loaded "${name || 'Photo'}" for Adanification!`, '⚡');
  }

  // Set new target Adani image and reprocess
  async function setTargetImage(img) {
    currentTargetImg = img;
    await algorithm.loadImages(currentSourceImg, currentTargetImg);
    showToast('Target Adani portrait updated!', '🎯');
  }

  function updateParticleCountBadge() {
    const total = algorithm.gridResolution * algorithm.gridResolution;
    particleCounter.textContent = `${total.toLocaleString()} Particles`;
  }

  // 1. Initial Load: Obama (meme homage) -> Gautam Adani
  try {
    currentSourceImg = await loadImage('assets/barack_obama.jpg');
    currentTargetImg = await loadImage('assets/gautam_adani.jpg');
    await algorithm.loadImages(currentSourceImg, currentTargetImg);
    updateParticleCountBadge();
  } catch (err) {
    console.error('Failed to load initial assets:', err);
  }

  // 2. Algorithm Event Callbacks
  algorithm.onProgressUpdate = (p) => {
    timeScrubber.value = p;
    if (p >= 0.99) {
      stageStatusText.textContent = '100% Gautam Adani!';
      playIcon.textContent = '⟲';
      playText.textContent = 'Replay';
    } else if (p <= 0.01) {
      stageStatusText.textContent = 'Input Likeness';
      playIcon.textContent = '▶';
      playText.textContent = 'Adanify Now';
    } else {
      stageStatusText.textContent = `Adanifying... ${Math.round(p * 100)}%`;
      playIcon.textContent = '⏸';
      playText.textContent = 'Pause';
    }
  };

  algorithm.onComplete = () => {
    stageStatusText.textContent = 'Officially Adanified!';
    playIcon.textContent = '⟲';
    playText.textContent = 'Replay';
    showToast('Adanification Complete! +$89.6B Net Worth', '👑');
  };

  // 3. Scrubbing & Playback Controls
  timeScrubber.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    algorithm.seek(val);
  });

  playBtn.addEventListener('click', () => {
    if (algorithm.isMemeMode) {
      algorithm.reset();
    }

    if (algorithm.isPlaying) {
      algorithm.pause();
      playIcon.textContent = '▶';
      playText.textContent = 'Resume';
    } else {
      if (algorithm.progress >= 0.99) {
        algorithm.reset();
      }
      algorithm.play();
      playIcon.textContent = '⏸';
      playText.textContent = 'Pause';
    }
  });

  reverseBtn.addEventListener('click', () => {
    algorithm.playReverse();
    playIcon.textContent = '⏸';
    playText.textContent = 'Reversing';
  });

  resetBtn.addEventListener('click', () => {
    algorithm.reset();
    playIcon.textContent = '▶';
    playText.textContent = 'Adanify Now';
    showToast('Reset to original photo', '↺');
  });

  // Speed selector
  speedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      speedBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      algorithm.speed = parseFloat(btn.dataset.speed);
    });
  });

  // 4. Tab Navigation
  function switchTab(activeTab) {
    [tabUpload, tabCamera, tabPresets].forEach(t => t.classList.remove('active'));
    [uploadView, cameraView, presetsView].forEach(v => v.classList.add('hidden'));

    if (activeTab === 'upload') {
      tabUpload.classList.add('active');
      uploadView.classList.remove('hidden');
      stopCamera();
    } else if (activeTab === 'camera') {
      tabCamera.classList.add('active');
      cameraView.classList.remove('hidden');
      startCamera();
    } else if (activeTab === 'presets') {
      tabPresets.classList.add('active');
      presetsView.classList.remove('hidden');
      stopCamera();
    }
  }

  tabUpload.addEventListener('click', () => switchTab('upload'));
  tabCamera.addEventListener('click', () => switchTab('camera'));
  tabPresets.addEventListener('click', () => switchTab('presets'));

  // 5. Upload Handling (File browse + Drag & Drop + Clipboard Paste)
  dropzone.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleUploadedFile(file);
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('drag-over');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('drag-over');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadedFile(e.dataTransfer.files[0]);
    }
  });

  // Support pasting image anywhere on the page
  window.addEventListener('paste', (e) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          handleUploadedFile(file, 'Clipboard Image');
          switchTab('upload');
          break;
        }
      }
    }
  });

  function handleUploadedFile(file, customName) {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const img = await loadImage(e.target.result);
        const name = customName || file.name.replace(/\.[^/.]+$/, "");
        await setSourceImage(img, name);
      } catch (err) {
        console.error('Error loading uploaded image:', err);
        alert('Could not read image file.');
      }
    };
    reader.readAsDataURL(file);
  }

  // 6. Camera Studio Handling
  async function startCamera() {
    if (isCameraActive) return;
    try {
      await window.cameraManager.start(cameraVideo);
      isCameraActive = true;
      showToast('Camera feed live! Align your face.', '📷');
    } catch (err) {
      console.warn('Camera start error:', err);
      showToast(err.message || 'Camera could not be accessed', '⚠️');
    }
  }

  function stopCamera() {
    if (isCameraActive) {
      window.cameraManager.stop();
      isCameraActive = false;
    }
  }

  // 3-Second Shutter Countdown
  shutterBtn.addEventListener('click', () => {
    if (!isCameraActive) return;
    shutterBtn.disabled = true;

    window.cameraManager.startCountdown(
      (count) => {
        if (count > 0) {
          countdownBadge.textContent = count;
          countdownBadge.classList.add('show');
        } else {
          countdownBadge.classList.remove('show');
          triggerFlash();
        }
      },
      async (captured) => {
        shutterBtn.disabled = false;
        if (captured && captured.img) {
          await setSourceImage(captured.img, 'Live Camera Snapshot');
          showToast('Photo captured! Click "Adanify Now" to transform.', '📸');
        }
      }
    );
  });

  // Instant Snapshot
  instantSnapBtn.addEventListener('click', async () => {
    if (!isCameraActive) return;
    triggerFlash();
    const captured = window.cameraManager.instantCapture();
    if (captured && captured.img) {
      await setSourceImage(captured.img, 'Instant Snapshot');
      showToast('Photo captured!', '📸');
    }
  });

  // Flip Camera
  flipCamBtn.addEventListener('click', async () => {
    if (!isCameraActive) return;
    try {
      await window.cameraManager.flipCamera();
      showToast('Switched camera', '🔄');
    } catch (err) {
      console.warn('Could not flip camera:', err);
    }
  });

  function triggerFlash() {
    cameraFlash.classList.add('flash');
    setTimeout(() => {
      cameraFlash.classList.remove('flash');
    }, 350);
  }

  // 7. Presets Selection
  presetChips.forEach(chip => {
    chip.addEventListener('click', async () => {
      presetChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const src = chip.dataset.src;
      const name = chip.dataset.name;
      try {
        const img = await loadImage(src);
        await setSourceImage(img, name);
      } catch (err) {
        console.error('Error loading preset:', err);
      }
    });
  });

  // 8. Target Adani Portrait Selection
  targetCards.forEach(card => {
    card.addEventListener('click', async () => {
      targetCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const targetSrc = card.dataset.target;
      try {
        const img = await loadImage(targetSrc);
        await setTargetImage(img);
      } catch (err) {
        console.error('Error loading target Adani image:', err);
      }
    });
  });

  // 9. Algorithm Settings Tuning
  animModeSelect.addEventListener('change', (e) => {
    algorithm.setAnimationMode(e.target.value);
    algorithm.render();
  });

  gridResSelect.addEventListener('change', (e) => {
    algorithm.setResolution(e.target.value);
    updateParticleCountBadge();
  });

  colorModeSelect.addEventListener('change', (e) => {
    algorithm.setColorMode(e.target.value);
    algorithm.render();
  });

  particleShapeSelect.addEventListener('change', (e) => {
    algorithm.setParticleShape(e.target.value);
    algorithm.render();
  });

});
