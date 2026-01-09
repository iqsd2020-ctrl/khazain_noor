/**
 * AudioPlayer
 * - render(url, title?) => HTML string
 * - init() => bind controls for any rendered players
 */
const AudioPlayer = {
  currentAudio: null,

  render: (url, title = 'تشغيل الصوت') => {
    // use classes instead of fixed IDs to support multiple instances safely
    return `
      <div class="audio-player-card card" style="margin-bottom:16px; padding:12px; border-right:4px solid var(--primary);">
        <div style="display:flex; align-items:center; gap:12px;">
          <button class="btn-icon audio-toggle" type="button" aria-label="تشغيل/إيقاف" style="width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center;">
            <svg class="play-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <svg class="pause-icon hidden" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          </button>
          <div style="flex:1;">
            <div class="audio-title" style="font-weight:700; font-size:0.95rem; margin-bottom:4px; color:var(--text-main);">${title}</div>
            <div style="display:flex; align-items:center; gap:8px;">
              <input type="range" class="audio-progress" value="0" min="0" max="100" style="flex:1; height:4px; accent-color:var(--primary); cursor:pointer;">
              <span class="audio-time" style="font-size:0.75rem; color:var(--text-muted); font-family:monospace; min-width:35px;">00:00</span>
            </div>
          </div>
        </div>
        <audio class="main-audio" preload="metadata" src="${url}"></audio>
      </div>
    `;
  },

  init: () => {
    const cards = document.querySelectorAll('.audio-player-card');
    cards.forEach((card) => {
      if (card.dataset.bound === '1') return;
      card.dataset.bound = '1';

      const audio = card.querySelector('audio.main-audio');
      const toggleBtn = card.querySelector('button.audio-toggle');
      const playIcon = card.querySelector('svg.play-icon');
      const pauseIcon = card.querySelector('svg.pause-icon');
      const progress = card.querySelector('input.audio-progress');
      const timeDisplay = card.querySelector('.audio-time');

      if (!audio || !toggleBtn || !progress || !timeDisplay || !playIcon || !pauseIcon) return;

      const setPlayingUI = (isPlaying) => {
        if (isPlaying) {
          playIcon.classList.add('hidden');
          pauseIcon.classList.remove('hidden');
        } else {
          playIcon.classList.remove('hidden');
          pauseIcon.classList.add('hidden');
        }
      };

      toggleBtn.addEventListener('click', async () => {
        try {
          // pause any other currently playing audio
          if (AudioPlayer.currentAudio && AudioPlayer.currentAudio !== audio) {
            AudioPlayer.currentAudio.pause();
            AudioPlayer.currentAudio.currentTime = AudioPlayer.currentAudio.currentTime; // keep position
          }

          if (audio.paused) {
            AudioPlayer.currentAudio = audio;
            await audio.play();
            setPlayingUI(true);
          } else {
            audio.pause();
            setPlayingUI(false);
          }
        } catch (e) {
          // playback may fail without user gesture or due to browser restrictions
          console.error('Audio playback error:', e);
        }
      });

      audio.addEventListener('timeupdate', () => {
        const val = (audio.currentTime / (audio.duration || 1)) * 100;
        progress.value = String(val || 0);

        const m = Math.floor(audio.currentTime / 60);
        const s = Math.floor(audio.currentTime % 60);
        timeDisplay.innerText = `${m}:${s.toString().padStart(2, '0')}`;
      });

      progress.addEventListener('input', () => {
        const seek = (Number(progress.value) / 100) * (audio.duration || 0);
        audio.currentTime = seek;
      });

      audio.addEventListener('ended', () => {
        setPlayingUI(false);
        progress.value = '0';
      });

      audio.addEventListener('pause', () => {
        setPlayingUI(false);
      });
    });
  }
};
