export const PREMIUM_SPRING = {
  type: 'spring',
  stiffness: 260,
  damping: 20,
};

export const PAGE_SLIDE_FADE = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: PREMIUM_SPRING,
};

export const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      ...PREMIUM_SPRING,
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
    transition: PREMIUM_SPRING,
  },
};

export const MICRO_INTERACTION = {
  whileHover: { scale: 1.01 },
  whileTap: { scale: 0.98 },
};
