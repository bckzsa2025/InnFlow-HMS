
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
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
    {role: 'assistant', content: "Welcome to our sanctuary. I am the InnFlow Concierge. Looking to secure a stay or check availability?"}
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

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = `You are the "InnFlow Luxury Concierge". 
TONE: Ultra-premium, helpful, efficient. 
CONTEXT: 
- Current Inventory: ${JSON.stringify(rooms.map(r => ({ id: r.id, num: r.roomNumber, type: r.roomType, rate: r.pricePerNight })))}
- Seasonal Modifiers: ${JSON.stringify(seasonalRates)}
GOAL: Guide guests to select a room and provide their contact details.
CAPABILITY: You can trigger a provisional booking. 
- Always mention rates are dynamic.
- If they want to book, use 'create_booking' tool.
- Required for booking: Name, Phone, Email, Room ID, Dates.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { role: 'user', parts: [{ text: `Instruction: ${systemInstruction}` }] },
          ...messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })),
          { role: 'user', parts: [{ text: userMsg }] }
        ],
        config: {
          tools: [{
            functionDeclarations: [{
              name: 'create_booking',
              description: 'Initializes a provisional guesthouse reservation',
              parameters: {
                type: Type.OBJECT,
                properties: {
                  guest_name: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  email: { type: Type.STRING },
                  room_id: { type: Type.STRING },
                  check_in: { type: Type.STRING },
                  check_out: { type: Type.STRING }
                },
                required: ['guest_name', 'phone', 'email', 'room_id', 'check_in', 'check_out']
              }
            }]
          }]
        }
      });

      if (response.functionCalls?.[0]) {
        onBookingIntent(response.functionCalls[0].args);
        setMessages(prev => [...prev, { role: 'assistant', content: "Marvelous choice. I've initiated your provisional stay. You'll receive a WhatsApp confirmation shortly to finalize your stay. 🥂" }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: response.text || "I apologize, my link to the inventory hub is momentarily unstable. How else can I assist?" }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I am experiencing a slight communication delay. Please use our manual booking tool below." }]);
    } finally {
      setIsLoading(false);
    }
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
                <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-500">Concierge AI</h4>
                <p className="font-bold text-sm tracking-tight leading-none mt-1">InnFlow Assistant</p>
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
