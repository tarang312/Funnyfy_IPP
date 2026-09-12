// Camera Manager for Adanify - Handles webcam feed, countdown timer, shutter flash, and snapshot extraction
class CameraManager {
  constructor() {
    this.stream = null;
    this.videoElement = null;
    this.devices = [];
    this.currentDeviceIndex = 0;
    this.isCountdownRunning = false;
    this.countdownTimer = null;
    this.facingMode = 'user'; // 'user' or 'environment'
  }

  // Check if camera API is supported
  isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  // Get list of video input devices
  async getDevices() {
    if (!this.isSupported()) return [];
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.devices = devices.filter(d => d.kind === 'videoinput');
      return this.devices;
    } catch (err) {
      console.warn('Could not enumerate media devices:', err);
      return [];
    }
  }

  // Start the webcam stream into target video element
  async start(videoElement) {
    this.videoElement = videoElement;
    if (!this.isSupported()) {
      throw new Error('Camera access is not supported by your browser or connection.');
    }

    this.stop(); // Stop any existing stream

    const constraints = {
      video: {
        width: { ideal: 1080 },
        height: { ideal: 1080 },
        facingMode: this.facingMode
      },
      audio: false
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoElement.srcObject = this.stream;
      await this.videoElement.play();
      await this.getDevices();
      return true;
    } catch (err) {
      console.error('Error accessing camera:', err);
      if (err.name === 'NotAllowedError') {
        throw new Error('Camera permission was denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        throw new Error('No camera hardware detected on this device.');
      } else {
        throw new Error('Failed to start camera: ' + (err.message || 'Unknown error'));
      }
    }
  }

  // Switch between front and back camera or cycle devices
  async flipCamera() {
    this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
    if (this.videoElement && this.stream) {
      return this.start(this.videoElement);
    }
  }

  // Stop the camera stream and release hardware
  stop() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
      this.isCountdownRunning = false;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  // Run 3-second countdown and trigger photo capture
  startCountdown(onTick, onComplete) {
    if (this.isCountdownRunning) return;
    this.isCountdownRunning = true;

    let count = 3;
    if (window.audioManager) window.audioManager.playCountdownTick(false);
    if (onTick) onTick(count);

    this.countdownTimer = setInterval(() => {
      count--;
      if (count > 0) {
        if (window.audioManager) window.audioManager.playCountdownTick(false);
        if (onTick) onTick(count);
      } else {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        this.isCountdownRunning = false;
        if (window.audioManager) {
          window.audioManager.playCountdownTick(true);
          window.audioManager.playShutter();
        }
        if (onTick) onTick(0);
        const capturedImg = this.capture();
        if (onComplete) onComplete(capturedImg);
      }
    }, 1000);
  }

  // Instant capture without countdown
  instantCapture() {
    if (window.audioManager) window.audioManager.playShutter();
    return this.capture();
  }

  // Capture frame from video element cropped to a square (1:1)
  capture() {
    if (!this.videoElement || !this.stream) return null;

    const vw = this.videoElement.videoWidth || 640;
    const vh = this.videoElement.videoHeight || 480;
    const size = Math.min(vw, vh);

    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');

    // Calculate crop rectangle for centered square
    const sx = (vw - size) / 2;
    const sy = (vh - size) / 2;

    // Handle horizontal flip if user-facing camera
    if (this.facingMode === 'user') {
      ctx.translate(720, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(this.videoElement, sx, sy, size, size, 0, 0, 720, 720);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const img = new Image();
    img.src = dataUrl;
    return { dataUrl, img, canvas };
  }
}

window.cameraManager = new CameraManager();
