// src/hooks/useSoundEffect.ts
import { useCallback, useRef } from 'react';

const useSoundEffect = () => {
  const audioCache = useRef<Record<string, HTMLAudioElement>>({});

  const playSoundEffect = useCallback((soundUrl: string, volume: number = 1.0) => {
    let audio = audioCache.current[soundUrl];
    if (!audio) {
      audio = new Audio(soundUrl);
      audioCache.current[soundUrl] = audio;
    }
    audio.volume = volume;
    audio.currentTime = 0;
    audio.play().catch((err) => console.error('SE play failed:', err));
  }, []);

  return playSoundEffect;
};

export default useSoundEffect;
