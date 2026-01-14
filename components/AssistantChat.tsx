
import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, Loader2, Sparkles } from 'lucide-react';
import { Room, SeasonalRate } from '../types';

interface AssistantChatProps {
  rooms: Room[];
  seasonalRates?: SeasonalRate[];
  onBookingIntent: (data: any) => void;
}

const AssistantChat: React.FC<AssistantChatProps> = ({ rooms, seasonalRates = [], onBookingIntent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    {role: 'assistant', content: "Welcome to InnFlex. I am your automated concierge. How can I assist you with your booking today?"}
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    // Simulate network delay for natural feel
    setTimeout(() => {
      const lowerMsg = userMsg.toLowerCase();
      let responseText = "I can assist with room information and booking procedures. Please use the interactive grid to select a room.";

      if (lowerMsg.includes('book') || lowerMsg.includes('reservation') || lowerMsg.includes('room')) {
        responseText = "To make a reservation, please tap on an available room in the schematic selector above, verify the dates, and click 'Confirm Availability'.";
      } else if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('rate')) {
        responseText = "Our rates are dynamic based on the season. Please select a room to view the specific pricing for your dates.";
      } else if (lowerMsg.includes('check in') || lowerMsg.includes('check out') || lowerMsg.includes('time')) {
        responseText = "Check-in time starts at 14:00. Check-out is required by 10:00 on your day of departure.";
      } else if (lowerMsg.includes('contact') || lowerMsg.includes('phone') || lowerMsg.includes('email')) {
        responseText = "You can reach reception directly at +27 82 000 0000 or via email at hello@oceanwhisper.com.";
      } else if (lowerMsg.includes('help')) {
        responseText = "I can help with: Booking instructions, Check-in times, Contact details, and Pricing inquiries.";
      }

      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      {!isOpen ? (
        <button onClick={() => setIsOpen(true)} className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all border border-white/10 group">
          <Sparkles size={28} className="group-hover:rotate-12 transition-transform" />
        </button>
      ) : (
        <div className="w-[400px] h-[600px] bg-white rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-12 duration-500">
          <div className="bg-slate-950 p-8 flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg"><Bot size={24} /></div>
              <div>
                <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-500">Auto-Concierge</h4>
                <p className="font-bold text-sm tracking-tight leading-none mt-1">InnFlex Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-5 rounded-[1.5rem] text-sm font-semibold leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white shadow-xl' : 'bg-white text-slate-800 border border-slate-100 shadow-sm'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl border border-slate-100"><Loader2 size={16} className="animate-spin text-blue-600" /></div>
              </div>
            )}
          </div>
          <div className="p-6 bg-white border-t border-slate-100 flex gap-3">
            <input type="text" placeholder="Ask about rooms or rates..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} className="flex-1 p-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none border border-slate-200 focus:border-blue-500 transition-all" />
            <button onClick={handleSendMessage} className="h-14 w-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-black transition-all shadow-xl active:scale-95"><Send size={20} /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssistantChat;
