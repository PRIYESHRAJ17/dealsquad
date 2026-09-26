'use client';

import React, { useState } from 'react';
import { Member } from '@/types';
import { X, CreditCard, Plus, Trash2, Check, Sparkles } from 'lucide-react';

interface ManageCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  currentMember: Member | null;
  onCardsUpdated: (memberId: string, updatedCards: string[]) => void;
}

const COMMON_FESTIVE_CARDS = [
  'SBI Cashback 5%',
  'SBI SimplyCLICK 10%',
  'HDFC Regalia Gold 10%',
  'HDFC Millennia 5%',
  'Flipkart Axis 5% Cashback',
  'Axis Bank 10% Instant',
  'Amazon Pay ICICI 5%',
  'ICICI Bank 10% Instant',
  'Myntra Kotak 7.5%',
  'OneCard Metal',
  'Tata Neu Infinity 5%',
];

export function ManageCardsModal({
  isOpen,
  onClose,
  members,
  currentMember,
  onCardsUpdated,
}: ManageCardsModalProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    currentMember?.id || members[0]?.id || 'member-3'
  );
  const [newCardInput, setNewCardInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const activeMember = members.find((m) => m.id === selectedMemberId) || members[0];
  const currentCards = activeMember?.cardsHeld || [];

  const handleSaveCards = async (newCardsList: string[]) => {
    setSaving(true);
    try {
      const res = await fetch('/api/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: selectedMemberId,
          cards: newCardsList,
        }),
      });

      if (res.ok) {
        onCardsUpdated(selectedMemberId, newCardsList);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddCard = (cardName: string) => {
    const trimmed = cardName.trim();
    if (!trimmed || currentCards.includes(trimmed)) return;
    const nextList = [...currentCards, trimmed];
    handleSaveCards(nextList);
    setNewCardInput('');
  };

  const handleRemoveCard = (cardToRemove: string) => {
    const nextList = currentCards.filter((c) => c !== cardToRemove);
    handleSaveCards(nextList);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Manage Bank Cards</h2>
              <p className="text-[11px] text-slate-500">Add cards to calculate BBD/GIF discounts</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member Selector Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-4">
          {members.map((m) => {
            const isSelected = m.id === selectedMemberId;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMemberId(m.id)}
                className={`py-2 px-1 rounded-xl text-xs font-bold text-center transition-all cursor-pointer truncate ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {m.shortName}
              </button>
            );
          })}
        </div>

        {/* Current Cards for Member */}
        <div className="mb-4 flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {activeMember.name}'s Saved Cards ({currentCards.length})
            </span>
            {savedSuccess && (
              <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                <Check className="w-3 h-3" /> Saved!
              </span>
            )}
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {currentCards.length > 0 ? (
              currentCards.map((card) => (
                <div
                  key={card}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{card}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCard(card)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                    title="Remove card"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-4 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                No cards added yet for {activeMember.name}.
              </div>
            )}
          </div>
        </div>

        {/* Add Card Input */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddCard(newCardInput);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={newCardInput}
              onChange={(e) => setNewCardInput(e.target.value)}
              placeholder="e.g. SBI Cashback 5%"
              className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={saving || !newCardInput.trim()}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          {/* Quick Select Chips */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Quick Suggestions:
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {COMMON_FESTIVE_CARDS.map((card) => {
                const alreadyHas = currentCards.includes(card);
                return (
                  <button
                    key={card}
                    type="button"
                    disabled={alreadyHas}
                    onClick={() => handleAddCard(card)}
                    className={`text-[11px] px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                      alreadyHas
                        ? 'opacity-40 border-slate-200 bg-slate-100 dark:bg-slate-800 line-through'
                        : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    + {card}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
