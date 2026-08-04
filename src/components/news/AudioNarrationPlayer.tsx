import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Music, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface AudioNarrationPlayerProps {
  title: string;
  excerpt: string;
  contentHtml?: string;
  readTime?: string;
  audioUrl?: string;
}

export function AudioNarrationPlayer({ title, excerpt, contentHtml, audioUrl }: AudioNarrationPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [resolvedAudioUrl, setResolvedAudioUrl] = useState<string | null>(audioUrl || null);

  // Extract MP3 URL from props or article HTML content if available
  useEffect(() => {
    if (audioUrl) {
      setResolvedAudioUrl(audioUrl);
      return;
    }

    if (contentHtml) {
      const match = contentHtml.match(/<audio[^>]*src=["']([^"']+)["']/i) || contentHtml.match(/<source[^>]*src=["']([^"']+)["']/i);
      if (match && match[1]) {
        setResolvedAudioUrl(match[1]);
      }
    }
  }, [audioUrl, contentHtml]);

  // Sync playback rate with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        toast.error('Could not play MP3 audio file.');
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (!isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSpeedChange = () => {
    const rates = [1, 1.25, 1.5, 2];
    const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 mb-8 shadow-sm">
      {/* Hidden native HTML5 Audio element */}
      {resolvedAudioUrl && (
        <audio
          ref={audioRef}
          src={resolvedAudioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          preload="metadata"
        />
      )}

      <div className="flex flex-col gap-3">
        {/* Header bar: Icon, Title & MP3 Badge */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Music className={`h-5 w-5 ${isPlaying ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-base font-bold text-headline">
                  Story Audio MP3 Track
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  MP3 Audio
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {resolvedAudioUrl ? title : 'MP3 Audio file clip'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSpeedChange}
              className="px-2 py-1 text-xs font-semibold rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors"
              title="Playback Speed"
            >
              {playbackRate}x
            </button>

            {resolvedAudioUrl && (
              <a
                href={resolvedAudioUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                title="Download MP3 file"
              >
                <Download className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        {/* Audio Progress Scrubber & Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-border/60">
          <button
            onClick={handlePlayPause}
            disabled={!resolvedAudioUrl}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-all flex-shrink-0 disabled:opacity-50"
            aria-label={isPlaying ? 'Pause MP3' : 'Play MP3'}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current ml-0.5" />
            )}
          </button>

          {/* Timeline slider */}
          <div className="flex-1 w-full flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              disabled={!resolvedAudioUrl}
              className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
            />
            <span className="text-xs font-mono text-muted-foreground w-10">
              {formatTime(duration)}
            </span>
          </div>

          {/* Mute button */}
          <button
            onClick={toggleMute}
            disabled={!resolvedAudioUrl}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors flex-shrink-0"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>

        {/* Native HTML5 fallback controls for full accessibility & direct browser controls */}
        {resolvedAudioUrl && (
          <div className="mt-1">
            <audio
              controls
              preload="metadata"
              src={resolvedAudioUrl}
              className="w-full rounded-xl h-10 shadow-inner border border-border/40"
            />
          </div>
        )}
      </div>
    </div>
  );
}
