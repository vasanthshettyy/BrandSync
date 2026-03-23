import { motion } from 'framer-motion';
import { PAGE_SLIDE_FADE } from '../../lib/motion';

export default function PageWrapper({ children, title, subtitle }) {
    return (
        <motion.div
            layout
            className="p-6 md:p-8 w-full"
            initial={PAGE_SLIDE_FADE.initial}
            animate={PAGE_SLIDE_FADE.animate}
            transition={PAGE_SLIDE_FADE.transition}
        >
            <div className="max-w-7xl mx-auto">
                {(title || subtitle) && (
                    <div className="mb-8">
                        {title && (
                            <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary tracking-tight">
                                {title}
                            </h1>
                        )}
                        {subtitle && (
                            <p className="text-text-secondary mt-2 text-base max-w-2xl">
                                {subtitle}
                            </p>
                        )}
                    </div>
                )}
                <div className="w-full">
                    {children}
                </div>
            </div>
        </motion.div>
    );
}
