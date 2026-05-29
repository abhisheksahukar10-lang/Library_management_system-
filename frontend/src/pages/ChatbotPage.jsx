// src/pages/ChatbotPage.jsx
// Improved chatbot: passes real userId for personalised fine/borrow info.
// Updated suggestions to reflect book availability feature.
import React, { useState, useRef, useEffect } from 'react';
import { chatbot } from '../services/api';

function ChatbotPage({ user }) {
  const [messages, setMessages] = useState([
    { from:'bot', text:"Hello! 👋 I'm the Library Assistant.\n\nI can help you:\n• Check book availability\n• Find out your fines\n• Explain borrow limits\n• Answer library questions\n\nTry: 'Is Python Programming available?'" }
  ]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    setMessages(prev => [...prev, { from: 'user', text }]);
    setLoading(true);

    try {
      const userId = user?.id || 0;
      const res = await chatbot(text, userId);
      setMessages(prev => [...prev, { from: 'bot', text: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { from: 'bot',
        text: "⚠️ Couldn't reach the server. Is the backend running on port 8080?" }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'Is Clean Code available?',
    'Find book Java',
    'Borrow limit',
    'My fines',
    'Library hours',
    'How to return a book?'
  ];

  return (
    <div>
      <h1 className="page-title">🤖 Library Chatbot</h1>
      <p style={{ color:'#718096', marginBottom:'16px', fontSize:'0.9rem' }}>
        Rule-based keyword chatbot — understands common library questions and can check book availability.
        {user && <span style={{ marginLeft:'8px', background:'#ebf8ff', borderRadius:'12px', padding:'2px 10px', color:'#2c5282' }}>
          Logged in: {user.name}
        </span>}
      </p>

      <div className="chatbot-container">
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.from}`}>
              <div className={`bubble ${m.from}`}>
                {m.from === 'bot' && <strong style={{ display:'block', marginBottom:'4px', fontSize:'0.85rem' }}>🤖 Library Bot</strong>}
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="message bot">
              <div className="bubble bot loading">🤖 Searching...</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="chat-input-row">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about a book, fines, or library rules..." />
          <button className="btn btn-primary" onClick={sendMessage} disabled={loading}>Send</button>
        </div>
      </div>

      <div style={{ marginTop:'16px' }}>
        <p style={{ color:'#718096', marginBottom:'8px', fontSize:'0.85rem' }}>💡 Quick questions:</p>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => setInput(s)}
              style={{ padding:'5px 14px', background:'#ebf8ff', border:'1px solid #bee3f8',
                       borderRadius:'20px', cursor:'pointer', fontSize:'0.83rem', color:'#2c5282' }}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChatbotPage;
