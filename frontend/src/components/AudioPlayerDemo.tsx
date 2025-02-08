import React, { useRef, useEffect } from 'react';
import { useSound } from '@/contexts/SoundContext';

const AudioPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { state } = useSound();
  const { currentTrack, isPlaying, volume, loop } = state;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.loop = loop;
      if (currentTrack && currentTrack.file_url) {
        if (audioRef.current.src !== currentTrack.file_url) {
          audioRef.current.src = currentTrack.file_url;
        }
        if (isPlaying) {
          audioRef.current.play().catch((err) => {
            console.error('BGM play failed:', err);
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentTrack, isPlaying, volume, loop]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.error('BGM play failed:', err);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  return <audio ref={audioRef} />;
};

export default AudioPlayer;
