import { useState, useEffect, useCallback, useRef } from 'react';
import { audioManager } from '../utils/audioManager';
import { AUDIO_TRACKS, DEFAULT_TRACK, DEFAULT_VOLUME } from '../config/audioTracks';

const STORAGE_KEYS = {
  VOLUME: 'shinobi_audio_volume',
  IS_MUTED: 'shinobi_audio_muted',
  CURRENT_TRACK: 'shinobi_audio_track',
  AUTOPLAY_ATTEMPTED: 'shinobi_audio_autoplay'
};

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VOLUME);
    return saved ? parseFloat(saved) : DEFAULT_VOLUME;
  });
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IS_MUTED);
    return saved === 'true';
  });
  const [currentTrackId, setCurrentTrackId] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_TRACK) || DEFAULT_TRACK;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const previousVolumeRef = useRef(volume);
  const hasAttemptedAutoplay = useRef(false);
  const isInitialTrackEffect = useRef(true);

  const currentTrack = AUDIO_TRACKS.find(t => t.id === currentTrackId) || AUDIO_TRACKS[0];

  // Initialize audio on mount
  useEffect(() => {
    const initAudio = async () => {
      try {
        setIsLoading(true);
        audioManager.init(currentTrack.file, isMuted ? 0 : volume);

        if (!hasAttemptedAutoplay.current) {
          const autoplaySuccess = await audioManager.play();
          
          if (autoplaySuccess) {
            setIsPlaying(true);
            audioManager.fadeIn(1500);
          }
          
          hasAttemptedAutoplay.current = true;
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Audio initialization error:', err);
        setError('Failed to load audio');
        setIsLoading(false);
      }
    };

    initAudio();

    return () => {
      audioManager.cleanup();
    };
  }, []);

  // Handle track changes (skip on initial mount to avoid double-init race)
  useEffect(() => {
    if (isInitialTrackEffect.current) {
      isInitialTrackEffect.current = false;
      return undefined;
    }

    if (!audioManager.isInitialized) return undefined;

    const wasPlaying = isPlaying;
    const timer = setTimeout(() => {
      audioManager.init(currentTrack.file, isMuted ? 0 : volume);

      if (wasPlaying) {
        audioManager.play().then(() => {
          audioManager.fadeIn(500);
          setIsPlaying(true);
        });
      }
    }, wasPlaying ? 500 : 0);

    localStorage.setItem(STORAGE_KEYS.CURRENT_TRACK, currentTrackId);

    return () => clearTimeout(timer);
  }, [currentTrackId]);

  const togglePlayPause = useCallback(async () => {
    if (!audioManager.audio) return;

    if (isPlaying) {
      audioManager.fadeOut(300, true);
      setIsPlaying(false);
    } else {
      const success = await audioManager.play();
      if (success) {
        audioManager.fadeIn(300);
        setIsPlaying(true);
      } else {
        setError('Playback blocked. Click to enable audio.');
      }
    }
  }, [isPlaying]);

  const changeVolume = useCallback((newVolume) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    
    if (!isMuted) {
      audioManager.setVolume(clampedVolume);
    }
    
    localStorage.setItem(STORAGE_KEYS.VOLUME, clampedVolume.toString());
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    if (newMutedState) {
      previousVolumeRef.current = volume;
      audioManager.setVolume(0);
    } else {
      audioManager.setVolume(previousVolumeRef.current);
    }

    localStorage.setItem(STORAGE_KEYS.IS_MUTED, newMutedState.toString());
  }, [isMuted, volume]);

  const changeTrack = useCallback((trackId) => {
    const track = AUDIO_TRACKS.find(t => t.id === trackId);
    if (track) {
      setCurrentTrackId(trackId);
    }
  }, []);

  const nextTrack = useCallback(() => {
    const currentIndex = AUDIO_TRACKS.findIndex(t => t.id === currentTrackId);
    const nextIndex = (currentIndex + 1) % AUDIO_TRACKS.length;
    changeTrack(AUDIO_TRACKS[nextIndex].id);
  }, [currentTrackId, changeTrack]);

  const previousTrack = useCallback(() => {
    const currentIndex = AUDIO_TRACKS.findIndex(t => t.id === currentTrackId);
    const prevIndex = currentIndex === 0 ? AUDIO_TRACKS.length - 1 : currentIndex - 1;
    changeTrack(AUDIO_TRACKS[prevIndex].id);
  }, [currentTrackId, changeTrack]);

  return {
    isPlaying,
    volume,
    isMuted,
    currentTrack,
    isLoading,
    error,
    tracks: AUDIO_TRACKS,
    togglePlayPause,
    changeVolume,
    toggleMute,
    changeTrack,
    nextTrack,
    previousTrack
  };
};
