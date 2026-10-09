"""
Demo script showing how to use the ElevenOS Python Client
"""
from unified_tts import UnifiedTTS

def main():
    tts = UnifiedTTS("http://localhost:7860")
    
    print("--- 1. Generating English Speech (Jenny Neural) ---")
    tts.generate(
        text="Hello! This is ElevenOS, the open-source alternative to ElevenLabs.",
        voice="en-US-JennyNeural",
        output_file="demo_english.mp3"
    )

    print("\n--- 2. Generating Hindi Speech (Swara Neural) ---")
    tts.generate(
        text="नमस्ते! यह एक पूरी तरह से फ्री और ओपन सोर्स वॉइस स्टूडियो है।",
        voice="hi-IN-SwaraNeural",
        output_file="demo_hindi.mp3"
    )

    print("\n--- 3. Generating with Kokoro-82M SOTA Engine ---")
    tts.generate(
        text="Kokoro delivers ultra-realistic speech with minimal latency.",
        voice="af_heart",
        engine="kokoro",
        output_file="demo_kokoro.wav"
    )

    print("\nAll demos finished successfully!")

if __name__ == "__main__":
    main()
