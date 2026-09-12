// The Gautam Adani Algorithm ("Adanify")
// High-performance particle physics & optimal tile assignment engine inspired by Spu7Nix's Obama Algorithm

class AdaniAlgorithm {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    this.gridResolution = 48; // Default 48x48 = 2,304 tiles
    this.particles = [];
    this.sourceImg = null;
    this.targetImg = null;
    this.isReady = false;
    
    // Animation state
    this.progress = 0; // 0 (Source) -> 1 (Adani)
    this.isPlaying = false;
    this.speed = 1.0;
    this.direction = 1; // 1 = forward, -1 = reverse
    this.lastFrameTime = null;
    this.animMode = 'vortex'; // 'vortex', 'tilesort', 'liquid', 'glitch'
    this.colorMode = 'source'; // 'source', 'hybrid'
    this.particleShape = 'rounded'; // 'square', 'rounded', 'circle', 'diamond'
    this.turbulence = 1.0;
    this.isMemeMode = false;
    
    // Canvas dimensions
    this.size = 640;
    this.canvas.width = this.size;
    this.canvas.height = this.size;
    
    // Event listeners
    this.onProgressUpdate = null;
    this.onComplete = null;
  }

  setResolution(res) {
    this.gridResolution = parseInt(res, 10);
    if (this.sourceImg && this.targetImg) {
      this.processImages();
    }
  }

  setAnimationMode(mode) {
    this.animMode = mode;
  }

  setColorMode(mode) {
    this.colorMode = mode;
  }

  setParticleShape(shape) {
    this.particleShape = shape;
  }

  setTurbulence(val) {
    this.turbulence = parseFloat(val);
  }

  // Load and prepare source and target images
  async loadImages(sourceImg, targetImg) {
    this.sourceImg = sourceImg;
    this.targetImg = targetImg;
    await this.processImages();
  }

  // Extract pixel grids and compute optimal tile mapping
  async processImages() {
    if (!this.sourceImg || !this.targetImg) return;

    const size = this.size;
    const grid = this.gridResolution;
    const tileSize = size / grid;

    // 1. Render source image to offscreen canvas
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = size;
    srcCanvas.height = size;
    const sCtx = srcCanvas.getContext('2d');
    this.drawCoverImage(sCtx, this.sourceImg, size, size);
    const srcData = sCtx.getImageData(0, 0, size, size).data;

    // 2. Render target (Gautam Adani) image to offscreen canvas
    const tgtCanvas = document.createElement('canvas');
    tgtCanvas.width = size;
    tgtCanvas.height = size;
    const tCtx = tgtCanvas.getContext('2d');
    this.drawCoverImage(tCtx, this.targetImg, size, size);
    const tgtData = tCtx.getImageData(0, 0, size, size).data;

    // 3. Extract source tiles
    const sourceTiles = [];
    for (let gy = 0; gy < grid; gy++) {
      for (let gx = 0; gx < grid; gx++) {
        const x = gx * tileSize;
        const y = gy * tileSize;
        const color = this.sampleTileColor(srcData, size, x, y, tileSize);
        const luma = 0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2];
        sourceTiles.push({
          id: gy * grid + gx,
          gx, gy,
          x: x + tileSize / 2,
          y: y + tileSize / 2,
          color,
          luma
        });
      }
    }

    // 4. Extract target (Adani) tiles
    const targetTiles = [];
    for (let gy = 0; gy < grid; gy++) {
      for (let gx = 0; gx < grid; gx++) {
        const x = gx * tileSize;
        const y = gy * tileSize;
        const color = this.sampleTileColor(tgtData, size, x, y, tileSize);
        const luma = 0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2];
        targetTiles.push({
          id: gy * grid + gx,
          gx, gy,
          x: x + tileSize / 2,
          y: y + tileSize / 2,
          color,
          luma
        });
      }
    }

    // 5. Match source tiles to target tiles (Spu7Nix Obamify Assignment)
    // Sort both by luminance to pair brights with brights and darks with darks
    const sortedSrc = [...sourceTiles].sort((a, b) => a.luma - b.luma);
    const sortedTgt = [...targetTiles].sort((a, b) => a.luma - b.luma);

    // Build particle objects with physics properties
    this.particles = [];
    const centerX = size / 2;
    const centerY = size / 2;

    for (let i = 0; i < sortedSrc.length; i++) {
      const src = sortedSrc[i];
      // Target tile assigned based on luminance ranking with gentle spatial affinity
      const tgt = sortedTgt[i];

      const dx = src.x - centerX;
      const dy = src.y - centerY;
      const distFromCenter = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      // Random chaotic swirl offsets
      const swirlDir = (i % 2 === 0 ? 1 : -1);
      const swirlMag = (0.5 + Math.random() * 1.5) * (100 + Math.random() * 120);

      this.particles.push({
        // Origin coordinates (User photo)
        ox: src.x,
        oy: src.y,
        origColor: src.color,
        
        // Target coordinates (Gautam Adani)
        tx: tgt.x,
        ty: tgt.y,
        targetColor: tgt.color,
        
        // Direct grid counterpart
        dx: src.gx * tileSize + tileSize / 2,
        dy: src.gy * tileSize + tileSize / 2,

        // Current coordinates
        x: src.x,
        y: src.y,
        
        // Tile properties
        size: tileSize,
        distFromCenter,
        angle,
        swirlDir,
        swirlMag,
        delay: (distFromCenter / (size * 0.7)) * 0.25 + (Math.random() * 0.1),
        randFreq: 2 + Math.random() * 4,
        randPhase: Math.random() * Math.PI * 2
      });
    }

    this.isReady = true;
    this.render();
  }

  // Draw image with 'cover' aspect ratio into square canvas
  drawCoverImage(ctx, img, w, h) {
    const imgRatio = (img.naturalWidth || img.width) / (img.naturalHeight || img.height);
    const targetRatio = w / h;
    let sx = 0, sy = 0, sWidth = img.naturalWidth || img.width, sHeight = img.naturalHeight || img.height;

    if (imgRatio > targetRatio) {
      sWidth = sHeight * targetRatio;
      sx = ((img.naturalWidth || img.width) - sWidth) / 2;
    } else {
      sHeight = sWidth / targetRatio;
      sy = ((img.naturalHeight || img.height) - sHeight) / 2;
    }

    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, w, h);
  }

  // Sample average color inside a grid tile
  sampleTileColor(data, canvasWidth, x, y, size) {
    let r = 0, g = 0, b = 0, count = 0;
    const step = Math.max(1, Math.floor(size / 3));

    const endX = Math.min(canvasWidth, Math.floor(x + size));
    const endY = Math.min(canvasWidth, Math.floor(y + size));

    for (let py = Math.floor(y); py < endY; py += step) {
      for (let px = Math.floor(x); px < endX; px += step) {
        const idx = (py * canvasWidth + px) * 4;
        r += data[idx];
        g += data[idx + 1];
        b += data[idx + 2];
        count++;
      }
    }

    if (count === 0) return [128, 128, 128, 255];
    return [
      Math.round(r / count),
      Math.round(g / count),
      Math.round(b / count),
      255
    ];
  }

  // Play animation
  play() {
    if (!this.isReady) return;
    this.isPlaying = true;
    this.direction = 1;
    this.lastFrameTime = performance.now();
    if (window.audioManager) {
      window.audioManager.playWhoosh(1.5 / this.speed);
    }
    requestAnimationFrame(this.loop.bind(this));
  }

  // Reverse animation (back to user photo)
  playReverse() {
    if (!this.isReady) return;
    this.isPlaying = true;
    this.direction = -1;
    this.lastFrameTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  // Pause
  pause() {
    this.isPlaying = false;
  }

  // Reset to original photo (progress = 0)
  reset() {
    this.isPlaying = false;
    this.progress = 0;
    this.isMemeMode = false;
    this.updateParticlePositions(0);
    this.render();
    if (this.onProgressUpdate) this.onProgressUpdate(0);
  }

  // Seek to specific progress (0.0 to 1.0)
  seek(p) {
    this.isPlaying = false;
    this.progress = Math.max(0, Math.min(1, p));
    this.updateParticlePositions(this.progress);
    this.render();
    if (this.onProgressUpdate) this.onProgressUpdate(this.progress);
  }

  // Trigger meme mode: "What if you put Adani in the Adani algorithm?"
  triggerMeme() {
    if (!this.isReady) return;
    this.isMemeMode = true;
    this.progress = 1.0;
    if (window.audioManager) {
      window.audioManager.playMemeSound();
    }
    this.isPlaying = true;
    this.lastFrameTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  // Animation frame loop
  loop(now) {
    if (!this.isPlaying) return;

    const dt = Math.min(0.1, (now - this.lastFrameTime) / 1000);
    this.lastFrameTime = now;

    if (this.isMemeMode) {
      // Cosmic infinite oscillation
      this.memePhase = (this.memePhase || 0) + dt * 4;
      this.renderMemeWave(this.memePhase);
      requestAnimationFrame(this.loop.bind(this));
      return;
    }

    // Normal progression
    const animDuration = 1.8 / this.speed;
    this.progress += (dt / animDuration) * this.direction;

    if (this.progress >= 1.0) {
      this.progress = 1.0;
      this.isPlaying = false;
      this.updateParticlePositions(1.0);
      this.render();
      if (this.onProgressUpdate) this.onProgressUpdate(1.0);
      if (this.onComplete) this.onComplete();
      if (window.audioManager) window.audioManager.playCompleteChime();
      return;
    } else if (this.progress <= 0.0) {
      this.progress = 0.0;
      this.isPlaying = false;
      this.updateParticlePositions(0.0);
      this.render();
      if (this.onProgressUpdate) this.onProgressUpdate(0.0);
      return;
    }

    this.updateParticlePositions(this.progress);
    this.render();

    if (this.onProgressUpdate) {
      this.onProgressUpdate(this.progress);
    }

    requestAnimationFrame(this.loop.bind(this));
  }

  // Calculate current positions based on active animation mode
  updateParticlePositions(globalProgress) {
    const mode = this.animMode;
    const turb = this.turbulence;
    const size = this.size;
    const centerX = size / 2;
    const centerY = size / 2;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Normalized local progress with stagger delay
      const rawProg = (globalProgress - p.delay * 0.3) / (1.0 - p.delay * 0.3);
      const prog = Math.max(0, Math.min(1, rawProg));

      // Smooth easing (easeInOutCubic)
      const ease = prog < 0.5 
        ? 4 * prog * prog * prog 
        : 1 - Math.pow(-2 * prog + 2, 3) / 2;

      // Base linear interpolation from (ox, oy) to (tx, ty)
      let curX = p.ox + (p.tx - p.ox) * ease;
      let curY = p.oy + (p.ty - p.oy) * ease;

      // Arc envelope: 0 at start, peak at mid-flight, 0 at end
      const arc = Math.sin(prog * Math.PI);

      if (mode === 'vortex') {
        // Spu7Nix iconic vortex & curl noise physics
        const swirlRadius = p.swirlMag * arc * turb;
        const currentAngle = p.angle + p.swirlDir * (arc * Math.PI * 1.5);
        
        curX += Math.cos(currentAngle) * swirlRadius;
        curY += Math.sin(currentAngle) * swirlRadius;

        // Wave perturbation
        curX += Math.sin(prog * Math.PI * p.randFreq + p.randPhase) * 15 * arc * turb;
        curY += Math.cos(prog * Math.PI * p.randFreq + p.randPhase) * 15 * arc * turb;

      } else if (mode === 'liquid') {
        // Fluid downward drip & flow
        const drip = Math.sin(prog * Math.PI) * (140 + Math.sin(p.randPhase) * 60) * turb;
        const drift = Math.sin(p.oy * 0.05 + prog * 4) * 35 * arc * turb;
        curY += drip;
        curX += drift;

      } else if (mode === 'glitch') {
        // Cyber glitch teleport
        if (arc > 0.1 && arc < 0.9) {
          const glitchX = (Math.sin(p.oy * 0.1 + prog * 20) > 0 ? 1 : -1) * 45 * arc * turb;
          curX += glitchX;
        }
      } else if (mode === 'tilesort') {
        // Discrete pixel sorting: horizontal then vertical axis slide
        if (prog < 0.5) {
          const subEase = prog * 2;
          curX = p.ox + (p.tx - p.ox) * subEase;
          curY = p.oy;
        } else {
          const subEase = (prog - 0.5) * 2;
          curX = p.tx;
          curY = p.oy + (p.ty - p.oy) * subEase;
        }
      }

      p.x = curX;
      p.y = curY;
      p.currentProg = prog;
    }
  }

  // Render the current particle frame
  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const size = this.size;

    // Clear background
    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, size, size);

    const isHybrid = this.colorMode === 'hybrid';
    const shape = this.particleShape;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const prog = p.currentProg || 0;

      // Color interpolation
      let r, g, b, a;
      if (isHybrid) {
        // Smooth chromatic morphing towards Adani's portrait
        const cEase = prog * prog * (3 - 2 * prog); // smoothstep
        r = Math.round(p.origColor[0] + (p.targetColor[0] - p.origColor[0]) * cEase);
        g = Math.round(p.origColor[1] + (p.targetColor[1] - p.origColor[1]) * cEase);
        b = Math.round(p.origColor[2] + (p.targetColor[2] - p.origColor[2]) * cEase);
        a = 1.0;
      } else {
        // Pure source image color (authentic Obamify tile rearrangement!)
        r = p.origColor[0];
        g = p.origColor[1];
        b = p.origColor[2];
        a = 1.0;
      }

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

      // Dynamic scale & particle shape
      const arc = Math.sin(prog * Math.PI);
      const scale = 1.0 - arc * 0.2;
      const w = p.size * scale;
      const h = p.size * scale;
      const px = p.x - w / 2;
      const py = p.y - h / 2;

      if (shape === 'rounded') {
        const radius = Math.min(4, w * 0.25);
        ctx.beginPath();
        ctx.roundRect(px, py, w + 0.5, h + 0.5, radius);
        ctx.fill();
      } else if (shape === 'circle') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, (w / 2) + 0.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (shape === 'diamond') {
        ctx.beginPath();
        ctx.moveTo(p.x, py);
        ctx.lineTo(px + w, p.y);
        ctx.lineTo(p.x, py + h);
        ctx.lineTo(px, p.y);
        ctx.closePath();
        ctx.fill();
      } else {
        // Classic crisp square
        ctx.fillRect(px, py, w + 0.5, h + 0.5);
      }
    }
  }

  // Special meme mode rendering: "What if you put Adani in the Adani algorithm?"
  renderMemeWave(phase) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const size = this.size;

    ctx.fillStyle = 'rgba(8, 12, 20, 0.4)';
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const wave = Math.sin(phase * 3 + p.distFromCenter * 0.05 + p.angle * 2);
      const waveCos = Math.cos(phase * 2 + p.distFromCenter * 0.04);
      
      const rx = p.tx + Math.cos(p.angle) * wave * 25;
      const ry = p.ty + Math.sin(p.angle) * waveCos * 25;

      // Golden billionaire glow
      const goldShift = Math.sin(phase + i * 0.01) * 40;
      const r = Math.min(255, p.targetColor[0] + 50 + goldShift);
      const g = Math.min(255, p.targetColor[1] + 35 + goldShift * 0.6);
      const b = Math.min(255, p.targetColor[2] - 20);

      ctx.fillStyle = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;

      ctx.beginPath();
      ctx.arc(rx, ry, (p.size / 2) * (1 + wave * 0.3), 0, Math.PI * 2);
      ctx.fill();
    }

    // Overlay glowing badge
    ctx.save();
    ctx.font = 'bold 24px Outfit, Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f5c453';
    ctx.shadowColor = '#f5c453';
    ctx.shadowBlur = 15;
    ctx.fillText('RECURSIVE ADANI OVERLOAD', size / 2, size - 40);
    ctx.font = '14px Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 5;
    ctx.fillText('∞ Infinite Gautam Adani Energy ∞', size / 2, size - 18);
    ctx.restore();
  }
}

window.AdaniAlgorithm = AdaniAlgorithm;
