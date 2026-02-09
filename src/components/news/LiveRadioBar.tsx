import { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

export function LiveRadioBar() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <motion.div 
      className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-y border-border/50"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="container">
        <div className="flex items-center justify-between py-3 gap-4">
          {/* Left: Label */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-primary">
              <Radio className="h-4 w-4" />
              <span className="text-sm font-medium hidden sm:inline">Listen Live on</span>
              <span className="font-serif font-semibold">NVM Radio</span>
            </div>
          </div>

          {/* Center: Player controls */}
          <div className="flex items-center gap-4 flex-1 max-w-md mx-auto">
            {/* Play/Pause */}
            <motion.button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </motion.button>

            {/* Live indicator and status */}
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-live/10 border border-live/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-live"></span>
                </span>
                <span className="text-xs font-bold text-live uppercase tracking-wider">Live</span>
              </div>
              <span className="text-sm text-muted-foreground hidden md:inline">NVM Live Stream</span>
            </div>

            {/* Volume */}
            <motion.button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </motion.button>
          </div>

          {/* Right: Visual waveform indicator */}
          <div className="hidden lg:flex items-center gap-0.5 h-6">
            {[1, 2, 3, 4, 5].map((bar) => (
              <motion.div
                key={bar}
                className="w-1 bg-primary/60 rounded-full"
                animate={isPlaying ? {
                  height: ['8px', '20px', '12px', '24px', '8px'],
                } : { height: '8px' }}
                transition={{
                  duration: 0.8,
                  repeat: isPlaying ? Infinity : 0,
                  delay: bar * 0.1,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
