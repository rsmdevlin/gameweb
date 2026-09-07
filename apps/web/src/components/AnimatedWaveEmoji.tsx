import { motion } from 'framer-motion';

export default function AnimatedWaveEmoji({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hand base */}
      <motion.g
        animate={{
          rotate: [0, 14, -8, 14, -4, 10, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 0.5,
          ease: "easeInOut"
        }}
        style={{ originX: '0.5', originY: '0.8' }}
      >
        {/* Palm */}
        <ellipse cx="32" cy="40" rx="12" ry="16" fill="#FFDC5E" />
        <ellipse cx="32" cy="40" rx="10" ry="14" fill="#FFC850" />

        {/* Fingers */}
        <motion.rect
          x="28" y="20" width="4" height="14" rx="2" fill="#FFDC5E"
          animate={{ y: [20, 18, 20] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.9 }}
        />
        <motion.rect
          x="32" y="16" width="4" height="16" rx="2" fill="#FFDC5E"
          animate={{ y: [16, 14, 16] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.9, delay: 0.1 }}
        />
        <motion.rect
          x="36" y="18" width="4" height="15" rx="2" fill="#FFDC5E"
          animate={{ y: [18, 16, 18] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.9, delay: 0.2 }}
        />
        <motion.rect
          x="40" y="22" width="4" height="13" rx="2" fill="#FFDC5E"
          animate={{ y: [22, 20, 22] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.9, delay: 0.3 }}
        />

        {/* Thumb */}
        <ellipse cx="24" cy="38" rx="3" ry="8" fill="#FFDC5E" transform="rotate(-20 24 38)" />

        {/* Wrist */}
        <rect x="26" y="48" width="12" height="6" rx="3" fill="#FFC850" />
      </motion.g>

      {/* Motion lines */}
      <motion.g
        animate={{
          opacity: [0, 1, 0],
          x: [0, -3, -6],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatDelay: 0.7,
        }}
      >
        <path d="M 18 28 Q 16 26 14 28" stroke="#FFC850" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M 16 34 Q 14 32 12 34" stroke="#FFC850" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M 18 40 Q 16 38 14 40" stroke="#FFC850" strokeWidth="2" strokeLinecap="round" fill="none" />
      </motion.g>
    </svg>
  );
}
