export const ttsService = {
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  },

  speak(text: string, rate: number = 0.95): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isSupported()) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel(); // Stop any active speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = 1.0;
      utterance.lang = 'en-GB'; // Preferred British English for IELTS style

      // Try to find a good English voice
      const voices = window.speechSynthesis.getVoices();
      const englishVoice =
        voices.find(v => v.lang.includes('en-GB') || v.name.includes('British') || v.name.includes('Daniel') || v.name.includes('UK')) ||
        voices.find(v => v.lang.startsWith('en')) ||
        null;

      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    });
  },

  stop(): void {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
  }
};
