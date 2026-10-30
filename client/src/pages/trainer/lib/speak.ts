export const speak = (text: string, rate = 0.92): void => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }
  window.speechSynthesis.cancel();
  const utterance: SpeechSynthesisUtterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = rate;
  const voices: SpeechSynthesisVoice[] = window.speechSynthesis.getVoices();
  const enVoice: SpeechSynthesisVoice | undefined = voices.find(
    (v: SpeechSynthesisVoice) => /en[-_](US|GB)/i.test(v.lang),
  );
  if (enVoice) utterance.voice = enVoice;
  window.speechSynthesis.speak(utterance);
};
