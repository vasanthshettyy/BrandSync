export const PREMIUM_SPRING = {
  type: 'spring',
  stiffness: 260,
  damping: 20,
};

export const AGRO_SPRING = { 
  type: 'spring', 
  stiffness: 220, 
  damping: 28, 
  mass: 1, 
  restDelta: 0.001 
};

export const MICRO_SPRING = { 
  type: 'spring', 
  stiffness: 400, 
  damping: 30 
};

export const SUPER_SMOOTH = { 
  ease: [0.22, 1, 0.36, 1], 
  duration: 0.4 
};

export const FLUID_SPRING = {
  type: 'spring',
  stiffness: 120,
  damping: 24,
  mass: 0.8,
  restDelta: 0.001
};

export const PAGE_SLIDE_FADE = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: AGRO_SPRING,
};

export const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      ...AGRO_SPRING,
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

export const STAGGER_ITEM = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: AGRO_SPRING,
  },
};

export const MICRO_INTERACTION = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
};
