import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Rabbit } from 'lucide-react';
import { mediaService } from '../../../../services/mediaService';
import type { MediaFile } from '../../../../services/types/media';

interface AudioContentProps {
  media: MediaFile;
  className?: string;
}

const AudioContent: React.FC<AudioContentProps> = ({ media, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      setCurrentTime(current);
      setProgress((current / duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const bounds = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - bounds.left;
      const width = bounds.width;
      const percentage = x / width;
      const time = percentage * audioRef.current.duration;
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value;
    }
  };

  const handlePlaybackRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setPlaybackRate(value);
  };

  return (
    <div className={`bg-[#e9e9e9] rounded-[17px] p-4 md:p-6 ${className}`}>
      <h2 className="text-sm md:text-base font-bold text-[#4f4f61] text-center mb-4 md:mb-6">{media.title}</h2>
      
      <audio
        ref={audioRef}
        src={mediaService.getMediaUrl(media.file_path)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Progress Bar */}
      <div className="mb-3 md:mb-4">
        <div
          className="relative w-full h-1.5 bg-[#cccccc] rounded-full cursor-pointer"
          onClick={handleProgressClick}
        >
          <div
            className="absolute left-0 h-full bg-[#151523] rounded-full"
            style={{ width: `${progress}%` }}
          />
          <input
            type="range"
            value={progress}
            step="0.1"
            min="0"
            max="100"
            onChange={(e) => {
              if (audioRef.current) {
                const value = parseFloat(e.target.value);
                const time = (value / 100) * audioRef.current.duration;
                audioRef.current.currentTime = time;
              }
            }}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
            style={{
              '--range-thumb-size': '12px',
              '--range-thumb-color': '#151523'
            } as React.CSSProperties}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs md:text-sm text-secondary">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4 md:space-x-8">
        {/* Volume Control */}
        <div className="flex items-center space-x-1 md:space-x-2">
          <button
            onClick={toggleMute}
            className="text-[#706f6f] hover:text-opacity-80"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 md:h-5 md:w-5" strokeWidth={1} />
            ) : (
              <Volume2 className="h-4 w-4 md:h-5 md:w-5" strokeWidth={1} />
            )}
          </button>
          <div className="relative w-12 md:w-20 h-1">
            <div 
              className="absolute inset-0 bg-gray-200 rounded-full"
            />
            <div 
              className="absolute inset-0 bg-[#706f6f] rounded-full" 
              style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
            />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
              style={{
                '--range-thumb-size': '8px',
                '--range-thumb-color': '#706f6f'
              } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-primary text-white rounded-full hover:bg-opacity-90"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5 md:h-6 md:w-6" strokeWidth={1} />
          ) : (
            <Play className="h-5 w-5 md:h-6 md:w-6 ml-0.5 md:ml-1" strokeWidth={1} />
          )}
        </button>

        {/* Playback Speed Control */}
        <div className="flex items-center space-x-1 md:space-x-2">
          <div className="relative w-12 md:w-20 h-1">
            <div 
              className="absolute inset-0 bg-gray-200 rounded-full"
            />
            <div 
              className="absolute inset-0 bg-[#706f6f] rounded-full" 
              style={{ width: `${((playbackRate - 0.5) / 1.5) * 100}%` }}
            />
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={playbackRate}
              onChange={handlePlaybackRateChange}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
              style={{
                '--range-thumb-size': '8px',
                '--range-thumb-color': '#706f6f'
              } as React.CSSProperties}
            />
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-xs md:text-sm text-[#706f6f]">
              {playbackRate.toFixed(1)}x
            </span>
            <Rabbit className="h-3 w-3 md:h-4 md:w-4 text-[#706f6f]" strokeWidth={1} />
          </div>
        </div>
      </div>

      {media.description && (
        <p className="mt-3 md:mt-4 text-xs md:text-sm text-secondary text-center">{media.description}</p>
      )}
    </div>
  );
};

export default AudioContent;