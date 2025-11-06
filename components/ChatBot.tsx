import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { ChatMessage } from '../types';
import { SendIcon, BotIcon, UserIcon } from './icons';
import { Spinner } from './Spinner';

const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center flex-shrink-0">
          <BotIcon className="text-brand-primary" />
        </div>
      )}
      <div className={`max-w-md p-3 rounded-lg ${isUser ? 'bg-brand-accent text-brand-primary' : 'bg-brand-secondary text-brand-text'}`}>
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
      </div>
       {isUser && (
        <div className="w-8 h-8 rounded-full bg-brand-secondary flex items-center justify-center flex-shrink-0">
          <UserIcon />
        </div>
      )}
    </div>
  );
};


export const ChatBot: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chat = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!process.env.API_KEY) {
            setError("API_KEY yapılandırılmamış.");
            return;
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chat.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: 'Bir yazar veya yönetmen için arkadaş canlısı ve yardımsever bir yaratıcı asistansın. Kısa ve ilham verici cevaplar ver.',
            },
        });
        setMessages([{ role: 'model', text: 'Merhaba! Yaratıcı sürecinize bugün nasıl yardımcı olabilirim?' }]);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isTyping || !chat.current) return;
        
        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);
        setError(null);
        
        try {
            const response = await chat.current.sendMessage({ message: input });
            const botMessage: ChatMessage = { role: 'model', text: response.text };
            setMessages(prev => [...prev, botMessage]);
        } catch (err) {
            console.error("Sohbet robotu hatası:", err);
            setError("Üzgünüm, bir yanıt alamadım. Lütfen tekrar deneyin.");
        } finally {
            setIsTyping(false);
        }
    };
    
    return (
        <div className="flex flex-col h-[75vh] max-w-2xl mx-auto bg-brand-secondary rounded-lg shadow-2xl">
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <MessageBubble key={index} message={msg} />
                ))}
                {isTyping && (
                   <div className="flex items-start gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center flex-shrink-0">
                          <BotIcon className="text-brand-primary" />
                        </div>
                        <div className="max-w-md p-3 rounded-lg bg-brand-secondary text-brand-text">
                           <Spinner />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            {error && <p className="p-4 text-sm text-center text-brand-error">{error}</p>}
            <div className="p-4 border-t border-brand-primary/50">
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Yaratıcı fikirler sorun..."
                        className="flex-1 bg-brand-primary/50 border border-brand-secondary focus:ring-2 focus:ring-brand-accent focus:outline-none rounded-md py-2 px-4 text-brand-text transition-all"
                        disabled={isTyping}
                    />
                    <button type="submit" disabled={!input.trim() || isTyping} className="bg-brand-accent text-brand-primary p-2.5 rounded-full hover:bg-opacity-80 transition-colors disabled:bg-brand-subtext disabled:cursor-not-allowed">
                        <SendIcon />
                    </button>
                </form>
            </div>
        </div>
    );
};