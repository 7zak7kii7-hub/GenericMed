import React, { useState } from 'react';

interface ChatPharmacistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'pharmacist' | 'user';
  text: string;
  time: string;
}

export const ChatPharmacistModal: React.FC<ChatPharmacistModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'pharmacist',
      text: 'Hello Dr. Aris, I am Pharmacist Rajesh Kumar (KA-48192) at Apollo Med Hub. I verified your order #ORD-2026-99215. How can I assist you with your generic medication today?',
      time: '14:32'
    }
  ]);
  const [inputText, setInputText] = useState('');

  const quickPrompts = [
    'Is Paracetamol 650mg 100% bioequivalent to Dolo 650?',
    'What is the cold-chain temperature for delivery?',
    'Can I modify my delivery address before arrival?'
  ];

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Simulate pharmacist response
    setTimeout(() => {
      let reply = 'Thank you for your query. All generic salts dispensed by our licensed hub undergo HPLC dissolution and API purity verification compliant with CDSCO standard monographs.';
      const lower = text.toLowerCase();
      if (lower.includes('dolo') || lower.includes('bioequivalent')) {
        reply = 'Yes, absolutely. Both Dolo 650 and Generic Paracetamol IP 650mg contain identical 650mg Acetaminophen active pharmaceutical ingredient with 99.82% dissolution match in our lab assays.';
      } else if (lower.includes('temperature') || lower.includes('cold-chain')) {
        reply = 'Your package is sealed inside an insulated thermal container with a calibrated temperature data logger maintaining between 18°C and 24°C during courier transit.';
      } else if (lower.includes('address') || lower.includes('modify')) {
        reply = 'Suresh K. is already in transit on 100ft Road (1.4 km away). Minor adjustments within Indiranagar can be coordinated directly with Suresh via the call button.';
      }

      const pharmMsg: ChatMessage = {
        id: `p-${Date.now()}`,
        sender: 'pharmacist',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, pharmMsg]);
    }, 900);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-lg bg-surface-card rounded-t-2xl sm:rounded-2xl shadow-2xl z-10 border border-border-subtle flex flex-col h-[80vh] max-h-[650px]">
        {/* Header */}
        <div className="p-4 bg-primary text-on-primary rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">medical_services</span>
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-primary"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-headline-sm font-bold text-white leading-tight">
                  Pharmacist Rajesh Kumar
                </h3>
                <span className="material-symbols-outlined text-[16px] text-emerald-300">verified</span>
              </div>
              <span className="text-[11px] text-emerald-200">
                State Lic #KA-48192 • Apollo Med Central
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-surface-canvas">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col max-w-[85%] ${
                m.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              <div
                className={`p-3 rounded-2xl text-body-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-primary text-on-primary rounded-tr-xs'
                    : 'bg-white text-text-primary border border-border-subtle shadow-xs rounded-tl-xs'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-text-muted mt-1 px-1">{m.time}</span>
            </div>
          ))}
        </div>

        {/* Quick Prompts */}
        <div className="p-2 bg-surface-subtle border-t border-border-subtle flex gap-2 overflow-x-auto">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="shrink-0 px-2.5 py-1 rounded-full bg-white text-text-primary text-[11px] font-medium border border-border-subtle hover:bg-teal-50 hover:text-primary transition-colors active:scale-95"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-border-subtle flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your dosage or clinical question..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
            className="flex-1 px-3 py-2 bg-surface-subtle rounded-xl text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border-subtle"
          />
          <button
            onClick={() => handleSendMessage(inputText)}
            className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center hover:bg-brand-deep active:scale-95 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
