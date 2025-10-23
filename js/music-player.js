class MusicPlayer {
    constructor() {
        this.isPlaying = false;
        this.currentTrack = 0;
        this.audio = null;
        this.playlist = [
            {
                title: "Lofi Study Beats",
                artist: "Chillhop Music",
                src: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                cover: "/img/music-cover-1.jpg"
            },
            {
                title: "Peaceful Piano",
                artist: "Relaxing Music",
                src: "https://www.soundjay.com/misc/sounds/clock-ticking-3.wav",
                cover: "/img/music-cover-2.jpg"
            },
            {
                title: "Nature Sounds",
                artist: "Ambient Nature",
                src: "https://www.soundjay.com/misc/sounds/fail-buzzer-02.wav",
                cover: "/img/music-cover-3.jpg"
            }
        ];
        this.volume = 0.5;
        this.init();
    }

    init() {
        this.createPlayer();
        this.addStyles();
        this.bindEvents();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .music-player {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 320px;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 16px;
                padding: 16px;
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
                z-index: 9998;
                transform: translateY(100px);
                opacity: 0;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .music-player.visible {
                transform: translateY(0);
                opacity: 1;
            }

            .music-player.minimized {
                width: 60px;
                height: 60px;
                padding: 8px;
                border-radius: 50%;
            }

            .music-player.minimized .player-content {
                display: none;
            }

            .music-player.minimized .minimize-btn {
                display: none;
            }

            .player-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
            }

            .player-title {
                font-size: 14px;
                font-weight: 600;
                color: #333;
                margin: 0;
            }

            .minimize-btn {
                background: none;
                border: none;
                color: #666;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.2s ease;
            }

            .minimize-btn:hover {
                background: rgba(0, 0, 0, 0.1);
                color: #333;
            }

            .track-info {
                display: flex;
                align-items: center;
                margin-bottom: 16px;
            }

            .track-cover {
                width: 50px;
                height: 50px;
                border-radius: 8px;
                background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
                margin-right: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 20px;
            }

            .track-details {
                flex: 1;
                min-width: 0;
            }

            .track-title {
                font-size: 14px;
                font-weight: 600;
                color: #333;
                margin: 0 0 4px 0;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .track-artist {
                font-size: 12px;
                color: #666;
                margin: 0;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .player-controls {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 16px;
                margin-bottom: 16px;
            }

            .control-btn {
                background: rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                color: #333;
            }

            .control-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: scale(1.05);
            }

            .control-btn.play-pause {
                width: 48px;
                height: 48px;
                background: rgba(255, 255, 255, 0.3);
            }

            .progress-container {
                margin-bottom: 12px;
            }

            .progress-bar {
                width: 100%;
                height: 4px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 2px;
                overflow: hidden;
                cursor: pointer;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                width: 0%;
                transition: width 0.1s ease;
            }

            .time-display {
                display: flex;
                justify-content: space-between;
                font-size: 11px;
                color: #666;
                margin-top: 4px;
            }

            .volume-container {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .volume-icon {
                color: #666;
                cursor: pointer;
            }

            .volume-slider {
                flex: 1;
                height: 3px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 2px;
                cursor: pointer;
                position: relative;
            }

            .volume-fill {
                height: 100%;
                background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                width: 50%;
                border-radius: 2px;
            }

            @media (max-width: 768px) {
                .music-player {
                    width: 280px;
                    bottom: 10px;
                    right: 10px;
                }
            }

            @media (max-width: 480px) {
                .music-player {
                    width: calc(100vw - 20px);
                    right: 10px;
                    left: 10px;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .music-player,
                .control-btn,
                .progress-fill {
                    transition: none;
                }
                
                .control-btn:hover {
                    transform: none;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    createPlayer() {
        this.playerElement = document.createElement('div');
        this.playerElement.className = 'music-player';
        this.playerElement.innerHTML = `
            <div class="player-content">
                <div class="player-header">
                    <h3 class="player-title">🎵 Music Player</h3>
                    <button class="minimize-btn" title="Minimize">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                </div>
                
                <div class="track-info">
                    <div class="track-cover">🎵</div>
                    <div class="track-details">
                        <div class="track-title">No track selected</div>
                        <div class="track-artist">Select music to play</div>
                    </div>
                </div>
                
                <div class="player-controls">
                    <button class="control-btn prev-btn" title="Previous">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="19,20 9,12 19,4"></polygon>
                            <line x1="5" y1="19" x2="5" y2="5"></line>
                        </svg>
                    </button>
                    
                    <button class="control-btn play-pause" title="Play/Pause">
                        <svg class="play-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="5,3 19,12 5,21"></polygon>
                        </svg>
                        <svg class="pause-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
                            <rect x="6" y="4" width="4" height="16"></rect>
                            <rect x="14" y="4" width="4" height="16"></rect>
                        </svg>
                    </button>
                    
                    <button class="control-btn next-btn" title="Next">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="5,4 15,12 5,20"></polygon>
                            <line x1="19" y1="5" x2="19" y2="19"></line>
                        </svg>
                    </button>
                </div>
                
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <div class="time-display">
                        <span class="current-time">0:00</span>
                        <span class="total-time">0:00</span>
                    </div>
                </div>
                
                <div class="volume-container">
                    <div class="volume-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="11,5 6,9 2,9 2,15 6,15 11,19"></polygon>
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                    </div>
                    <div class="volume-slider">
                        <div class="volume-fill"></div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.playerElement);
        
        setTimeout(() => {
            this.playerElement.classList.add('visible');
        }, 100);
    }

    bindEvents() {
        const playPauseBtn = this.playerElement.querySelector('.play-pause');
        const prevBtn = this.playerElement.querySelector('.prev-btn');
        const nextBtn = this.playerElement.querySelector('.next-btn');
        const minimizeBtn = this.playerElement.querySelector('.minimize-btn');
        const progressBar = this.playerElement.querySelector('.progress-bar');
        const volumeSlider = this.playerElement.querySelector('.volume-slider');

        playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        prevBtn.addEventListener('click', () => this.previousTrack());
        nextBtn.addEventListener('click', () => this.nextTrack());
        minimizeBtn.addEventListener('click', () => this.toggleMinimize());
        
        progressBar.addEventListener('click', (e) => this.seekTo(e));
        volumeSlider.addEventListener('click', (e) => this.setVolume(e));
        
        this.playerElement.addEventListener('click', (e) => {
            if (this.playerElement.classList.contains('minimized')) {
                this.toggleMinimize();
            }
        });
    }

    togglePlayPause() {
        if (!this.audio) {
            this.loadTrack(this.currentTrack);
        }
        
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        if (this.audio) {
            this.audio.play().catch(e => console.log('Audio play failed:', e));
            this.isPlaying = true;
            this.updatePlayPauseButton();
        }
    }

    pause() {
        if (this.audio) {
            this.audio.pause();
            this.isPlaying = false;
            this.updatePlayPauseButton();
        }
    }

    loadTrack(index) {
        if (this.playlist[index]) {
            const track = this.playlist[index];
            
            if (this.audio) {
                this.audio.pause();
                this.audio.removeEventListener('timeupdate', this.updateProgress);
                this.audio.removeEventListener('ended', this.onTrackEnd);
            }
            
            this.audio = new Audio(track.src);
            this.audio.volume = this.volume;
            
            this.audio.addEventListener('timeupdate', () => this.updateProgress());
            this.audio.addEventListener('ended', () => this.onTrackEnd());
            this.audio.addEventListener('loadedmetadata', () => this.updateTrackInfo());
            
            this.updateTrackDisplay(track);
        }
    }

    updateTrackDisplay(track) {
        const titleEl = this.playerElement.querySelector('.track-title');
        const artistEl = this.playerElement.querySelector('.track-artist');
        
        titleEl.textContent = track.title;
        artistEl.textContent = track.artist;
    }

    updatePlayPauseButton() {
        const playIcon = this.playerElement.querySelector('.play-icon');
        const pauseIcon = this.playerElement.querySelector('.pause-icon');
        
        if (this.isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    }

    updateProgress() {
        if (this.audio) {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            const progressFill = this.playerElement.querySelector('.progress-fill');
            const currentTimeEl = this.playerElement.querySelector('.current-time');
            
            progressFill.style.width = `${progress}%`;
            currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
        }
    }

    updateTrackInfo() {
        if (this.audio) {
            const totalTimeEl = this.playerElement.querySelector('.total-time');
            totalTimeEl.textContent = this.formatTime(this.audio.duration);
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    seekTo(e) {
        if (this.audio) {
            const rect = e.target.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            this.audio.currentTime = percent * this.audio.duration;
        }
    }

    setVolume(e) {
        const rect = e.target.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        this.volume = Math.max(0, Math.min(1, percent));
        
        if (this.audio) {
            this.audio.volume = this.volume;
        }
        
        const volumeFill = this.playerElement.querySelector('.volume-fill');
        volumeFill.style.width = `${this.volume * 100}%`;
    }

    previousTrack() {
        this.currentTrack = (this.currentTrack - 1 + this.playlist.length) % this.playlist.length;
        this.loadTrack(this.currentTrack);
        if (this.isPlaying) {
            this.play();
        }
    }

    nextTrack() {
        this.currentTrack = (this.currentTrack + 1) % this.playlist.length;
        this.loadTrack(this.currentTrack);
        if (this.isPlaying) {
            this.play();
        }
    }

    onTrackEnd() {
        this.nextTrack();
    }

    toggleMinimize() {
        this.playerElement.classList.toggle('minimized');
    }

    addTrack(track) {
        this.playlist.push(track);
    }

    destroy() {
        if (this.audio) {
            this.audio.pause();
            this.audio = null;
        }
        
        if (this.playerElement && this.playerElement.parentNode) {
            this.playerElement.parentNode.removeChild(this.playerElement);
        }
    }
}

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.musicPlayer = new MusicPlayer();
    });
}