import { motion } from 'framer-motion';

export default function AnimatedSmileEmoji({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Face background */}
      <motion.circle
        cx="32" cy="32" r="28"
        fill="#FFDC5E"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Face shadow */}
      <circle cx="32" cy="32" r="26" fill="#FFC850" opacity="0.3" />

      {/* Left eye */}
      <motion.g
        animate={{
          scaleY: [1, 0.1, 1],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          repeatDelay: 1,
          times: [0, 0.05, 0.1]
        }}
        style={{ originY: '0.5' }}
      >
        <ellipse cx="22" cy="26" rx="3.5" ry="6" fill="#664E27" />
        <ellipse cx="23" cy="24" rx="1.5" ry="2" fill="#FFF" opacity="0.8" />
      </motion.g>

      {/* Right eye */}
      <motion.g
        animate={{
          scaleY: [1, 0.1, 1],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          repeatDelay: 1,
          times: [0, 0.05, 0.1]
        }}
        style={{ originY: '0.5' }}
      >
        <ellipse cx="42" cy="26" rx="3.5" ry="6" fill="#664E27" />
        <ellipse cx="43" cy="24" rx="1.5" ry="2" fill="#FFF" opacity="0.8" />
      </motion.g>

      {/* Smile */}
      <motion.path
        d="M 18 38 Q 32 48 46 38"
        stroke="#664E27"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        animate={{
          d: [
            "M 18 38 Q 32 48 46 38",
            "M 18 38 Q 32 50 46 38",
            "M 18 38 Q 32 48 46 38",
          ],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Cheeks */}
      <motion.circle
        cx="14" cy="34" r="4"
        fill="#FFB6C1"
        opacity="0.6"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.circle
        cx="50" cy="34" r="4"
        fill="#FFB6C1"
        opacity="0.6"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Sparkles */}
      <motion.g
        animate={{
          opacity: [0, 1, 0],
          scale: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <path d="M 8 18 L 9 20 L 11 19 L 10 21 L 12 22 L 10 23 L 11 25 L 9 24 L 8 26 L 7 24 L 5 25 L 6 23 L 4 22 L 6 21 L 5 19 L 7 20 Z" fill="#FFE57F" />
      </motion.g>

      <motion.g
        animate={{
          opacity: [0, 1, 0],
          scale: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: 0.5,
          ease: "easeInOut"
        }}
      >
        <path d="M 54 16 L 55 18 L 57 17 L 56 19 L 58 20 L 56 21 L 57 23 L 55 22 L 54 24 L 53 22 L 51 23 L 52 21 L 50 20 L 52 19 L 51 17 L 53 18 Z" fill="#FFE57F" />
      </motion.g>
    </svg>
  );
}
