import { useRef, useCallback } from 'react';

const useSoundEffect = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const bufferCache = useRef<Record<string, AudioBuffer>>({});

  // 指定したURLのサウンドをロードしてデコードする関数
  const loadSound = async (url: string): Promise<AudioBuffer> => {
    if (bufferCache.current[url]) return bufferCache.current[url];
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
    bufferCache.current[url] = audioBuffer;
    return audioBuffer;
  };

  const playSoundEffect = useCallback(async (soundUrl: string, volume: number = 1.0) => {
    try {
      const audioBuffer = await loadSound(soundUrl);
      if (!audioContextRef.current) return;
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;

      const gainNode = audioContextRef.current.createGain();
      gainNode.gain.value = volume;

      source.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      source.start(0);
    } catch (error) {
      console.error('SE play failed:', error);
    }
  }, []);

  return playSoundEffect;
};

export default useSoundEffect;
