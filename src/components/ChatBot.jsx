import { useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleChat, sendMessage, receiveMessage, clearChat } from '../store/chatSlice';

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2 animate-fade-in">
      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border font-mono text-xs"
        style={{ backgroundColor: 'var(--accent-glow)', borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)', color: 'var(--accent)' }}>
        AI
      </div>
      <div className="rounded-2xl rounded-tl-sm px-4 py-3 border"
        style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border-color)' }}>
        <div className="flex gap-1 items-center h-4">
          {[0,1,2].map((i) => (
            <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{ backgroundColor: 'var(--accent)', animationDelay: `${i*150}ms` }}/>
          ))}
        </div>
      </div>
    </div>
  );
}

function Message({ msg }) {
  const isAI = msg.role === 'ai';
  const time = new Date(msg.timestamp).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  return (
    <div className={`flex items-start gap-2 animate-slide-up ${isAI ? '' : 'flex-row-reverse'}`}>
      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-mono border"
        style={isAI
          ? { backgroundColor: 'var(--accent-glow)', borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)', color: 'var(--accent)' }
          : { backgroundColor: 'rgba(129,140,248,0.2)', borderColor: 'rgba(129,140,248,0.3)', color: '#818cf8' }}>
        {isAI ? 'AI' : 'U'}
      </div>
      <div className={`max-w-[78%] ${isAI ? '' : 'items-end flex flex-col'}`}>
        <div className="px-4 py-2.5 rounded-2xl text-sm font-body leading-relaxed border"
          style={isAI
            ? { backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '1rem 1rem 1rem 0.25rem' }
            : { backgroundColor: 'var(--accent-glow)', borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)', color: 'var(--text-primary)', borderRadius: '1rem 1rem 0.25rem 1rem' }}>
          {msg.text}
        </div>
        <span className="font-mono text-xs mt-1 px-1" style={{ color: 'var(--text-muted)' }}>{time}</span>
      </div>
    </div>
  );
}

export default function ChatBot({ floating = false }) {
  const dispatch = useDispatch();
  const { isOpen, messages, isTyping } = useSelector((s) => s.chat);
  const user = useSelector((s) => s.auth.user);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    dispatch(sendMessage(text));
    setTimeout(() => dispatch(receiveMessage()), 1200 + Math.random() * 800);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => dispatch(toggleChat())}
        className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
        style={{ backgroundColor: 'var(--accent)', boxShadow: '0 0 20px var(--accent-glow)' }}
        aria-label="Toggle chat">
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 4L16 16M16 4L4 16" stroke="var(--accent-fg)" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 2C6.03 2 2 5.8 2 10.5c0 1.9.67 3.66 1.8 5.1L3 19l3.7-1.2A9.4 9.4 0 0011 19c4.97 0 9-3.8 9-8.5S15.97 2 11 2z" fill="var(--accent-fg)"/>
            <circle cx="8" cy="10.5" r="1.2" fill="var(--accent)"/>
            <circle cx="11" cy="10.5" r="1.2" fill="var(--accent)"/>
            <circle cx="14" cy="10.5" r="1.2" fill="var(--accent)"/>
          </svg>
        )}
        {!isOpen && messages.length > 1 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-500 text-white text-xs font-mono flex items-center justify-center border-2"
            style={{ borderColor: 'var(--bg-base)' }}>
            {Math.min(messages.length - 1, 9)}
          </span>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 md:bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-1.5rem)] rounded-2xl border flex flex-col card"
          style={{ height: '480px', animation: 'chatPop 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b rounded-t-2xl"
            style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center border"
                style={{ backgroundColor: 'var(--accent-glow)', borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)' }}>
                <span className="font-mono text-xs font-bold" style={{ color: 'var(--accent)' }}>AI</span>
              </div>
              <div>
                <p className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>TRACKR Assistant</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="teal-dot w-1 h-1"/>
                  <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                    {user?.username ? `Hey ${user.username}` : 'Connected'} · Backend pending
                  </span>
                </div>
              </div>
            </div>
            <button onClick={() => dispatch(clearChat())}
              className="p-1.5 rounded-lg transition-all"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.backgroundColor = 'var(--accent-glow)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
              title="Clear chat">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 4h10M5 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M6 6.5v3M8 6.5v3M3 4l.7 7.5a.5.5 0 00.5.5h5.6a.5.5 0 00.5-.5L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((msg) => <Message key={msg.id} msg={msg}/>)}
            {isTyping && <TypingIndicator/>}
            <div ref={messagesEndRef}/>
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2 rounded-xl border transition-all"
              style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border-color)' }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
              <input ref={inputRef} type="text" value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="Ask about tasks, workouts, code..."
                className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none font-body"
                style={{ color: 'var(--text-primary)' }}/>
              <button onClick={handleSend} disabled={!input.trim()}
                className="mr-2 w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90 flex-shrink-0 disabled:opacity-30"
                style={{ backgroundColor: 'var(--accent)' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1.5 7h11M8 2.5L12.5 7 8 11.5" stroke="var(--accent-fg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <p className="text-center font-mono text-xs mt-2" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
              Mocked responses · Backend integration pending
            </p>
          </div>
        </div>
      )}
    </>
  );
}
