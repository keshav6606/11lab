const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

const app = express();
const PORT = process.env.PORT || 7860;

// Enable JSON & CORS
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Directories
const OUTPUT_DIR = path.join(__dirname, 'output');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Static assets
app.use(express.static(path.join(__dirname, 'public')));
app.use('/audio', express.static(OUTPUT_DIR));
app.use('/uploads', express.static(UPLOADS_DIR));

// Multer storage for voice cloning reference audio
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.wav';
    cb(null, `ref_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/') || file.originalname.match(/\.(wav|mp3|m4a|ogg|webm|flac)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'));
    }
  }
});

// Curated Voices Catalogue
const VOICES_CATALOGUE = [
  // 🌟 ElevenLabs Ultra-Natural Voices (Multilingual v2 - Hindi + English + 29 languages)
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (ElevenLabs Natural)', engine: 'elevenlabs', lang: 'multilingual', gender: 'Female', desc: 'Calm, warm & ultra-realistic female voice', flag: '🌟', badge: 'Ultra-Natural' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam (ElevenLabs Deep Male)', engine: 'elevenlabs', lang: 'multilingual', gender: 'Male', desc: 'Deep, engaging & realistic male narrator', flag: '🌟', badge: 'Ultra-Natural' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni (ElevenLabs Natural)', engine: 'elevenlabs', lang: 'multilingual', gender: 'Male', desc: 'Friendly, clear & expressive male voice', flag: '🌟', badge: 'Ultra-Natural' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh (ElevenLabs Casual)', engine: 'elevenlabs', lang: 'multilingual', gender: 'Male', desc: 'Casual, conversational young American', flag: '🌟', badge: 'Ultra-Natural' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella (ElevenLabs Expressive)', engine: 'elevenlabs', lang: 'multilingual', gender: 'Female', desc: 'Bright, lively & emotive female voice', flag: '🌟', badge: 'Ultra-Natural' },
  { id: 'piTKgcLEGmPE4e6mEKli', name: 'Nicole (ElevenLabs Whisper)', engine: 'elevenlabs', lang: 'multilingual', gender: 'Female', desc: 'Soft, whispery & soothing tone', flag: '🌟', badge: 'Ultra-Natural' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie (ElevenLabs Aussie)', engine: 'elevenlabs', lang: 'multilingual', gender: 'Male', desc: 'Natural Australian conversational male', flag: '🌟', badge: 'Ultra-Natural' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George (ElevenLabs British)', engine: 'elevenlabs', lang: 'multilingual', gender: 'Male', desc: 'Warm, articulate British storyteller', flag: '🌟', badge: 'Ultra-Natural' },

  // 🇮🇳 Free Studio Neural Voices (Hindi & Indian English with Human Pacing)
  { id: 'hi-IN-MadhurNeural', name: 'Madhur (Hindi Male Studio)', engine: 'edge-neural', lang: 'hi-IN', gender: 'Male', desc: 'Natural Hindi, narrative tone & clear cadence', flag: '🇮🇳', badge: 'Free Neural' },
  { id: 'hi-IN-SwaraNeural', name: 'Swara (Hindi Female Studio)', engine: 'edge-neural', lang: 'hi-IN', gender: 'Female', desc: 'Expressive Hindi, warm storytelling voice', flag: '🇮🇳', badge: 'Free Neural' },
  { id: 'en-IN-NeerjaExpressiveNeural', name: 'Neerja (Indian Expressive)', engine: 'edge-neural', lang: 'en-IN', gender: 'Female', desc: 'Expressive, realistic Indian English female', flag: '🇮🇳', badge: 'Free Neural' },
  { id: 'en-IN-PrabhatNeural', name: 'Prabhat (Indian English)', engine: 'edge-neural', lang: 'en-IN', gender: 'Male', desc: 'Warm Indian English narrator', flag: '🇮🇳', badge: 'Free Neural' },

  // 🚀 Kokoro-82M (English Hyper-Realistic Zero-GPU Model)
  { id: 'af_heart', name: 'Heart (Kokoro SOTA Female)', engine: 'kokoro', lang: 'en-US', gender: 'Female', desc: 'Hyper-realistic warm American female voice', flag: '🇺🇸', badge: 'SOTA 82M' },
  { id: 'af_bella', name: 'Bella (Kokoro SOTA Female)', engine: 'kokoro', lang: 'en-US', gender: 'Female', desc: 'Bright, cheerful American female', flag: '🇺🇸', badge: 'SOTA 82M' },
  { id: 'am_adam', name: 'Adam (Kokoro SOTA Male)', engine: 'kokoro', lang: 'en-US', gender: 'Male', desc: 'Deep, confident American male narrator', flag: '🇺🇸', badge: 'SOTA 82M' },
  { id: 'am_michael', name: 'Michael (Kokoro Calm Male)', engine: 'kokoro', lang: 'en-US', gender: 'Male', desc: 'Calm & natural documentary narrator', flag: '🇺🇸', badge: 'SOTA 82M' },
  { id: 'bm_george', name: 'George (Kokoro British Male)', engine: 'kokoro', lang: 'en-GB', gender: 'Male', desc: 'Deep, distinguished British narrator', flag: '🇬🇧', badge: 'SOTA 82M' },
  { id: 'bf_emma', name: 'Emma (Kokoro British Female)', engine: 'kokoro', lang: 'en-GB', gender: 'Female', desc: 'Articulate British female voice', flag: '🇬🇧', badge: 'SOTA 82M' },

  // ⚡ Edge Neural International Voices
  { id: 'en-US-JennyNeural', name: 'Jenny (US Female)', engine: 'edge-neural', lang: 'en-US', gender: 'Female', desc: 'Friendly, natural & expressive tone', flag: '🇺🇸', badge: 'Free Neural' },
  { id: 'en-US-GuyNeural', name: 'Guy (US Male)', engine: 'edge-neural', lang: 'en-US', gender: 'Male', desc: 'Professional, warm & natural radio tone', flag: '🇺🇸', badge: 'Free Neural' },
  { id: 'en-US-AriaNeural', name: 'Aria (US Female)', engine: 'edge-neural', lang: 'en-US', gender: 'Female', desc: 'Lively, versatile & emotional', flag: '🇺🇸', badge: 'Free Neural' },
  { id: 'en-US-ChristopherNeural', name: 'Christopher (US Male)', engine: 'edge-neural', lang: 'en-US', gender: 'Male', desc: 'Authoritative audiobook narrator', flag: '🇺🇸', badge: 'Free Neural' },
  { id: 'en-GB-SoniaNeural', name: 'Sonia (UK Female)', engine: 'edge-neural', lang: 'en-GB', gender: 'Female', desc: 'Elegant British tone', flag: '🇬🇧', badge: 'Free Neural' },
  { id: 'en-GB-RyanNeural', name: 'Ryan (UK Male)', engine: 'edge-neural', lang: 'en-GB', gender: 'Male', desc: 'Modern British professional', flag: '🇬🇧', badge: 'Free Neural' }
];

// Helper: Check for Hindi/Devanagari characters
function isHindiText(text) {
  return /[\u0900-\u097F]/.test(text);
}

// Helper: Enhance text with natural human punctuation pauses & pacing
function formatNaturalPacing(text) {
  return text
    // Ensure natural space after full stops & commas
    .replace(/([।!?\.])([^\s])/g, '$1 $2')
    .replace(/([,،])([^\s])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

// 1. ElevenLabs API Speech Synthesis (Ultra-Natural)
async function generateElevenLabs(text, voiceId, apiKey, options = {}) {
  const resolvedKey = apiKey || process.env.ELEVENLABS_API_KEY;
  if (!resolvedKey) {
    throw new Error('ElevenLabs API Key required! Enter your key in Settings or use the free Edge Neural / Kokoro engines.');
  }

  const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId || '21m00Tcm4TlvDq8ikWAM'}`;
  console.log(`[ElevenLabs] Synthesizing speech with voice: ${voiceId}`);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': resolvedKey
    },
    body: JSON.stringify({
      text: formatNaturalPacing(text),
      model_id: 'eleven_multilingual_v2', // Ultra-realistic Hindi, English & 29 languages
      voice_settings: {
        stability: options.stability ? parseFloat(options.stability) : 0.5,
        similarity_boost: options.similarity_boost ? parseFloat(options.similarity_boost) : 0.75,
        style: options.style ? parseFloat(options.style) : 0.05,
        use_speaker_boost: true
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
  }

  const filename = `eleven_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.mp3`;
  const filePath = path.join(OUTPUT_DIR, filename);
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return { filename, filePath, format: 'mp3' };
}

// Lazy Kokoro loader
let kokoroInstance = null;
let kokoroLoading = false;

async function getKokoroInstance() {
  if (kokoroInstance) return kokoroInstance;
  if (kokoroLoading) {
    while (kokoroLoading) {
      await new Promise(r => setTimeout(r, 200));
    }
    return kokoroInstance;
  }
  try {
    kokoroLoading = true;
    const { KokoroTTS } = require('kokoro-js');
    console.log('[Kokoro] Loading Kokoro-82M-ONNX model...');
    kokoroInstance = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-ONNX', { dtype: 'q8' });
    console.log('[Kokoro] Model loaded successfully!');
    kokoroLoading = false;
    return kokoroInstance;
  } catch (err) {
    kokoroLoading = false;
    console.error('[Kokoro] Model load error:', err.message);
    return null;
  }
}

// 2. Edge Neural TTS with Human-Paced Natural Tuning
async function generateEdgeTTS(text, voiceId, options = {}) {
  const tts = new MsEdgeTTS();
  const format = OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3;
  await tts.setMetadata(voiceId, format);

  // Human pacing: Default slightly relaxed rate (-3%) sounds significantly more natural than robotic +0%
  let calculatedRate = '+0%';
  if (options.rate !== undefined && options.rate !== null && options.rate !== 1.0) {
    calculatedRate = `${Math.round((options.rate - 1) * 100)}%`;
  } else {
    calculatedRate = '-3%'; // Relaxed human cadence
  }

  const calculatedPitch = options.pitch ? `${Math.round((options.pitch - 1) * 100)}%` : '+0Hz';
  const cleanText = formatNaturalPacing(text);

  const filename = `tts_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.mp3`;
  const filePath = path.join(OUTPUT_DIR, filename);

  const { audioStream } = tts.toStream(cleanText, {
    rate: calculatedRate.startsWith('-') ? calculatedRate : `+${calculatedRate.replace('+', '')}`,
    pitch: calculatedPitch.startsWith('-') ? calculatedPitch : `+${calculatedPitch.replace('+', '')}`
  });

  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(filePath);
    audioStream.pipe(writeStream);
    writeStream.on('finish', () => resolve({ filename, filePath, format: 'mp3' }));
    audioStream.on('error', reject);
    writeStream.on('error', reject);
  });
}

