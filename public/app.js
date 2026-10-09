// ===================================================
// ElevenOS Studio - Frontend Controller (Ultra-Natural)
// ===================================================

document.addEventListener('DOMContentLoaded', () => {
  // State
  let voices = [];
  let selectedVoice = null;
  let activeEngine = 'edge-neural';
  let currentFilter = 'all';
  let uploadedCloneFile = null;
  let currentAudioUrl = null;

  // Key Modal Elements
  const btnKeyModal = document.getElementById('btn-key-modal');
  const keyModal = document.getElementById('key-modal');
  const btnCloseKeyModal = document.getElementById('btn-close-key-modal');
  const elevenlabsKeyInput = document.getElementById('elevenlabs-key-input');
  const btnToggleKey = document.getElementById('btn-toggle-key');
  const btnSaveKey = document.getElementById('btn-save-key');
  const btnUseFreeMode = document.getElementById('btn-use-free-mode');
  const headerKeyDot = document.getElementById('header-key-dot');
  const headerKeyText = document.getElementById('header-key-text');

  // Navigation Tabs & Modes
  const tabTts = document.getElementById('tab-tts');
  const tabClone = document.getElementById('tab-clone');
  const tabDeploy = document.getElementById('tab-deploy');
  const modeTts = document.getElementById('mode-tts');
  const modeClone = document.getElementById('mode-clone');
  const modeDeploy = document.getElementById('mode-deploy');

  // TTS Controls
  const voiceCardsContainer = document.getElementById('voice-cards-container');
  const enginePills = document.querySelectorAll('.engine-pill');
  const filterChips = document.querySelectorAll('.filter-chip');

  const ttsInputText = document.getElementById('tts-input-text');
  const langDetectBadge = document.getElementById('lang-detect-badge');
  const charNum = document.getElementById('char-num');
  const speedSlider = document.getElementById('speed-slider');
  const speedVal = document.getElementById('speed-val');
  const pitchSlider = document.getElementById('pitch-slider');
  const pitchVal = document.getElementById('pitch-val');

  const btnGenerateTts = document.getElementById('btn-generate-tts');
  const btnTtsText = document.getElementById('btn-tts-text');
  const ttsSpinner = document.getElementById('tts-spinner');

  // Clone Controls
  const dropZone = document.getElementById('audio-drop-zone');
  const cloneFileInput = document.getElementById('clone-file-input');
  const filePreviewPill = document.getElementById('file-preview-pill');
  const filePreviewName = document.getElementById('file-preview-name');
  const btnRemoveFile = document.getElementById('btn-remove-file');
  const cloneRefTranscript = document.getElementById('clone-ref-transcript');
  const cloneTargetText = document.getElementById('clone-target-text');
  const btnCloneTts = document.getElementById('btn-clone-tts');
  const btnCloneText = document.getElementById('btn-clone-text');
  const cloneSpinner = document.getElementById('clone-spinner');

  // Audio Player Elements
  const mainAudio = document.getElementById('main-audio-element');
  const btnPlayPause = document.getElementById('btn-play-pause');
  const iconPlay = document.getElementById('icon-play');
  const iconPause = document.getElementById('icon-pause');
  const btnReplay = document.getElementById('btn-replay');
  const btnDownloadAudio = document.getElementById('btn-download-audio');
  const playerTitle = document.getElementById('player-title');
  const playerSubtitle = document.getElementById('player-subtitle');
  const currentTimeLabel = document.getElementById('current-time');
  const totalTimeLabel = document.getElementById('total-time');
  const canvas = document.getElementById('visualizer-canvas');
  const canvasCtx = canvas.getContext('2d');

  // History & Toast
  const historyContainer = document.getElementById('history-container');
  const btnRefreshHistory = document.getElementById('btn-refresh-history');
  const toastMessage = document.getElementById('toast-message');

  // API Modal
  const btnOpenApi = document.getElementById('btn-open-api');
  const apiModal = document.getElementById('api-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');

  // Helper: Detect Hindi / Devanagari text
  function isHindi(text) {
    return /[\u0900-\u097F]/.test(text);
  }

  // Show Toast
  function showToast(msg, isError = false) {
    toastMessage.textContent = msg;
    toastMessage.style.borderColor = isError ? '#EF4444' : '#8B5CF6';
    toastMessage.classList.add('show');
    setTimeout(() => toastMessage.classList.remove('show'), 4000);
  }

  // Manage API Key UI & State
  function updateApiKeyStatus() {
    const savedKey = localStorage.getItem('elevenlabs_api_key');
    if (savedKey && savedKey.trim().length > 5) {
      if (headerKeyDot) {
        headerKeyDot.classList.remove('inactive');
      }
      if (headerKeyText) headerKeyText.textContent = '🌟 ElevenLabs Active';
      if (elevenlabsKeyInput) elevenlabsKeyInput.value = savedKey;
      activeEngine = 'elevenlabs';
    } else {
      if (headerKeyDot) {
        headerKeyDot.classList.add('inactive');
      }
      if (headerKeyText) headerKeyText.textContent = 'ElevenLabs Key';
      activeEngine = 'edge-neural';
    }
    // Update active engine pill
    enginePills.forEach(p => {
      if (p.dataset.engine === activeEngine) p.classList.add('active');
      else p.classList.remove('active');
    });
  }

  updateApiKeyStatus();

  // Open / Close Key Modal
  if (btnKeyModal) {
    btnKeyModal.addEventListener('click', () => {
      keyModal.classList.add('active');
    });
  }
  if (btnCloseKeyModal) {
    btnCloseKeyModal.addEventListener('click', () => {
      keyModal.classList.remove('active');
    });
  }
  if (btnToggleKey) {
    btnToggleKey.addEventListener('click', () => {
      const type = elevenlabsKeyInput.type === 'password' ? 'text' : 'password';
      elevenlabsKeyInput.type = type;
      btnToggleKey.textContent = type === 'password' ? '👁️' : '🙈';
    });
  }
  if (btnSaveKey) {
    btnSaveKey.addEventListener('click', () => {
      const key = elevenlabsKeyInput.value.trim();
      if (!key) {
        showToast('Please paste a valid ElevenLabs key or choose Free Mode', true);
        return;
      }
      localStorage.setItem('elevenlabs_api_key', key);
      updateApiKeyStatus();
      keyModal.classList.remove('active');
      showToast('ElevenLabs API Key Activated! Enjoy ultra-natural voices.');
      renderVoices();
    });
  }
  if (btnUseFreeMode) {
    btnUseFreeMode.addEventListener('click', () => {
      activeEngine = 'edge-neural';
      enginePills.forEach(p => {
        if (p.dataset.engine === 'edge-neural') p.classList.add('active');
        else p.classList.remove('active');
      });
      keyModal.classList.remove('active');
      showToast('Switched to 100% Free Studio Neural Mode!');
      renderVoices();
    });
  }

  // Navigation Switching
  function switchTab(tabId) {
    [tabTts, tabClone, tabDeploy].forEach(t => t.classList.remove('active'));
    [modeTts, modeClone, modeDeploy].forEach(m => m.classList.remove('active'));

    if (tabId === 'tts') {
      tabTts.classList.add('active');
      modeTts.classList.add('active');
    } else if (tabId === 'clone') {
      tabClone.classList.add('active');
      modeClone.classList.add('active');
    } else if (tabId === 'deploy') {
      tabDeploy.classList.add('active');
      modeDeploy.classList.add('active');
    }
  }

  tabTts.addEventListener('click', () => switchTab('tts'));
  tabClone.addEventListener('click', () => switchTab('clone'));
  tabDeploy.addEventListener('click', () => switchTab('deploy'));

  // Sliders
  speedSlider.addEventListener('input', (e) => {
    speedVal.textContent = `${e.target.value}x`;
  });
  pitchSlider.addEventListener('input', (e) => {
    pitchVal.textContent = `${e.target.value}%`;
  });

  // Text Input & Hindi Auto-Detection
  function checkTextLanguage() {
    const text = ttsInputText.value;
    charNum.textContent = text.length;

    if (isHindi(text)) {
      if (langDetectBadge) langDetectBadge.style.display = 'inline-block';
      // If currently on an English-only voice, auto-route to best Hindi voice
      if (selectedVoice && selectedVoice.engine === 'kokoro') {
        const hasKey = !!localStorage.getItem('elevenlabs_api_key');
        if (hasKey) {
          selectedVoice = voices.find(v => v.engine === 'elevenlabs') || selectedVoice;
        } else {
          selectedVoice = voices.find(v => v.id === 'hi-IN-MadhurNeural') || voices.find(v => v.id === 'hi-IN-SwaraNeural') || selectedVoice;
          activeEngine = 'edge-neural';
          enginePills.forEach(p => {
            if (p.dataset.engine === 'edge-neural') p.classList.add('active');
            else p.classList.remove('active');
          });
        }
        renderVoices();
      }
    } else {
      if (langDetectBadge) langDetectBadge.style.display = 'none';
    }
  }

  ttsInputText.addEventListener('input', checkTextLanguage);

  // Preset Buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      ttsInputText.value = btn.dataset.text;
      checkTextLanguage();
    });
  });

  // Engine Selector
  enginePills.forEach(pill => {
    pill.addEventListener('click', () => {
      const targetEngine = pill.dataset.engine;
      if (targetEngine === 'elevenlabs' && !localStorage.getItem('elevenlabs_api_key')) {
        keyModal.classList.add('active');
      }
      enginePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeEngine = targetEngine;
      renderVoices();
    });
  });

  // Filter Chips
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.dataset.filter;
      renderVoices();
    });
  });

  // Fetch Voices from Backend
  async function loadVoices() {
    try {
      const res = await fetch('/api/voices');
      const data = await res.json();
      if (data.voices) {
        voices = data.voices;
        const hasKey = !!localStorage.getItem('elevenlabs_api_key');
        const initialIsHindi = isHindi(ttsInputText.value);

        if (hasKey) {
          selectedVoice = voices.find(v => v.engine === 'elevenlabs') || voices[0];
          activeEngine = 'elevenlabs';
        } else if (initialIsHindi) {
          selectedVoice = voices.find(v => v.id === 'hi-IN-MadhurNeural') || voices[0];
          activeEngine = 'edge-neural';
          if (langDetectBadge) langDetectBadge.style.display = 'inline-block';
        } else {
          selectedVoice = voices[0];
        }

        enginePills.forEach(p => {
          if (p.dataset.engine === activeEngine) p.classList.add('active');
          else p.classList.remove('active');
        });

        renderVoices();
      }
    } catch (err) {
      console.error('Failed to load voices:', err);
      showToast('Could not fetch voices list', true);
    }
  }

  // Render Voices Cards
  function renderVoices() {
    voiceCardsContainer.innerHTML = '';

    const filtered = voices.filter(v => {
      if (activeEngine === 'kokoro' && v.engine !== 'kokoro') return false;
      if (activeEngine === 'elevenlabs' && v.engine !== 'elevenlabs') return false;

      if (currentFilter === 'all') return true;
      if (currentFilter === 'elevenlabs') return v.engine === 'elevenlabs';
      if (currentFilter === 'kokoro') return v.engine === 'kokoro';
      if (currentFilter === 'hi-IN') return v.lang === 'hi-IN' || v.lang === 'en-IN';
      if (currentFilter === 'en-US') return v.lang === 'en-US';
      if (currentFilter === 'en-GB') return v.lang === 'en-GB';
      return true;
    });

    if (filtered.length === 0) {
      voiceCardsContainer.innerHTML = '<div style="color: #6B7280; font-size: 0.85rem; padding: 12px;">No matching voices. Try "All" filter chip.</div>';
      return;
    }

    filtered.forEach(v => {
      const isSelected = selectedVoice && selectedVoice.id === v.id;
      const card = document.createElement('div');
      card.className = `voice-card ${isSelected ? 'selected' : ''}`;

      const flagEmoji = v.flag || '🎙️';
      let badgeHtml = '';
      if (v.badge === 'Ultra-Natural') {
        badgeHtml = '<span class="voice-card-badge badge-ultra">🌟 Ultra-Natural</span>';
      } else if (v.badge === 'SOTA 82M') {
        badgeHtml = '<span class="voice-card-badge badge-sota">🚀 Kokoro SOTA</span>';
      } else {
        badgeHtml = '<span class="voice-card-badge badge-free">⚡ Free Studio</span>';
      }

      card.innerHTML = `
        <div class="voice-card-avatar">${flagEmoji}</div>
        <div class="voice-card-info">
          <div class="voice-card-name">${v.name}</div>
          <div class="voice-card-tag">${v.lang.toUpperCase()} • ${v.engine.toUpperCase()}</div>
          ${badgeHtml}
        </div>
      `;

      card.addEventListener('click', () => {
        selectedVoice = v;
        activeEngine = v.engine;

        // If ElevenLabs voice selected and no key present, offer modal
        if (v.engine === 'elevenlabs' && !localStorage.getItem('elevenlabs_api_key')) {
          keyModal.classList.add('active');
        }

        enginePills.forEach(p => {
          if (p.dataset.engine === v.engine) p.classList.add('active');
          else p.classList.remove('active');
        });

        renderVoices();
        playerTitle.textContent = `${v.name}`;
        playerSubtitle.textContent = v.desc;
      });

      voiceCardsContainer.appendChild(card);
    });
  }

  // Dropzone for voice cloning
  dropZone.addEventListener('click', () => cloneFileInput.click());
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      handleSelectedAudioFile(e.dataTransfer.files[0]);
    }
  });

  cloneFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleSelectedAudioFile(e.target.files[0]);
    }
  });

  function handleSelectedAudioFile(file) {
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(wav|mp3|m4a|ogg|webm|flac)$/i)) {
      showToast('Please upload a valid audio file (.wav, .mp3)!', true);
      return;
    }
    uploadedCloneFile = file;
    filePreviewName.textContent = file.name;
    filePreviewPill.style.display = 'inline-flex';
    dropZone.style.display = 'none';
    showToast(`Loaded voice sample: ${file.name}`);
  }

  btnRemoveFile.addEventListener('click', (e) => {
    e.stopPropagation();
    uploadedCloneFile = null;
    cloneFileInput.value = '';
    filePreviewPill.style.display = 'none';
    dropZone.style.display = 'block';
  });

  // TTS Synthesis Trigger
  btnGenerateTts.addEventListener('click', async () => {
    const text = ttsInputText.value.trim();
    if (!text) {
      showToast('Please enter text to synthesize!', true);
      return;
    }

    const savedKey = localStorage.getItem('elevenlabs_api_key') || '';
    if (activeEngine === 'elevenlabs' && !savedKey) {
      keyModal.classList.add('active');
      showToast('Please enter your ElevenLabs Key, or switch to Free Studio Mode!', true);
      return;
    }

    const voiceId = selectedVoice ? selectedVoice.id : 'hi-IN-MadhurNeural';
    const rate = parseFloat(speedSlider.value) || 1.0;
    const pitch = parseFloat(pitchSlider.value) || 0;

    btnGenerateTts.disabled = true;
    btnTtsText.textContent = 'Generating Voice...';
    ttsSpinner.style.display = 'block';

    try {
      const res = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: voiceId,
          engine: activeEngine,
          rate,
          pitch,
          apiKey: savedKey
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      if (data.warning) {
        showToast(data.warning);
      } else {
        showToast('Speech generated successfully!');
      }

      loadAndPlayAudio(data.audioUrl, selectedVoice ? selectedVoice.name : 'Generated Audio', text);
      loadHistory();
    } catch (err) {
      console.error('TTS error:', err);
      showToast(`Error: ${err.message}`, true);
    } finally {
      btnGenerateTts.disabled = false;
      btnTtsText.textContent = 'Generate Speech';
      ttsSpinner.style.display = 'none';
    }
  });

  // Voice Clone Handler (F5-TTS)
  btnCloneTts.addEventListener('click', async () => {
    if (!uploadedCloneFile) {
      showToast('Please upload a reference audio sample first!', true);
      return;
    }
    const text = cloneTargetText.value.trim();
    if (!text) {
      showToast('Please enter target dialogue for the cloned voice!', true);
      return;
    }

    btnCloneTts.disabled = true;
    btnCloneText.textContent = 'Cloning Voice & Synthesizing...';
    cloneSpinner.style.display = 'block';

    const formData = new FormData();
    formData.append('referenceAudio', uploadedCloneFile);
    formData.append('text', text);
    formData.append('refText', cloneRefTranscript.value.trim());

    try {
      const res = await fetch('/api/tts/clone', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cloning failed');

      if (data.warning) showToast(data.warning);
      else showToast('Voice cloned successfully!');

      loadAndPlayAudio(data.audioUrl, 'Cloned Voice (F5-TTS)', text);
      loadHistory();
    } catch (err) {
      console.error('Cloning error:', err);
      showToast(`Clone Error: ${err.message}`, true);
    } finally {
      btnCloneTts.disabled = false;
      btnCloneText.textContent = 'Clone Voice & Synthesize';
      cloneSpinner.style.display = 'none';
    }
  });

  // Audio Playback Controller
  function loadAndPlayAudio(url, title, subtitle) {
    currentAudioUrl = url;
    mainAudio.src = url;
    playerTitle.textContent = title;
    playerSubtitle.textContent = subtitle ? `"${subtitle.substring(0, 50)}..."` : '';
    btnDownloadAudio.href = url;
    btnDownloadAudio.download = url.split('/').pop();

    mainAudio.play().then(() => {
      iconPlay.style.display = 'none';
      iconPause.style.display = 'block';
    }).catch(e => {
      console.log('Autoplay deferred, user can press play:', e);
      iconPlay.style.display = 'block';
      iconPause.style.display = 'none';
    });
  }

  btnPlayPause.addEventListener('click', () => {
    if (mainAudio.paused) {
      mainAudio.play();
      iconPlay.style.display = 'none';
      iconPause.style.display = 'block';
    } else {
      mainAudio.pause();
      iconPlay.style.display = 'block';
      iconPause.style.display = 'none';
    }
  });

  btnReplay.addEventListener('click', () => {
    mainAudio.currentTime = 0;
    mainAudio.play();
  });

  mainAudio.addEventListener('timeupdate', () => {
    const cur = formatTime(mainAudio.currentTime);
    const dur = formatTime(mainAudio.duration || 0);
    currentTimeLabel.textContent = cur;
    totalTimeLabel.textContent = dur;
  });

  mainAudio.addEventListener('ended', () => {
    iconPlay.style.display = 'block';
    iconPause.style.display = 'none';
  });

  function formatTime(secs) {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // Draw simulated waveform bars
  function drawPlaceholderWave() {
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    const bars = 45;
    const barWidth = canvas.width / bars;
    canvasCtx.fillStyle = '#8B5CF6';

    for (let i = 0; i < bars; i++) {
      const height = Math.sin(i * 0.25) * 20 + 25;
      const x = i * barWidth;
      const y = (canvas.height - height) / 2;
      canvasCtx.fillRect(x + 2, y, barWidth - 4, height);
    }
  }
  drawPlaceholderWave();

  // Load Audio History
  async function loadHistory() {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      historyContainer.innerHTML = '';

      if (data.history && data.history.length > 0) {
        data.history.forEach(item => {
          const el = document.createElement('div');
          el.className = 'history-item';
          el.innerHTML = `
            <div class="history-info">
              <span class="history-name">${item.filename}</span>
              <span class="history-time">${new Date(item.createdAt).toLocaleTimeString()} • ${(item.size / 1024).toFixed(1)} KB</span>
            </div>
            <div class="history-btns">
              <button class="history-action-btn play-btn" data-url="${item.url}">▶ Play</button>
              <a class="history-action-btn" href="${item.url}" download="${item.filename}">⬇</a>
            </div>
          `;
          el.querySelector('.play-btn').addEventListener('click', () => {
            loadAndPlayAudio(item.url, item.filename, 'Generated Clip');
          });
          historyContainer.appendChild(el);
        });
      } else {
        historyContainer.innerHTML = '<div class="empty-history">No audio clips generated yet.</div>';
      }
    } catch (e) {
      console.warn('Could not load history:', e);
    }
  }

  btnRefreshHistory.addEventListener('click', loadHistory);

  // API Modal Handlers
  btnOpenApi.addEventListener('click', () => apiModal.classList.add('active'));
  btnCloseModal.addEventListener('click', () => apiModal.classList.remove('active'));

  // Close modals on outside click
  window.addEventListener('click', (e) => {
    if (e.target === apiModal) apiModal.classList.remove('active');
    if (e.target === keyModal) keyModal.classList.remove('active');
  });

  // Initial Load
  loadVoices();
  loadHistory();
});
