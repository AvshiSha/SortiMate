// Sound Effects Utility
// Mobile-friendly implementation with user interaction handling

class SoundEffects {
  constructor() {
    this.audio = null;
    this.isEnabled = true;
    this.isLoaded = false;
    this.loadAttempted = false;
    this.userInteracted = false; // Track if user has interacted
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Initialize the audio (called once)
  init() {
    if (this.loadAttempted) return; // Prevent multiple load attempts
    
    try {
      this.audio = new Audio('/sounds/coin-drop.mp3.wav');
      this.audio.preload = 'auto';
      this.audio.volume = 0.3; // Set volume to 30% to avoid being too loud
      
      // Handle load events
      this.audio.addEventListener('canplaythrough', () => {
        this.isLoaded = true;
      });
      
      this.audio.addEventListener('error', (e) => {
        console.warn('🎵 Sound effect failed to load:', e);
        this.isLoaded = false;
      });
      
      this.loadAttempted = true;
      
      // Enable sound after first user interaction on mobile
      if (this.isMobile) {
        this.enableAfterUserInteraction();
      }
    } catch (error) {
      console.warn('🎵 Sound effects not supported:', error);
      this.isEnabled = false;
    }
  }

  // Enable sound after user interaction (for mobile)
  enableAfterUserInteraction() {
    if (this.userInteracted) return; // Already enabled
    
    const enableSound = () => {
      this.userInteracted = true;
      // Remove the event listeners after first interaction
      document.removeEventListener('touchstart', enableSound);
      document.removeEventListener('click', enableSound);
    };
    
    // Listen for first user interaction
    document.addEventListener('touchstart', enableSound, { once: true });
    document.addEventListener('click', enableSound, { once: true });
  }

  // Play coin drop sound
  playCoinDrop() {
    if (this.isMobile) {
      // On mobile, check if user has interacted
      if (!this.userInteracted) {
        // Try to enable sound and play
        this.enableAfterUserInteraction();
        // Still try to play - some mobile browsers allow it
        this.playMobileSound();
        return;
      }
      // User has interacted, safe to play
      this.playMobileSound();
      return;
    }
    
    // Desktop fallback
    if (!this.isEnabled || !this.isLoaded || !this.audio) {
      return;
    }

    try {
      // Reset audio to beginning
      this.audio.currentTime = 0;
      
      // Play the sound
      const playPromise = this.audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('🎵 Failed to play sound:', error);
        });
      }
    } catch (error) {
      console.warn('🎵 Error playing sound:', error);
    }
  }

  // Mobile-specific sound playing method
  playMobileSound() {
    try {
      // Create a new audio element for each play (mobile browsers prefer this)
      const mobileAudio = new Audio('/sounds/coin-drop.mp3.wav');
      mobileAudio.volume = 0.5;
      
      // Try to play immediately
      mobileAudio.play().catch(error => {
        console.warn('🎵 Mobile sound failed:', error);
      });
    } catch (error) {
      console.warn('🎵 Mobile sound method error:', error);
    }
  }

  // Enable/disable sound effects
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  // Check if sound is available
  isAvailable() {
    return this.isEnabled && this.isLoaded;
  }
}

// Create singleton instance
const soundEffects = new SoundEffects();

// Initialize on first import
soundEffects.init();

export default soundEffects;
