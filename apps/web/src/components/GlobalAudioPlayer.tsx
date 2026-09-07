import { useEffect, useRef } from 'react';
import { useAudioPlayerStore } from '../stores/audioPlayerStore';

export default function GlobalAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { setAudioElement, setCurrentTime, setDuration, setIsPlaying, nextTrack } = useAudioPlayerStore();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Register audio element in store
    setAudioElement(audio);

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      nextTrack();
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [setAudioElement, setCurrentTime, setDuration, setIsPlaying, nextTrack]);

  return <audio ref={audioRef} />;
}
