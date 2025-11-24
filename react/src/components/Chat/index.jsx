import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMessages, createMessage } from '../../api/messages';
import { getToken, logout } from '../../api/auth';

export const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    loadMessages();

    const interval = setInterval(() => {
      loadMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [navigate]);

  const loadMessages = async () => {
    try {
      const data = await getMessages({ limit: 100, offset: 0 });
      setMessages(data.results || []);
      setError('');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError('Ошибка загрузки сообщений');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim()) {
      return;
    }

    if (messageText.length > 5000) {
      setError('Сообщение слишком длинное (максимум 5000 символов)');
      return;
    }

    setSending(true);
    setError('');

    try {
      await createMessage(messageText);
      setMessageText('');
      await loadMessages();
    } catch (err) {
      if (err.response && err.response.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError('Ошибка отправки сообщения');
      }
    } finally {
      setSending(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const timeStr = date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    if (date.toDateString() === today.toDateString()) {
      return `Сегодня в ${timeStr}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Вчера в ${timeStr}`;
    } else {
      return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="chat-container" data-easytag="id1-react/src/components/Chat/index.jsx">
      <div className="chat-header">
        <div className="chat-header-content">
          <h1 className="chat-title">Групповой чат</h1>
          <button className="chat-logout-button" onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </div>

      <div className="chat-messages-wrapper">
        {loading ? (
          <div className="chat-loading">
            <div className="chat-loading-spinner"></div>
            <p>Загрузка сообщений...</p>
          </div>
        ) : (
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-empty">
                <p>Сообщений пока нет. Будьте первым!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="chat-message">
                  <div className="chat-message-header">
                    <span className="chat-message-author">
                      {message.member?.username || 'Аноним'}
                    </span>
                    <span className="chat-message-timestamp">
                      {formatTimestamp(message.created_at)}
                    </span>
                  </div>
                  <div className="chat-message-content">
                    {message.content}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="chat-input-wrapper">
        {error && (
          <div className="chat-error-message">
            {error}
          </div>
        )}
        <form className="chat-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="chat-input"
            placeholder="Введите сообщение..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            disabled={sending}
            maxLength={5000}
          />
          <button 
            type="submit" 
            className="chat-send-button"
            disabled={sending || !messageText.trim()}
          >
            {sending ? 'Отправка...' : 'Отправить'}
          </button>
        </form>
      </div>
    </div>
  );
};
