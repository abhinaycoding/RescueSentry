import React, { useState } from 'react';
import { useSentry } from '../../context/SentryContext';
import { 
  HardHat, 
  X, 
  Cpu, 
  ShieldCheck, 
  Radio, 
  Battery, 
  UserPlus, 
  MapPin, 
  Check 
} from 'lucide-react';

interface ProvisionWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_ROLES = [
  'Drill Rig Operator',
  'Blasting Lead',
  'Ventilation Specialist',
  'Underground Haulage Driver',
  'Mine Safety Inspector',
  'Electrical & Instrumentation Tech',
  'Shaft Maintenance Mechanic',
  'Geotechnical Surveyor'
];

const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

const SHIFTS = [
  'Shift A (06:00 - 14:00)',
  'Shift B (14:00 - 22:00)',
  'Shift C (22:00 - 06:00)'
];

export const ProvisionWorkerModal: React.FC<ProvisionWorkerModalProps> = ({ isOpen, onClose }) => {
  const { selectedSite, workers, addWorker } = useSentry();

  const nextWorkerNum = workers.length + 101;
  const suggestedHelmetId = `HLM-ESP32-${String(workers.length + 1).padStart(2, '0')}`;

  const [name, setName] = useState('');
  const [role, setRole] = useState(COMMON_ROLES[0]);
  const [sector, setSector] = useState(selectedSite.activeSectors[0] || 'Sector 1 - Extraction Face');
  const [helmetId, setHelmetId] = useState(suggestedHelmetId);
  const [shift, setShift] = useState(SHIFTS[0]);
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [batteryPct, setBatteryPct] = useState(96);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide the miner’s full name.');
      return;
    }
    if (!helmetId.trim()) {
      setError('Please provide the physical ESP32 Helmet ID.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await addWorker({
        name: name.trim(),
        role,
        sector,
        helmetId: helmetId.trim(),
        shift,
        bloodGroup,
        emergencyContact: emergencyContact.trim() || '+1 (555) 492-0000',
        batteryPct: Number(batteryPct)
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to provision worker');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#2A2520]/45 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div 
        className="clay-modal w-full max-w-xl p-6 sm:p-7 relative border border-[#D8CEBF]/60 text-[var(--text)] font-sans my-8 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="clay-pill-inset p-2 absolute right-5 top-5 text-[var(--text-3)] hover:text-[var(--text)] transition-colors"
          title="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 mb-6">
          <div className="clay-pill-inset p-2.5 text-[#8A5500] shrink-0">
            <HardHat className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold font-mono tracking-tight text-[var(--text)] uppercase">
              Provision Smart Helmet & Add Miner
            </h3>
            <p className="text-xs text-[var(--text-3)] font-sans font-medium mt-1">
              Pair a physical ESP32 IoT node with a miner profile. Sensor broadcasts from this Helmet ID will stream live into control room telemetry.
            </p>
          </div>
        </div>

        {error && (
          <div className="clay-critical p-3.5 rounded-2xl border border-red-300 mb-5 text-xs font-mono font-bold text-[#B52A31]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="text-xs font-mono font-bold text-[var(--text-3)] block mb-1.5 uppercase tracking-wide">
                Miner Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Liam Vance"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2 clay-input text-xs font-sans font-bold"
              />
            </div>

            {/* Role */}
            <div>
              <label className="text-xs font-mono font-bold text-[var(--text-3)] block mb-1.5 uppercase tracking-wide">
                Underground Role
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-3.5 py-2 clay-input text-xs font-sans font-bold cursor-pointer"
              >
                {COMMON_ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Smart Helmet ID */}
            <div>
              <label className="text-xs font-mono font-bold text-[var(--text-3)] block mb-1.5 uppercase tracking-wide flex items-center justify-between">
                <span>ESP32 Helmet ID *</span>
                <span className="text-[10px] text-[#8A5500] font-normal">Hardware Node</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. HLM-ESP32-09"
                  value={helmetId}
                  onChange={e => setHelmetId(e.target.value)}
                  className="w-full px-3.5 py-2 clay-input text-xs font-mono font-bold uppercase tracking-wider"
                />
                <Cpu className="w-3.5 h-3.5 text-[var(--text-3)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Sector */}
            <div>
              <label className="text-xs font-mono font-bold text-[var(--text-3)] block mb-1.5 uppercase tracking-wide">
                Assigned Mine Sector
              </label>
              <select
                value={sector}
                onChange={e => setSector(e.target.value)}
                className="w-full px-3.5 py-2 clay-input text-xs font-sans font-bold cursor-pointer"
              >
                {selectedSite.activeSectors.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Shift */}
            <div>
              <label className="text-xs font-mono font-bold text-[var(--text-3)] block mb-1.5 uppercase tracking-wide">
                Operational Shift
              </label>
              <select
                value={shift}
                onChange={e => setShift(e.target.value)}
                className="w-full px-3.5 py-2 clay-input text-xs font-sans font-bold cursor-pointer"
              >
                {SHIFTS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Blood Group */}
            <div>
              <label className="text-xs font-mono font-bold text-[var(--text-3)] block mb-1.5 uppercase tracking-wide">
                Medical Blood Group
              </label>
              <select
                value={bloodGroup}
                onChange={e => setBloodGroup(e.target.value)}
                className="w-full px-3.5 py-2 clay-input text-xs font-mono font-bold cursor-pointer"
              >
                {BLOOD_GROUPS.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            {/* Emergency Contact */}
            <div>
              <label className="text-xs font-mono font-bold text-[var(--text-3)] block mb-1.5 uppercase tracking-wide">
                Emergency Contact / VHF
              </label>
              <input
                type="text"
                placeholder="+1 (555) 492-8812"
                value={emergencyContact}
                onChange={e => setEmergencyContact(e.target.value)}
                className="w-full px-3.5 py-2 clay-input text-xs font-mono font-bold"
              />
            </div>

            {/* Initial Battery % */}
            <div>
              <label className="text-xs font-mono font-bold text-[var(--text-3)] block mb-1.5 uppercase tracking-wide flex items-center justify-between">
                <span>Initial Battery %</span>
                <span className="text-xs font-bold text-[#1E6B42]">{batteryPct}%</span>
              </label>
              <div className="flex items-center gap-2">
                <Battery className="w-4 h-4 text-[#1E6B42]" />
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={batteryPct}
                  onChange={e => setBatteryPct(Number(e.target.value))}
                  className="w-full accent-[#8A5500] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Node Provisioning Info Card */}
          <div className="clay-inset p-3.5 rounded-[20px] text-xs font-sans text-[var(--text-2)] flex items-start gap-3 mt-2">
            <ShieldCheck className="w-5 h-5 text-[#1E6B42] shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-[var(--text)] block font-mono">
                Hardware Node Pairing Confirmation
              </span>
              <p className="text-[11px] text-[var(--text-3)] mt-0.5 font-medium leading-relaxed">
                Assigning <span className="font-bold text-[var(--text)] font-mono">{helmetId || 'HLM-ESP32-XX'}</span> creates an active hardware slot with MQ-4 gas telemetry, forehead optical wear detection, and SOS dispatch capabilities.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8CEBF]/60">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="clay-button clay-btn-cream h-10 px-5 text-xs font-mono font-bold uppercase transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="clay-button clay-btn-amber h-10 px-6 text-xs font-mono font-extrabold uppercase flex items-center gap-2 transition-all shadow-md"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Provisioning...' : 'Provision & Pair Miner'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
