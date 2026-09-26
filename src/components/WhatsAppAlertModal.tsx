'use client';

import React, { useState } from 'react';
import { WishlistItem } from '@/types';
import { X, MessageCircle, Send, CheckCircle2, Sparkles, ExternalLink } from 'lucide-react';

interface WhatsAppAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: WishlistItem[];
}

export function WhatsAppAlertModal({
  isOpen,
  onClose,
  items,
}: WhatsAppAlertModalProps) {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Prepare WhatsApp broadcast message of top active deals
  const topDeals = items.slice(0, 5);
  let broadcastText = `🔥 *DealSquad Live Alerts!*\n\n`;
  topDeals.forEach((item, idx) => {
    broadcastText += `${idx + 1}. *${item.title}*\n`;
    broadcastText += `   💰 Price: *₹${item.currentPrice.toLocaleString('en-IN')}*`;
    if (item.averagePrice) {
      broadcastText += ` (30-Day Avg: ₹${item.averagePrice.toLocaleString('en-IN')})`;
    }
    broadcastText += `\n   🔗 ${item.url}\n\n`;
  });
  broadcastText += `🚀 *Track all deals live on DealSquad!*`;

  const handleOpenWhatsAppWeb = () => {
    const encoded = encodeURIComponent(broadcastText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleSendWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim()) return;

    setSending(true);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: webhookUrl.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg('✅ Test WhatsApp webhook alert sent successfully!');
      } else {
        setSuccessMsg('⚠️ Webhook delivered with response: ' + JSON.stringify(data));
      }
    } catch {
      setSuccessMsg('Error sending alert. Please verify webhook URL.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/25">
              <MessageCircle className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">WhatsApp Squad Alerts</h2>
              <p className="text-[11px] text-slate-500">Share live drops directly to your WhatsApp group</p>
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

        {/* Option 1: 1-Click Group Share */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>1-Click Send to WhatsApp Group</span>
            </h4>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mb-3">
              Formats top tracked deals with current prices and links, ready to post.
            </p>
            <button
              type="button"
              onClick={handleOpenWhatsAppWeb}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Open in WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Option 2: Automated WhatsApp Webhook */}
          <form onSubmit={handleSendWebhook} className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp Bot / Webhook URL (Optional)
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://api.whatsapp-bot.com/webhook"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                If your squad uses an automated WhatsApp bot or Zapier webhook, paste it here.
              </p>
            </div>

            {successMsg && (
              <p className="text-xs text-emerald-600 font-semibold">{successMsg}</p>
            )}

            <button
              type="submit"
              disabled={sending || !webhookUrl.trim()}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5 text-emerald-500" />
              <span>{sending ? 'Sending...' : 'Test Webhook Alert'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
