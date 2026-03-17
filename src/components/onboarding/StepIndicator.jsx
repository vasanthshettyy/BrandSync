import { useState } from 'react';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

export default function StepIndicator({ steps, currentStep }) {
    return (
        <div className="flex items-center justify-center gap-0 mb-8">
            {steps.map((label, index) => {
                const stepNum = index + 1;
                const isCompleted = stepNum < currentStep;
                const isCurrent = stepNum === currentStep;
                const isLast = index === steps.length - 1;

                return (
                    <div key={label} className="flex items-center">
                        {/* Step circle */}
                        <div className="flex flex-col items-center">
                            <div
                                className={cn(
                                    'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300',
                                    isCompleted && 'bg-primary text-white',
                                    isCurrent && 'bg-primary/20 text-primary border-2 border-primary',
                                    !isCompleted && !isCurrent && 'bg-white/5 text-text-muted border border-border-dark'
                                )}
                            >
                                {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                            </div>
                            <span
                                className={cn(
                                    'text-xs mt-2 whitespace-nowrap',
                                    isCurrent ? 'text-primary font-medium' : 'text-text-muted'
                                )}
                            >
                                {label}
                            </span>
                        </div>

                        {/* Connector line */}
                        {!isLast && (
                            <div
                                className={cn(
                                    'w-16 h-0.5 mx-2 mb-5 transition-all duration-300',
                                    isCompleted ? 'bg-primary' : 'bg-border-dark'
                                )}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
