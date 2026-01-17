import React from 'react';

const ProgressBar = ({ label, value, maxValue = 100, color = 'var(--ethereal-cyan)', showValue = true }) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-semibold text-ethereal-text/80 font-heading tracking-wide">{label}</span>
        {showValue && (
          <span className="text-xs font-bold text-ethereal-text/60 font-heading">{value.toFixed(1)}</span>
        )}
      </div>
      <div className="w-full bg-ethereal-glass rounded-full h-2.5 overflow-hidden border border-ethereal-border/20 shadow-inner">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_15px_rgba(var(--primary),0.3)]"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}`
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