// 3. Kokoro Ultra-Realistic Speech Synthesis (English)
async function generateKokoro(text, voiceId, options = {}) {
  // If Hindi detected, Kokoro lacks Hindi phonemes — gracefully route to Studio Hindi
  if (isHindiText(text)) {
    console.log('[Kokoro] Hindi text detected. Routing to Studio Hindi voice for natural pronunciation.');
    const fallbackVoice = (voiceId && (voiceId.startsWith('am_') || voiceId === 'bm_george')) ? 'hi-IN-MadhurNeural' : 'hi-IN-SwaraNeural';
    const res = await generateEdgeTTS(text, fallbackVoice, options);
    res.warning = 'Hindi text detected: Auto-routed to Studio Hindi Neural Voice for natural pronunciation.';
    return res;
  }

  const kokoro = await getKokoroInstance();
  if (kokoro) {
    try {
      const cleanText = formatNaturalPacing(text);
      const audio = await kokoro.generate(cleanText, { voice: voiceId || 'af_heart' });
      const filename = `kokoro_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.wav`;
      const filePath = path.join(OUTPUT_DIR, filename);
      await audio.save(filePath);
      return { filename, filePath, format: 'wav' };
    } catch (e) {
      console.warn('[Kokoro synthesis error, falling back]:', e.message);
      return await generateEdgeTTS(text, 'en-US-JennyNeural', options);
    }
  } else {
    return await generateEdgeTTS(text, 'en-US-JennyNeural', options);
  }
}

