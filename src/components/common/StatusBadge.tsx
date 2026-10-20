import React from 'react';
import { SafetyState, ConnectionStatus } from '../../types';
import { ShieldAlert, ShieldCheck, AlertTriangle, WifiOff, HardHat, Clock } from 'lucide-react';

interface SafetyBadgeProps {
  state: SafetyState;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export const SafetyBadge: React.FC<SafetyBadgeProps> = ({ state, showIcon = true, size = 'sm' }) => {
  let bg = 'bg-[#F6F0E8] text-[#5C544B] border border-[#E6DDD0]';
  let label = 'Normal';
  let icon = <ShieldCheck className="w-3.5 h-3.5 text-[#1E6B42]" strokeWidth={2} />;

  switch (state) {
    case 'CRITICAL':
      bg = 'bg-[#F8C9C6] text-[#B52A31] border border-[#F4A5A0] shadow-sm';
      label = 'Critical';
      icon = <ShieldAlert className="w-3.5 h-3.5 text-[#B52A31]" strokeWidth={2} />;
      break;
    case 'WARNING':
      bg = 'bg-[#FCE7B8] text-[#8A5500] border border-[#FAD785] shadow-sm';
      label = 'Warning';
      icon = <AlertTriangle className="w-3.5 h-3.5 text-[#8A5500]" strokeWidth={2} />;
      break;
    case 'NORMAL':
      bg = 'bg-[#CDEBD9] text-[#1E6B42] border border-[#A6DCBA] shadow-sm';
      label = 'Normal';
      icon = <ShieldCheck className="w-3.5 h-3.5 text-[#1E6B42]" strokeWidth={2} />;
      break;
    case 'STALE':
      bg = 'bg-[#FCE7B8] text-[#8A5500] border border-[#FAD785]';
      label = 'Stale data';
      icon = <Clock className="w-3.5 h-3.5 text-[#8A5500]" strokeWidth={2} />;
      break;
    case 'OFFLINE':
    default:
      bg = 'bg-[#EFE7DC] text-[#6B6258] border border-[#D9CEBF]';
      label = 'Offline';
      icon = <WifiOff className="w-3.5 h-3.5 text-[#6B6258]" strokeWidth={2} />;
      break;
  }

  return (
    <span 
      className={`inline-flex items-center gap-1.5 font-sans font-bold rounded-full px-3 py-1 text-xs tracking-normal ${bg}`}
    >
      {showIcon && icon}
      <span>{label}</span>
    </span>
  );
};

export const ConnectionBadge: React.FC<{ status: ConnectionStatus; size?: 'sm' | 'md' }> = ({ status }) => {
  let bg = 'bg-[#CDEBD9] text-[#1E6B42] border border-[#A6DCBA]';
  let label = 'Online';
  let dotColor = 'bg-[#2E9E63]';

  if (status === 'STALE') {
    bg = 'bg-[#FCE7B8] text-[#8A5500] border border-[#FAD785]';
    label = 'Stale';
    dotColor = 'bg-[#F5A524]';
  } else if (status === 'OFFLINE') {
    bg = 'bg-[#EFE7DC] text-[#6B6258] border border-[#D9CEBF]';
    label = 'Offline';
    dotColor = 'bg-[#8C8275]';
  }

  return (
    <span 
      className={`inline-flex items-center gap-1.5 font-sans font-bold rounded-full px-3 py-1 text-xs tracking-normal ${bg}`}
    >
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      <span>{label}</span>
    </span>
  );
};

export const HelmetWearBadge: React.FC<{ worn: boolean }> = ({ worn }) => {
  return (
    <span 
      className={`inline-flex items-center gap-1.5 font-sans font-bold rounded-full px-3 py-1 text-xs tracking-normal ${
        worn 
          ? 'bg-[#CDEBD9] text-[#1E6B42] border border-[#A6DCBA]' 
          : 'bg-[#FCE7B8] text-[#8A5500] border border-[#FAD785]'
      }`}
    >
      <HardHat className="w-3.5 h-3.5" strokeWidth={2} />
      <span>{worn ? 'Worn' : 'Removed'}</span>
    </span>
  );
};
