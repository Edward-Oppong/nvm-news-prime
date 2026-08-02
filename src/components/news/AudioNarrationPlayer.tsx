import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface AudioNarrationPlayerProps {
  title: string;
  excerpt: string;
  contentHtml?: string;
  readTime?: string;
}

export function AudioNarrationPlayer({ title, excerpt, contentHtml }: AudioNarrationPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getCleanText = () => {
    let plainContent = excerpt;
    if (contentHtml) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = contentHtml;
      plainContent = tempDiv.textContent || tempDiv.innerText || excerpt;
    }
    return `${title}. ${plainContent}`;
  };

  const handlePlayPause = () => {
    if (!isSupported) {
      toast.error('Audio narration is not supported in this browser.');
      return;
    }

    const synth = window.speechSynthesis;

    if (isPlaying && !isPaused) {
      synth.pause();
      setIsPaused(true);
      return;
    }

    if (isPaused) {
      synth.resume();
      setIsPaused(false);
      return;
    }

    synth.cancel();

    const fullText = getCleanText();
    const utterance = new SpeechSynthesisUtterance(fullText);
    utteranceRef.current = utterance;

    utterance.rate = playbackRate;
    utterance.pitch = 1.0;

    const voices = synth.getVoices();
    const preferredVoice = voices.find(
      (v) => v.lang.includes('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))
    ) || voices.find((v) => v.lang.includes('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    synth.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
    toast.success('Started audio story narration 🎧');
  };

  const handleStop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleSpeedChange = () => {
    const nextRate = playbackRate === 1 ? 1.25 : playbackRate === 1.25 ? 1.5 : 1;
    setPlaybackRate(nextRate);
    if (isPlaying && utteranceRef.current) {
      handleStop();
      setTimeout(handlePlayPause, 150);
    }
  };

  if (!isSupported) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            {isPlaying && !isPaused ? (
              <Volume2 className="h-5 w-5 animate-pulse" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-sm font-semibold text-headline">
                Listen to Article
              </span>
              <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                Audio
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isPlaying && !isPaused
                ? 'Narrating full story...'
                : isPaused
                ? 'Audio paused'
                : 'Click play to listen to voice narration'}
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {isPlaying && !isPaused && (
            <div className="flex items-end gap-1 h-4 px-1.5">
              {[0.4, 0.9, 0.6, 1].map((h, i) => (
                <motion.div
                  key={i}
                  className="w-0.5 bg-primary rounded-full"
                  animate={{ height: ['4px', `${h * 16}px`, '4px'] }}
                  transition={{ repeat: Infinity, duration: 0.6 + i * 0.1 }}
                />
              ))}
            </div>
          )}

          <button
            onClick={handleSpeedChange}
            className="px-2 py-1 text-xs font-semibold rounded border border-border bg-background hover:bg-muted text-foreground transition-colors"
          >
            {playbackRate}x
          </button>

          {isPlaying && (
            <button
              onClick={handleStop}
              className="p-1.5 text-xs rounded text-muted-foreground hover:text-headline hover:bg-muted transition-colors"
              title="Stop Narration"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={handlePlayPause}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs shadow-sm hover:opacity-90 transition-opacity"
          >
            {isPlaying && !isPaused ? (
              <>
                <Pause className="h-3.5 w-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{isPaused ? 'Resume' : 'Play'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