// 4. Voice Cloning with F5-TTS (SOTA Flow-Matching)
async function cloneWithF5TTS(referenceAudioPath, refText, genText) {
  try {
    const { Client } = require('@gradio/client');
    console.log('[F5-TTS] Connecting to F5-TTS SOTA Voice Cloning Engine...');
    const client = await Client.connect("mrfakename/E2-F5-TTS");

    const audioBuffer = fs.readFileSync(referenceAudioPath);
    const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });

    console.log('[F5-TTS] Predicting cloned voice audio...');
    const result = await client.predict("/predict", [
      audioBlob,
      refText || "",
      formatNaturalPacing(genText),
      false
    ]);

    if (result && result.data && result.data[0]) {
      const audioUrl = result.data[0].url || result.data[0];
      const filename = `f5_cloned_${Date.now()}.wav`;
      const filePath = path.join(OUTPUT_DIR, filename);

      const res = await fetch(audioUrl);
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(filePath, buffer);
      return { filename, filePath, format: 'wav' };
    }
    throw new Error('No audio returned from F5-TTS engine');
  } catch (err) {
    console.warn('[F5-TTS Fallback] Error:', err.message);
    const fallbackVoice = isHindiText(genText) ? 'hi-IN-MadhurNeural' : 'en-US-GuyNeural';
    const fallback = await generateEdgeTTS(genText, fallbackVoice);
    return {
      ...fallback,
      warning: 'F5-TTS cloud engine busy. Processed via High-Fidelity Studio Neural Voice.'
    };
  }
}

