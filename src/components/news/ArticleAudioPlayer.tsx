import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, FastForward, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ArticleAudioPlayerProps {
  title: string;
  contentHtml?: string;
  excerpt?: string;
}

export function ArticleAudioPlayer({ title, contentHtml, excerpt }: ArticleAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [rate, setRate] = useState<number>(1);
  const [progress, setProgress] = useState<number>(0);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const estimatedDurationRef = useRef<number>(60);

  // Extract clean plain text from html
  const extractText = useCallback(() => {
    let raw = title + '. ';
    if (contentHtml) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = contentHtml;
      // Remove scripts, embeds, etc.
      const scripts = tempDiv.querySelectorAll('script, style, figure, audio, video');
      scripts.forEach(s => s.remove());
      raw += tempDiv.textContent || tempDiv.innerText || '';
    } else if (excerpt) {
      raw += excerpt;
    }
    return raw.replace(/\s+/g, ' ').trim();
  }, [title, contentHtml, excerpt]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  const startProgress = (textLength: number) => {
    // Average speaking speed: ~15 chars per second at 1x
    const estSecs = Math.max(15, (textLength / 15) / rate);
    estimatedDurationRef.current = estSecs;
    startTimeRef.current = Date.now();

    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    progressTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const pct = Math.min(99, Math.round((elapsed / estimatedDurationRef.current) * 100));
      setProgress(pct);
    }, 500);
  };

  const stopProgress = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  const handlePlay = () => {
    if (!isSupported) {
      toast.error('Text-to-speech is not supported on this browser.');
      return;
    }

    if (isPaused && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();

    const fullText = extractText();
    if (!fullText) return;

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    // Pick best English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium')));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      startProgress(fullText.length);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      stopProgress();
      setTimeout(() => setProgress(0), 1000);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      stopProgress();
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
      stopProgress();
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    stopProgress();
  };

  const toggleRate = () => {
    const nextRate = rate === 1 ? 1.25 : rate === 1.25 ? 1.5 : rate === 1.5 ? 2 : 1;
    setRate(nextRate);
    if (isPlaying) {
      handleStop();
      setTimeout(() => handlePlay(), 100);
    }
  };

  if (!isSupported) return null;

  return (
    <div className="my-6 p-4 rounded-2xl bg-card border border-border/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
          isPlaying
            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 animate-pulse'
            : 'bg-primary/10 text-primary'
        }`}>
          <Headphones className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Listen to this story</span>
            {isPlaying && (
              <span className="flex items-center gap-0.5">
                <span className="w-1 h-3 bg-primary animate-pulse rounded-full" />
                <span className="w-1 h-4 bg-primary animate-pulse delay-75 rounded-full" />
                <span className="w-1 h-2 bg-primary animate-pulse delay-150 rounded-full" />
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">AI Audio Reader • Hands-free listening</p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center">
        {isPlaying ? (
          <Button
            size="sm"
            onClick={handlePause}
            variant="outline"
            className="h-9 px-3 gap-1.5 text-xs font-semibold"
          >
            <Pause className="h-4 w-4" /> Pause
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handlePlay}
            className="h-9 px-4 gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
          >
            <Play className="h-4 w-4 fill-current" /> {isPaused ? 'Resume' : 'Play Audio'}
          </Button>
        )}

        {(isPlaying || isPaused) && (
          <Button
            size="icon"
            variant="ghost"
            onClick={handleStop}
            className="h-9 w-9 text-muted-foreground hover:text-headline"
            title="Stop audio"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={toggleRate}
          className="h-9 px-2.5 text-xs font-bold text-muted-foreground hover:text-headline"
          title="Change playback speed"
        >
          {rate}x
        </Button>
      </div>

      {/* Progress Line */}
      {progress > 0 && (
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden sm:hidden mt-2">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
