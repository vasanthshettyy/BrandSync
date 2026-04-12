import React from 'react';
import { BadgeCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * VerifiedBadge — A small inline badge to indicate a verified user.
 * 
 * @param {string} size - 'sm' | 'md' (default 'md')
 */
export default function VerifiedBadge({ size = 'md' }) {
    const isSm = size === 'sm';
    
    return (
        <div className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-info/20 bg-info/10 text-info font-semibold",
            isSm ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
        )}>
            <BadgeCheck size={isSm ? 12 : 14} className="fill-info/20" />
            <span>Verified</span>
        </div>
    );
}
