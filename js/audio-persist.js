/**
 * audio-persist.js
 * Saves and restores audio playback state across page navigations using localStorage.
 * Uses the same 'audioState' key as music-controller.js so all pages share state.
 */
(function () {
  const KEY = 'audioState';

  function save(audio) {
    if (!audio || !audio.src) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({
        src: audio.src,
        currentTime: audio.currentTime,
        isPlaying: !audio.paused,
        volume: audio.volume
      }));
    } catch (e) {}
  }

  function restore(audio) {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (!saved || !saved.src) return;
      audio.src = saved.src;
      audio.volume = saved.volume != null ? saved.volume : 0.5;
      audio.currentTime = saved.currentTime || 0;
      if (saved.isPlaying) {
        audio.play().catch(() => showResumeButton(audio));
      }
    } catch (e) {}
  }

  function showResumeButton(audio) {
    if (document.getElementById('_audioResume')) return;
    const btn = document.createElement('button');
    btn.id = '_audioResume';
    btn.textContent = '🎵 Resume Music';
    Object.assign(btn.style, {
      position: 'fixed', bottom: '20px', right: '20px',
      background: '#a3f7bf', border: '2px solid #000',
      borderRadius: '20px', padding: '8px 18px',
      fontFamily: "'Comic Neue', cursive", fontWeight: 'bold',
      fontSize: '0.85rem', cursor: 'pointer',
      zIndex: '8000', boxShadow: '2px 2px 0 #000',
    });
    btn.addEventListener('click', () => { audio.play(); btn.remove(); });
    document.body.appendChild(btn);
  }

  window.AudioPersist = { save, restore };

  // Auto-init: if a #backgroundAudio element exists, restore state on load
  // and save on navigation away.
  document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('backgroundAudio');
    if (!audio) return;
    restore(audio);
    window.addEventListener('beforeunload', () => save(audio));
  });
})();
