'use client';

import React, { useState } from 'react';
import { Member } from '@/types';
import { Lock, CheckCircle2, Smartphone, KeyRound, Shield } from 'lucide-react';

interface AuthModalProps {
  members: Member[];
  currentMember: Member | null;
  onSelectMember: (member: Member, pin: string, rememberDevice: boolean) => Promise<boolean>;
  isOpen: boolean;
  onClose?: () => void;
}

export function AuthModal({ members, currentMember, onSelectMember, isOpen, onClose }: AuthModalProps) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(currentMember || members[0] || null);
  const [pin, setPin] = useState('');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    setError(null);
    setLoading(true);

    try {
      const ok = await onSelectMember(selectedMember, pin, rememberDevice);
      if (!ok) {
        setError(`Incorrect PIN for ${selectedMember.name}`);
      } else {
        setPin('');
      }
    } catch {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md p-6 sm:p-7 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 transition-all">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">DealSquad Access</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select your name and enter your 4-digit PIN
            </p>
          </div>
        </div>

        {/* 4 Member Name Selector (NO DPs, NO about section - User req #2) */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          {members.map((m) => {
            const isSelected = selectedMember?.id === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setSelectedMember(m);
                  setPin('');
                  setError(null);
                }}
                className={`py-3 px-4 rounded-2xl border text-center transition-all cursor-pointer font-bold text-sm flex items-center justify-center gap-2 ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200'
                }`}
              >
                <span>{m.name}</span>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
              </button>
            );
          })}
        </div>

        {/* PIN Input Form */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Enter PIN for {selectedMember?.name}
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="4-digit PIN"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-mono text-center tracking-widest text-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>
            {error && (
              <p className="mt-1.5 text-xs text-rose-500 font-semibold">{error}</p>
            )}
          </div>

          {/* Remember Device Permanently Checkbox */}
          <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                Remember this device permanently
              </span>
              <p className="text-[11px] text-slate-500">No PIN required on this device next time</p>
            </div>
          </label>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-1">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading || pin.length < 4}
              className="flex-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
            >
              {loading ? 'Verifying...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
