"""
Unified Open-Source ElevenLabs Studio Client (Python)
Supports: ElevenLabs (Ultra-Natural), Edge-Neural (Free Studio), Kokoro-82M, F5-TTS (Voice Cloning)
"""

import os
import requests
import json

class UnifiedTTS:
    def __init__(self, api_base_url="http://localhost:7860", api_key: str = None):
        self.api_base_url = api_base_url.rstrip("/")
        self.api_key = api_key or os.getenv("ELEVENLABS_API_KEY", "")

    def get_voices(self):
        """Fetch list of available voice actors and engines"""
        res = requests.get(f"{self.api_base_url}/api/voices")
        res.raise_for_status()
        return res.json().get("voices", [])

    def generate(self, text: str, voice: str = "hi-IN-MadhurNeural", engine: str = "edge-neural", output_file: str = "output.mp3", speed: float = 1.0, api_key: str = None):
        """
        Synthesize speech from text.
        
        Args:
            text: Text script to speak (Hindi, English, etc.)
            voice: Voice ID (e.g. 'hi-IN-MadhurNeural', '21m00Tcm4TlvDq8ikWAM', 'af_heart')
            engine: 'elevenlabs', 'edge-neural', or 'kokoro'
            output_file: Destination path to save the audio
            speed: Playback speed (0.5 to 2.0)
            api_key: Optional ElevenLabs API key for Ultra-Natural voices
        """
        payload = {
            "text": text,
            "voice": voice,
            "engine": engine,
            "rate": speed,
            "apiKey": api_key or self.api_key
        }
        res = requests.post(f"{self.api_base_url}/api/tts/generate", json=payload)
        res.raise_for_status()
        data = res.json()
        
        audio_url = f"{self.api_base_url}{data['audioUrl']}"
        audio_res = requests.get(audio_url)
        audio_res.raise_for_status()

        with open(output_file, "wb") as f:
            f.write(audio_res.content)
            
        print(f"✅ Generated audio saved to: {output_file}")
        return output_file

    def clone(self, reference_audio_path: str, text: str, ref_transcript: str = "", output_file: str = "cloned_voice.wav"):
        """
        Clone any human voice using 5-10 seconds reference audio (F5-TTS).
        
        Args:
            reference_audio_path: Path to sample voice recording (.wav / .mp3)
            text: New text dialogue for the cloned voice to speak
            ref_transcript: Optional text transcript of what was spoken in the reference audio
            output_file: Destination path to save cloned audio
        """
        if not os.path.exists(reference_audio_path):
            raise FileNotFoundError(f"Reference audio not found: {reference_audio_path}")

        with open(reference_audio_path, "rb") as f:
            files = {"referenceAudio": f}
            data = {"text": text, "refText": ref_transcript}
            res = requests.post(f"{self.api_base_url}/api/tts/clone", files=files, data=data)
            res.raise_for_status()
            res_data = res.json()

        audio_url = f"{self.api_base_url}{res_data['audioUrl']}"
        audio_res = requests.get(audio_url)
        audio_res.raise_for_status()

        with open(output_file, "wb") as f:
            f.write(audio_res.content)

        print(f"✅ Cloned voice audio saved to: {output_file}")
        return output_file
