import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { BellOff } from 'lucide-react';
import { STAGGER_ITEM } from '../../lib/motion';

const EmptyNotifications = () => {
  return (
    <motion.div
      variants={STAGGER_ITEM}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
        <BellOff className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold mb-1">All caught up!</h3>
      <p className="text-sm text-muted-foreground max-w-[200px]">
        No new notifications to show right now.
      </p>
    </motion.div>
  );
};

export default EmptyNotifications;
