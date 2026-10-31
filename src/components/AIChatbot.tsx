'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, User, Bot, Loader2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const QUICK_PROMPTS = [
  'Recommend a signature fragrance',
  'Artisanal beverage flavour systems',
  'Dispatch lead times & logistics',
  'Custom R&D laboratory formulation',
];

export const AIChatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Greetings. I am your **Flavour & Fragrances Concierge**.\n\nWhether you desire an artisanal olfactory recommendation, insights into our supercritical taste extractions, or order inquiries, I am at your service.',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [messages, open]);

  const handleSend = async (messageToSend?: string) => {
    const text = (messageToSend || input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!messageToSend) setInput('');
    setLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: historyPayload }),
      });

      const data = (await res.json()) as { reply?: string; error?: string };

      if (res.ok && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'model',
            text: data.reply || '',
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'model',
            text: data.error || 'Our concierge service is momentarily occupied. Please contact our team directly at [Contact Us](/contact).',
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          text: 'We are experiencing temporary latency. Please visit our [Contact Us](/contact) page for immediate support.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Minimal markdown formatter for links and bolding
  const formatContent = (content: string) => {
    const parts = content.split('\n\n');
    return parts.map((part, pIdx) => {
      const formatted = part.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <p
          key={pIdx}
          className="mb-2 last:mb-0 leading-relaxed text-xs font-light"
          dangerouslySetInnerHTML={{
            __html: formatted.replace(
              /\[(.*?)\]\((.*?)\)/g,
              '<a href="$2" class="text-[#8C733E] font-medium underline underline-offset-2 hover:text-[#B89758]">$1</a>'
            ),
          }}
        />
      );
    });
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open AI Luxury Concierge"
            className="group flex items-center gap-2.5 bg-[#111312] px-4 py-2.5 text-[#FAF9F5] shadow-2xl border border-[#8C733E]/40 transition-all duration-300 hover:border-[#8C733E] cursor-pointer"
          >
            <div className="flex h-4 w-4 items-center justify-center text-[#8C733E]">
              <Sparkles className="h-3 w-3" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Atelier Concierge</span>
          </button>
        )}
      </div>

      {/* Chat Window */}
      {open && (
        <aside
          aria-label="Atelier Virtual Concierge"
          className="fixed bottom-6 right-6 z-50 flex h-[560px] w-[370px] flex-col border border-[#111312]/20 bg-[#FAF9F5] shadow-2xl backdrop-blur-xl transition-all duration-300 sm:w-[420px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#111312]/15 bg-[#111312] px-5 py-4 text-[#FAF9F5]">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center border border-[#8C733E]/40 text-[#8C733E]">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-light tracking-wide text-[#FAF9F5]">
                  Atelier Concierge
                </h3>
                <div className="flex items-center gap-1.5 font-mono text-[9px] text-[#FAF9F5]/60 uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Geneva Laboratory Service</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 text-[#FAF9F5]/60 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs text-[#111312]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'model' && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center border border-[#111312]/20 bg-[#111312] text-[#8C733E]">
                    <Bot className="h-3 w-3" />
                  </div>
                )}
                <div
                  className={`max-w-[84%] p-3.5 ${
                    m.role === 'user'
                      ? 'bg-[#111312] text-[#FAF9F5]'
                      : 'bg-white border border-[#111312]/10 shadow-xs'
                  }`}
                >
                  {formatContent(m.text)}
                </div>
                {m.role === 'user' && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-[#8C733E] text-[#111312]">
                    <User className="h-3 w-3" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-[#111312]/50 text-xs italic p-2 font-mono text-[10px]">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#8C733E]" />
                <span>Formulating organoleptic response...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 border-t border-[#111312]/8 bg-white/70">
              <p className="font-mono text-[9px] uppercase tracking-wider text-[#8C733E] mb-1.5">
                Popular Inquiries
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="border border-[#111312]/15 bg-white px-2.5 py-1 font-mono text-[10px] text-[#111312]/80 hover:border-[#8C733E] hover:text-[#8C733E] transition-colors cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 border-t border-[#111312]/10 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Inquire about a fragrance, flavour accord, or order..."
                className="flex-1 border border-[#111312]/15 bg-[#FAF9F5] px-3.5 py-2 text-xs text-[#111312] placeholder:text-[#111312]/40 focus:border-[#111312] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                aria-label="Send message"
                className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#111312] text-[#FAF9F5] disabled:opacity-40 hover:bg-[#8C733E] transition-colors cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </aside>
      )}
    </>
  );
};
