// Audio Manager - Handles audio instance and playback
export class AudioManager {
  constructor() {
    this.audio = null;
    this.currentTrack = null;
    this.isInitialized = false;
    this.destroyed = false;
    this.onError = null;
  }

  init(trackUrl, volume = 0.5) {
    if (this.audio) {
      this.cleanup();
    }

    this.destroyed = false;
    this.audio = new Audio(trackUrl);
    this.audio.loop = true;
    this.audio.volume = volume;
    this.audio.preload = 'auto';
    this.isInitialized = true;

    // Use a named handler so cleanup can detach it (avoids false errors
    // firing when an old element is intentionally destroyed on re-init).
    this._onError = (e) => {
      if (this.destroyed || !this.audio) return;
      const mediaError = this.audio.error;
      let code = 'UNKNOWN';
      if (mediaError?.code === MediaError.MEDIA_ERR_ABORTED) code = 'ABORTED';
      else if (mediaError?.code === MediaError.MEDIA_ERR_NETWORK) code = 'NETWORK';
      else if (mediaError?.code === MediaError.MEDIA_ERR_DECODE) code = 'DECODE';
      else if (mediaError?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) code = 'SRC_NOT_SUPPORTED';
      console.error(`[AudioManager] playback error (${code}):`, { src: trackUrl || this.audio.src, mediaError });
      if (this.onError) this.onError(code);
    };
    this.audio.addEventListener('error', this._onError);

    return this.audio;
  }

  async play() {
    if (!this.audio) return false;

    try {
      await this.audio.play();
      return true;
    } catch (error) {
      console.warn('Autoplay blocked. User interaction required.');
      return false;
    }
  }

  pause() {
    if (this.audio) {
      this.audio.pause();
    }
  }

  setVolume(volume) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  fadeIn(duration = 1000) {
    if (!this.audio) return;

    const targetVolume = this.audio.volume;
    this.audio.volume = 0;

    const steps = 20;
    const stepVolume = targetVolume / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep >= steps) {
        clearInterval(interval);
        return;
      }
      if (!this.audio || this.destroyed) {
        clearInterval(interval);
        return;
      }
      this.audio.volume = Math.min(targetVolume, this.audio.volume + stepVolume);
      currentStep++;
    }, stepDuration);
  }

  fadeOut(duration = 1000, thenPause = true) {
    if (!this.audio) return;

    const startVolume = this.audio.volume;
    const steps = 20;
    const stepVolume = startVolume / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep >= steps) {
        clearInterval(interval);
        if (thenPause) this.pause();
        return;
      }
      if (!this.audio || this.destroyed) {
        clearInterval(interval);
        return;
      }
      this.audio.volume = Math.max(0, this.audio.volume - stepVolume);
      currentStep++;
    }, stepDuration);
  }

  cleanup() {
    if (this.audio) {
      if (this._onError) {
        this.audio.removeEventListener('error', this._onError);
        this._onError = null;
      }
      this.destroyed = true;
      this.pause();
      this.audio.src = '';
      this.audio.load();
      this.audio = null;
    }
    this.isInitialized = false;
  }
}

export const audioManager = new AudioManager();