import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../utils/api';

const QUICK_QUERIES = ['Failed Login Attempts', 'Critical Threats Today', 'Suspicious IPs', 'Weekly Trends', 'Active Threats', 'Open Incidents'];

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hello! I\'m your AI-powered SIEM Assistant. I can help you with:\n\n• Querying security logs in natural language\n• Analyzing threat patterns\n• Generating security reports\n• Investigating incidents\n\nTry asking: **"Show me failed login attempts in last 24 hours"**'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}`);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const { data } = await api.post('/chat', { message: msg, sessionId });
      setMessages(prev => [...prev, { role: 'assistant', content: data.response, data: data.data, type: data.type }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Connection error. Please check your backend is running and try again.', error: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: '👋 Chat cleared! How can I help you with your security monitoring?'
    }]);
  };

  return (
    <div className="flex flex-col h-screen animate-fade-in">
      {/* Header */}
      <header className="bg-dark/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
              </svg>
            </div>
            <div>
              <h2 className="font-sora font-bold text-lg">SIEM Assistant</h2>
              <p className="text-xs text-gray-400">Ask me anything about your security logs</p>
            </div>
          </div>
          <button onClick={clearChat} className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-semibold transition-all">
            Clear Chat
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                </svg>
              </div>
            )}
            <div className={`max-w-2xl rounded-2xl px-5 py-4 ${
              msg.role === 'user'
                ? 'bg-gradient-to-r from-primary to-accent text-white'
                : msg.error
                  ? 'bg-red-500/10 border border-red-500/20 text-red-300'
                  : 'bg-dark/80 border border-white/10 text-white'
            }`}>
              {msg.role === 'assistant' ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      strong: ({ children }) => <strong className="text-primary font-bold">{children}</strong>,
                      ul: ({ children }) => <ul className="list-none space-y-1 mt-2">{children}</ul>,
                      li: ({ children }) => <li className="text-gray-300">{children}</li>,
                      p: ({ children }) => <p className="mb-2 last:mb-0 text-gray-200 leading-relaxed">{children}</p>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm leading-relaxed">{msg.content}</p>
              )}

              {/* Show threat data table if returned */}
              {msg.data && Array.isArray(msg.data) && msg.data.length > 0 && (
                <div className="mt-4 border-t border-white/10 pt-4">
                  <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">Related Threats ({msg.data.length})</p>
                  <div className="space-y-2">
                    {msg.data.slice(0, 3).map((item, j) => (
                      <div key={j} className="bg-white/5 rounded-lg px-3 py-2 text-xs flex items-center justify-between">
                        <span className="text-white font-medium">{item.title || item.type}</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold ${
                          item.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                          item.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>{item.severity}</span>
                      </div>
                    ))}
                    {msg.data.length > 3 && <p className="text-xs text-gray-500 text-center">+{msg.data.length - 3} more</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-slide-up">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <svg className="w-4 h-4 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="bg-dark/80 border border-white/10 rounded-2xl px-5 py-4">
              <div className="flex gap-2 items-center">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-gray-400 text-sm ml-2">Analyzing security data...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Queries + Input */}
      <div className="border-t border-white/10 bg-darker/50 backdrop-blur-xl px-8 py-4">
        <div className="mb-3">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">QUICK QUERIES:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_QUERIES.map((q, i) => (
              <button key={i} onClick={() => sendMessage(q)}
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 px-3 py-1.5 rounded-lg text-sm text-gray-300 hover:text-white transition-all">
                {q}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about your security logs..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-primary to-accent p-3.5 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
