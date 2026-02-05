
class AudioManager {
    constructor() {
        this.ctx = null;
        this.muted = false;
        // Try to load mute preference
        if (typeof localStorage !== 'undefined') {
            this.muted = localStorage.getItem('sound_muted') === 'true';
        }
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setMuted(isMuted) {
        this.muted = isMuted;
        localStorage.setItem('sound_muted', isMuted);
    }

    playTone(freq, type, duration, startTime = 0, vol = 0.1) {
        if (!this.ctx || this.muted) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);
        
        gain.gain.setValueAtTime(vol, this.ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + startTime);
        osc.stop(this.ctx.currentTime + startTime + duration);
    }

    playPop() {
        this.init();
        // High pitch "pop" - sine wave, short decay
        this.playTone(600, 'sine', 0.1, 0, 0.1);
        this.playTone(800, 'sine', 0.1, 0.05, 0.05);
    }

    playError() {
        this.init();
        // Low pitch "thud"
        this.playTone(150, 'triangle', 0.15, 0, 0.1);
    }

    playSuccess() {
        this.init();
        // Nice chord
        this.playTone(440, 'sine', 0.3, 0, 0.1); // A4
        this.playTone(554, 'sine', 0.3, 0.1, 0.1); // C#5
        this.playTone(659, 'sine', 0.4, 0.2, 0.1); // E5
    }

    playVictory() {
        this.init();
        // Fanfare
        const now = 0;
        const tempo = 0.15;
        
        // C Major Arpeggio up
        this.playTone(523.25, 'square', tempo, now, 0.1);       // C5
        this.playTone(659.25, 'square', tempo, now + tempo, 0.1); // E5
        this.playTone(783.99, 'square', tempo, now + tempo*2, 0.1); // G5
        this.playTone(1046.50, 'square', tempo*4, now + tempo*3, 0.1); // C6
        
        // Harmony
        this.playTone(523.25, 'sine', tempo*4, now + tempo*3, 0.1);
    }

    playAchievement() {
        this.init();
        // Sparkly sound
        this.playTone(880, 'sine', 0.1, 0, 0.05);
        this.playTone(1108, 'sine', 0.1, 0.1, 0.05);
        this.playTone(1318, 'sine', 0.4, 0.2, 0.05);
    }
}

// Singleton
const audioManager = new AudioManager();

if (typeof window !== 'undefined') {
    window.audioManager = audioManager;
}

export default audioManager;
