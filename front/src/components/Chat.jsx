import { useState, useEffect } from 'react';
import api from '../api';
import { v4 as uuidv4 } from 'uuid';

const Chat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    setSessionId(uuidv4());
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { from: 'user', text: input };
    setInput('');
    setMessages(prev => [...prev, userMessage, { from: 'ia', text: '...', loading: true }]);

    try {
      const res = await api.post('/chat', { message: input, sessionId });
      const response = res.data;

      setMessages(prev => [
        ...prev.slice(0, -1),
        { from: 'ia', text: response.message }
      ]);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Une erreur est survenue';
      setMessages(prev => [
        ...prev.slice(0, -1),
        { from: 'ia', text: errorMsg }
      ]);
    }
  };

  return (
    <div>
      <h2 className="mb-4">AI Chat</h2>

      <div className="border rounded p-3 mb-3 bg-light" style={{ height: '300px', overflowY: 'scroll' }}>
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-2 d-flex ${m.from === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
          >
            <div className={`p-2 rounded ${m.from === 'user' ? 'bg-primary text-white' : 'bg-secondary text-white'}`} style={{ whiteSpace: 'pre-wrap' }}>
              {m.loading ? (
                <span className="dots">
                  <span>.</span><span>.</span><span>.</span>
                </span>
              ) : (
                m.text
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="input-group">
        <input
          type="text"
          className="form-control"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button className="btn btn-primary" onClick={sendMessage}>
          Send
        </button>
      </div>

      <style>
        {`
          .dots span {
            animation: blink 1s infinite;
          }
          .dots span:nth-child(2) {
            animation-delay: 0.2s;
          }
          .dots span:nth-child(3) {
            animation-delay: 0.4s;
          }
          @keyframes blink {
            0% { opacity: 0; }
            50% { opacity: 1; }
            100% { opacity: 0; }
          }
        `}
      </style>
    </div>
  );
};

export default Chat;
