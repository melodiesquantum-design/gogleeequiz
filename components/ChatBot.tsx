
import React, { useState, useRef, useEffect } from 'react';
import { chatWithThinking, startChatSession } from '../services/geminiService';
import { ChatMessage } from '../types';

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let response = '';
      if (isThinkingMode) {
        response = await chatWithThinking(input);
      } else {
        const session = startChatSession();
        // Simple one-off for now, but easily extendable to full history
        const result = await session.sendMessage({ message: input });
        response = result.text || "No response";
      }
      
      setMessages(prev => [...prev, { role: 'model', content: response, isThinking: isThinkingMode }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-96 h-[32rem] bg-white rounded-2xl shadow-2xl mb-4 flex flex-col border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
            <div>
              <h3 className="font-bold">Gemini Assistant</h3>
              <div className="flex items-center mt-1">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                <span className="text-xs text-indigo-100">Ready to help</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
               <button 
                onClick={() => setIsThinkingMode(!isThinkingMode)}
                className={`text-[10px] px-2 py-1 rounded-full border border-white/30 transition-colors ${isThinkingMode ? 'bg-white text-indigo-600' : 'hover:bg-white/10'}`}
                title="Thinking Mode for complex queries"
              >
                THINKING {isThinkingMode ? 'ON' : 'OFF'}
              </button>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">Ask me anything about quizzes, topics, or image editing!</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  m.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}>
                  {m.isThinking && (
                    <div className="text-[10px] uppercase font-bold text-indigo-400 mb-1">Generated with Thinking</div>
                  )}
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-none">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 flex space-x-2">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isThinkingMode ? "Ask a complex question..." : "Type a message..."}
              className="flex-1 text-sm border-0 focus:ring-0 placeholder-gray-400"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading}
              className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9-2-9-18-9 18 9 2zm0 0v-8"></path></svg>
            </button>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-indigo-700 transition-transform active:scale-90"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
      </button>
    </div>
  );
};
