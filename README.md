# ElevenOS - Open Source ElevenLabs Alternative Studio 🎙️

**ElevenLabs ke jaisa Ultra-Natural & 100% Free Open-Source Text-to-Speech aur Voice Cloning Studio.**

Is repository me saare top voice models ek saath integrated hain:
* 🌟 **ElevenLabs Studio Engine**: Ultra-natural, 100% human-quality speech with real emotion, breathing, pauses & laughter (Hindi, English aur 29 languages).
* 🚀 **Kokoro-82M**: Super-fast, ultra-realistic SOTA voice synthesis (Zero-GPU needed).
* 🧬 **F5-TTS**: Zero-shot voice cloning (sirf 5s reference audio se kisi ki bhi aawaaz clone karein).
* ⚡ **Studio Edge Neural TTS**: 300+ human-paced voices, Hindi (`Madhur`, `Swara`), Indian English (`Neerja Expressive`), US/UK accents, emotion & pitch controls.

---

## 🌟 Quick Start (Local Run)

### Option 1: One-Click (Windows)
* Sirf [`start.bat`](start.bat) file par double-click karein! Studio automatically browser me `http://localhost:7860` par open ho jayega.

### Option 2: Terminal se
```bash
npm install
npm start
```
Browser me kholein: `http://localhost:7860`

---

## 🎙️ Natural Voice Options

1. **🌟 ElevenLabs Ultra-Natural Mode:**
   * Browser UI ke header me **"ElevenLabs Key"** par click karein.
   * Apna API key paste karein (Free key 10,000 characters/month ke saath [elevenlabs.io](https://elevenlabs.io) par milti hai).
   * Enjoy 100% genuine human-like Hindi and English studio voices (`Rachel`, `Adam`, `Antoni`, `Josh`, `Bella`, etc.).

2. **⚡ Free Studio Neural Mode (Zero API Key Needed):**
   * Default build-in mode jo bina kisi key ke 100% free chalta hai.
   * Human-cadence pacing (-3% relaxed speed) aur natural breath punctuation ke saath crystal-clear pronunciation.

3. **🧬 Zero-Shot Voice Cloning (F5-TTS):**
   * "Voice Cloning" tab me jaayein.
   * Apni ya kisi ki bhi 5–10 second ki aawaaz ka sample upload karein aur naya dialogue synthesize karein.

---

## 🚀 Deploy Anywhere (Render, Vercel, Koyeb, VPS)

### 1. Render.com (Recommended Free Backend)
1. Repository ko apne GitHub par push karein.
2. [Render.com](https://render.com) par jaayein aur **New Web Service** select karein.
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. *(Optional)* `render.yaml` blueprint pehle se included hai!

### 2. Vercel (Serverless Deploy)
`vercel.json` aur `api/index.js` pehle se configured hai:
```bash
npx vercel --prod
```

### 3. Koyeb / Railway / Docker
```bash
docker compose up -d --build
```
Aapka studio `http://your-server-ip:7860` par live chalne lagega.

---

## 🐍 Python Client SDK

Aap is studio ko apne Python projects me bhi directly use kar sakte hain:

```python
from python_client.unified_tts import UnifiedTTS

tts = UnifiedTTS("http://localhost:7860")

# 1. Hindi Speech Generate Karein (Free Studio Neural)
tts.generate(
    text="नमस्ते! यह एक बहुत ही साफ़ और नेचुरल हिंदी आवाज़ है।",
    voice="hi-IN-MadhurNeural",
    output_file="hindi.mp3"
)

# 2. ElevenLabs Ultra-Natural Speech (Optional Key)
tts.generate(
    text="Hello! This is genuine ultra-natural speech.",
    voice="21m00Tcm4TlvDq8ikWAM",
    engine="elevenlabs",
    api_key="your_elevenlabs_key",
    output_file="speech_natural.mp3"
)

# 3. Voice Cloning Karein (F5-TTS)
tts.clone(
    reference_audio_path="sample.wav",
    text="Yeh meri cloned voice me bola jaa raha hai!",
    output_file="cloned.wav"
)
```

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/status` | Server and engine health status |
| `GET` | `/api/voices` | Saari available voices aur engines ki list |
| `POST` | `/api/tts/generate` | Text to speech generation (`text`, `voice`, `engine`, `rate`, `pitch`, `apiKey`) |
| `POST` | `/api/tts/clone` | Voice clone with reference audio sample (`multipart/form-data`) |
| `GET` | `/api/history` | Generated audio history clips |
| `GET` | `/audio/:filename` | Generated audio stream / download |

---

## 📄 License
MIT License
