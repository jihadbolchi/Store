import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  MessageSquare,
  Send,
  X,
  Shield,
  User,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const LiveChatWidget: React.FC = () => {
  const {
    chatMessages,
    isChatOpen,
    setIsChatOpen,
    sendChatMessage,
    currentUser,
    isUserAdmin,
  } = useStore();

  const [inputMessage, setInputMessage] = useState('');
  const [senderName, setSenderName] = useState(currentUser?.displayName || '');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of messages
  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    setIsSending(true);
    const textToSend = inputMessage.trim();
    setInputMessage('');

    try {
      await sendChatMessage(textToSend, senderName.trim() || undefined);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          aria-label="Open Live Support Chat"
          className="fixed bottom-6 right-6 z-40 p-4 bg-[#0B6A75] hover:bg-[#084f57] active:scale-95 text-white rounded-full shadow-xl transition-all cursor-pointer flex items-center gap-2.5 group"
        >
          <div className="relative">
            <MessageSquare className="w-6 h-6 transform group-hover:scale-105 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white animate-pulse" />
          </div>
          <span className="hidden sm:inline-block font-bold text-xs pr-1">
            Live Chat
          </span>
        </button>
      )}

      {/* Floating Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-3xl border border-stone-200/90 shadow-2xl overflow-hidden flex flex-col h-[520px] max-h-[85vh] animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#005C6E] to-[#008C99] text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white border border-white/20">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm font-heading flex items-center gap-1.5">
                  <span>Dhaka Art Nook Support</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#FFA000]" />
                </h3>
                <p className="text-[11px] text-teal-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  <span>Real-time Firebase Cloud Chat</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              aria-label="Close Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFAF7]">
            {chatMessages.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-[#005C6E] flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-stone-900 font-heading">
                  Welcome to Dhaka Art Nook!
                </h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                  Have a question about resin ratios, wood blocks, delivery, or custom orders? Ask us here — messages are saved directly to our cloud database!
                </p>
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isMe =
                  (currentUser && msg.senderId === currentUser.uid) ||
                  (isUserAdmin && msg.isAdmin);

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-stone-500 px-1">
                      {msg.isAdmin ? (
                        <span className="font-bold text-[#005C6E] flex items-center gap-1 bg-teal-50 px-1.5 py-0.5 rounded-md border border-teal-200">
                          <Shield className="w-3 h-3" />
                          <span>Store Admin</span>
                        </span>
                      ) : (
                        <span className="font-medium text-stone-700">{msg.senderName}</span>
                      )}
                      <span>·</span>
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                        isMe
                          ? 'bg-[#005C6E] text-white rounded-br-xs shadow-xs'
                          : msg.isAdmin
                          ? 'bg-amber-50 text-stone-900 border border-amber-200 rounded-bl-xs shadow-2xs'
                          : 'bg-white text-stone-900 border border-stone-200 rounded-bl-xs shadow-2xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Footer */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-white border-t border-stone-200 space-y-2"
          >
            {/* Optional name prompt for guest visitors */}
            {!currentUser && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Your Name (Optional)"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3 py-1 bg-stone-50 border border-stone-200 rounded-lg text-[11px] text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#005C6E]"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#005C6E] transition-all"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isSending}
                className="p-2.5 bg-[#005C6E] hover:bg-[#004b5a] active:scale-95 text-white rounded-xl shadow-xs transition-all disabled:opacity-40 cursor-pointer"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
