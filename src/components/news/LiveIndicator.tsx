import { motion } from 'framer-motion';

interface LiveIndicatorProps {
  className?: string;
  label?: string;
}

export function LiveIndicator({ className = '', label = 'LIVE' }: LiveIndicatorProps) {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <motion.span 
        className="relative flex h-2 w-2"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.span
          className="absolute inline-flex h-full w-full rounded-full bg-live opacity-75"
          animate={{ scale: [1, 1.5, 1], opacity: [0.75, 0, 0.75] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-live" />
      </motion.span>
      <span className="text-xs font-bold text-live tracking-wider uppercase">
        {label}
      </span>
    </div>
  );
}