// ==================== ROUTES ====================

// Health / Status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    version: '1.2.0',
    platform: process.platform,
    nodeVersion: process.version,
    engines: ['elevenlabs', 'kokoro', 'edge-neural', 'f5-tts'],
    hostable: ['VPS', 'Render', 'Vercel', 'Koyeb', 'Railway', 'Docker']
  });
});

// Voices List
app.get('/api/voices', (req, res) => {
  res.json({
    success: true,
    total: VOICES_CATALOGUE.length,
    voices: VOICES_CATALOGUE
  });
});

// Generate TTS Endpoint
app.post('/api/tts/generate', async (req, res) => {
  try {
    let { text, voice = 'hi-IN-MadhurNeural', engine = 'edge-neural', rate = 1.0, pitch = 1.0, apiKey = '' } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text prompt is required!' });
    }

    text = text.trim();
    const hasHindi = isHindiText(text);

    console.log(`[Generate] Engine: ${engine}, Voice: ${voice}, Hindi: ${hasHindi}, Text: "${text.substring(0, 45)}..."`);

    let result;

    // Check if voice belongs to ElevenLabs
    const isElevenVoice = VOICES_CATALOGUE.some(v => v.id === voice && v.engine === 'elevenlabs');
    const resolvedApiKey = apiKey || process.env.ELEVENLABS_API_KEY;

    if ((engine === 'elevenlabs' || isElevenVoice) && resolvedApiKey) {
      // 1. ElevenLabs Ultra-Natural Synthesis
      result = await generateElevenLabs(text, voice, resolvedApiKey, { rate });
    } else if (engine === 'elevenlabs' && !resolvedApiKey) {
      // User chose ElevenLabs without API key: polite fallback to Studio Neural with alert
      const fallbackVoice = hasHindi ? 'hi-IN-MadhurNeural' : 'en-US-JennyNeural';
      result = await generateEdgeTTS(text, fallbackVoice, { rate, pitch });
      result.warning = 'ElevenLabs API Key not found. Generated using Studio Neural Voice. Add your free key in Settings for genuine ElevenLabs!';
    } else if (hasHindi && (engine === 'kokoro' || !voice.startsWith('hi-IN'))) {
      // 2. Hindi Text auto-routing for English-only voices
      const isMale = (voice && (voice.includes('Male') || voice.includes('Guy') || voice.includes('Adam') || voice.includes('george') || voice.includes('michael') || voice.includes('Madhur')));
      voice = isMale ? 'hi-IN-MadhurNeural' : 'hi-IN-SwaraNeural';
      result = await generateEdgeTTS(text, voice, { rate, pitch });
      result.warning = `Hindi text detected: Auto-routed to ${isMale ? 'Madhur' : 'Swara'} (Studio Hindi Voice) for natural pronunciation.`;
    } else if (engine === 'kokoro') {
      // 3. Kokoro SOTA Engine
      result = await generateKokoro(text, voice, { rate, pitch });
    } else {
      // 4. Edge Neural Expressive Engine
      result = await generateEdgeTTS(text, voice, { rate, pitch });
    }

    const audioUrl = `/audio/${result.filename}`;
    res.json({
      success: true,
      filename: result.filename,
      audioUrl,
      downloadUrl: audioUrl,
      text,
      voice,
      engine,
      warning: result.warning || null,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('[Generate Error]:', err);
    res.status(500).json({ error: err.message || 'Failed to synthesize speech' });
  }
});

// Voice Cloning Endpoint (F5-TTS)
app.post('/api/tts/clone', upload.single('referenceAudio'), async (req, res) => {
  try {
    const { text, refText = '' } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Reference audio sample is required for voice cloning!' });
    }
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Target speech text is required!' });
    }

    console.log(`[Clone] Request: File: ${file.filename}, Text: "${text.substring(0, 45)}..."`);

    const result = await cloneWithF5TTS(file.path, refText, text);
    const audioUrl = `/audio/${result.filename}`;

    res.json({
      success: true,
      filename: result.filename,
      audioUrl,
      downloadUrl: audioUrl,
      text,
      engine: 'f5-tts',
      warning: result.warning || null,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('[Clone Error]:', err);
    res.status(500).json({ error: err.message || 'Failed to clone voice' });
  }
});

// History List
app.get('/api/history', (req, res) => {
  try {
    const files = fs.readdirSync(OUTPUT_DIR)
      .filter(f => f.endsWith('.mp3') || f.endsWith('.wav'))
      .map(file => {
        const stats = fs.statSync(path.join(OUTPUT_DIR, file));
        return {
          filename: file,
          url: `/audio/${file}`,
          size: stats.size,
          createdAt: stats.mtime
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 20);

    res.json({ success: true, history: files });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch history' });
  }
});

// Delete history clip
app.delete('/api/history/:filename', (req, res) => {
  try {
    const filePath = path.join(OUTPUT_DIR, req.params.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Root Route fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server if directly executed
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('===================================================');
    console.log('🚀 ElevenOS Studio 1.2.0 (Ultra-Natural) is Live!');
    console.log(`🌐 Local URL:   http://localhost:${PORT}`);
    console.log('🌟 Engines:     ElevenLabs (Natural), Kokoro, Edge Neural, F5-TTS');
    console.log('🌍 Cloud Ready: Deployable on VPS, Render, Koyeb, Vercel');
    console.log('===================================================');
  });
}

module.exports = app;
