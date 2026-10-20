import { SafetyState, ConnectionStatus, IncidentSeverity, IncidentCategory } from '../types';

export function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return isoString;
  }
}

export function formatRelativeTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    
    if (diffSec < 5) return 'just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${Math.floor(diffHr / 24)}d ago`;
  } catch {
    return isoString;
  }
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch {
    return isoString;
  }
}

export function getSafetyStateBadgeProps(state: SafetyState) {
  switch (state) {
    case 'CRITICAL':
      return {
        bg: 'bg-[#FDE8E8]',
        text: 'text-[#B52A31]',
        border: 'border-red-300',
        dot: 'bg-[#D13A3F] animate-pulse',
        label: 'CRITICAL',
      };
    case 'WARNING':
      return {
        bg: 'bg-[#FEF3C7]',
        text: 'text-[#8A5500]',
        border: 'border-amber-300',
        dot: 'bg-[#F5A524]',
        label: 'WARNING',
      };
    case 'NORMAL':
      return {
        bg: 'bg-[#EAF7EE]',
        text: 'text-[#1E6B42]',
        border: 'border-emerald-300',
        dot: 'bg-[#2E9E63]',
        label: 'NORMAL',
      };
    case 'STALE':
      return {
        bg: 'bg-[#F6EFEA]',
        text: 'text-[#8A5500]',
        border: 'border-amber-200',
        dot: 'bg-[#D97706]',
        label: 'STALE DATA',
      };
    case 'OFFLINE':
    default:
      return {
        bg: 'bg-[#EFE7DC]',
        text: 'text-[var(--text-3)]',
        border: 'border-[#D8CEBF]',
        dot: 'bg-[#8C8275]',
        label: 'OFFLINE',
      };
  }
}

export function getConnectionBadgeProps(status: ConnectionStatus) {
  switch (status) {
    case 'ONLINE':
      return {
        bg: 'bg-[#EAF7EE]',
        text: 'text-[#1E6B42]',
        border: 'border-emerald-300',
        dot: 'bg-[#2E9E63]',
        label: 'ONLINE',
      };
    case 'STALE':
      return {
        bg: 'bg-[#FEF3C7]',
        text: 'text-[#8A5500]',
        border: 'border-amber-300',
        dot: 'bg-[#F5A524]',
        label: 'STALE',
      };
    case 'OFFLINE':
    default:
      return {
        bg: 'bg-[#EFE7DC]',
        text: 'text-[var(--text-3)]',
        border: 'border-[#D8CEBF]',
        dot: 'bg-[#8C8275]',
        label: 'OFFLINE',
      };
  }
}

export function getIncidentCategoryDetails(category: IncidentCategory) {
  switch (category) {
    case 'SOS_EMERGENCY':
      return {
        label: 'SOS Alert Triggered',
        shortLabel: 'SOS',
        badgeBg: 'bg-[#FDE8E8] text-[#B52A31] border-red-300',
      };
    case 'HAZARDOUS_GAS':
      return {
        label: 'Hazardous Gas Detected',
        shortLabel: 'Gas Exceeded',
        badgeBg: 'bg-[#FEF3C7] text-[#8A5500] border-amber-300',
      };
    case 'HELMET_REMOVED':
      return {
        label: 'Helmet Removal Detected',
        shortLabel: 'Helmet Off',
        badgeBg: 'bg-[#FFEDD5] text-[#C2410C] border-orange-300',
      };
    case 'ENVIRONMENTAL_WARNING':
      return {
        label: 'Thermal/Humidity Hazard',
        shortLabel: 'Thermal Alert',
        badgeBg: 'bg-[#FEF9C3] text-[#A16207] border-yellow-300',
      };
    case 'DEVICE_DISCONNECTED':
      return {
        label: 'Telemetry Loss / Offline',
        shortLabel: 'Signal Lost',
        badgeBg: 'bg-[#EFE7DC] text-[var(--text-3)] border-[#D8CEBF]',
      };
  }
}

export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map(row => {
        return keys
          .map(k => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
