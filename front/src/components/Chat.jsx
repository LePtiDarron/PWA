import { useState } from 'react';
import api from '../api';

const Chat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { from: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);

    try {
      const res = await api.post('/chat', { message: input });
      const response = res.data;

      setMessages(prev => [...prev, { from: 'ia', text: response.message }]);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Une erreur est survenue';
      setMessages(prev => [...prev, { from: 'ia', text: errorMsg }]);
    }

    setInput('');
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
            <div className={`p-2 rounded ${m.from === 'user' ? 'bg-primary text-white' : 'bg-secondary text-white'}`}>
              {m.text}
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
    </div>
  );
};

export default Chat;
