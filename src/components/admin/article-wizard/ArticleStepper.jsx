import React from 'react';
import { Type, WholeWord, Image as ImageIcon, Send, Check } from 'lucide-react';

const steps = [
  { id: 1, label: 'Info', icon: Type },
  { id: 2, label: 'Content', icon: WholeWord },
  { id: 3, label: 'Images', icon: ImageIcon },
  { id: 4, label: 'Publish', icon: Send }
];

const ArticleStepper = ({ currentStep, setCurrentStep, isEdit }) => {
  return (
    <div className="w-full px-4 py-3 border-b border-white/[0.06] bg-black/20 flex justify-between items-center relative">
      {/* Background Line */}
      <div className="absolute top-1/2 left-8 right-8 h-[2px] bg-white/5 -translate-y-1/2 z-0 hidden sm:block" />
      
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isPast = currentStep > step.id;
        const canClick = isEdit || step.id <= currentStep;
        
        return (
          <div 
            key={step.id} 
            className={`relative z-10 flex flex-col items-center gap-1.5 flex-1 ${canClick ? 'cursor-pointer group' : 'cursor-not-allowed opacity-50'}`} 
            onClick={() => {
              if (canClick) {
                setCurrentStep(step.id);
              }
            }}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-[var(--accent)] text-black shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)] scale-110' : isPast ? 'bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30' : 'bg-white/5 text-white/40 border border-white/10 group-hover:bg-white/10 group-hover:text-white/70'}`}>
               {isPast ? <Check size={14} /> : <Icon size={isActive ? 16 : 14} />}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isActive ? 'text-[var(--accent)]' : isPast ? 'text-white/80' : 'text-white/40 group-hover:text-white/60'} hidden sm:block`}>
              {step.label}
            </span>
            
            {/* Mobile label fallback */}
            <span className={`text-[9px] font-bold uppercase tracking-widest sm:hidden ${isActive ? 'text-[var(--accent)]' : 'text-transparent'}`}>
               {isActive ? step.label : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ArticleStepper;
