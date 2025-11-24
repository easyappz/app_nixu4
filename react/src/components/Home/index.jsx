import React from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container" data-easytag="id1-react/src/components/Home/index.jsx">
      <div className="home-card">
        <div className="home-header">
          <h1 className="home-title">Добро пожаловать в корпоративный чат</h1>
          <p className="home-subtitle">
            Присоединяйтесь к нашей команде для эффективного общения и совместной работы
          </p>
        </div>
        
        <div className="home-actions">
          <button 
            className="home-button home-button-primary" 
            onClick={() => navigate('/register')}
          >
            Регистрация
          </button>
          <button 
            className="home-button home-button-secondary" 
            onClick={() => navigate('/login')}
          >
            Войти
          </button>
        </div>
        
        <div className="home-features">
          <div className="home-feature">
            <div className="home-feature-icon">💬</div>
            <h3 className="home-feature-title">Обмен сообщениями</h3>
            <p className="home-feature-description">
              Отправляйте текстовые сообщения и общайтесь в режиме реального времени
            </p>
          </div>
          <div className="home-feature">
            <div className="home-feature-icon">📜</div>
            <h3 className="home-feature-title">История сообщений</h3>
            <p className="home-feature-description">
              Просматривайте полную историю всех сообщений чата
            </p>
          </div>
          <div className="home-feature">
            <div className="home-feature-icon">👤</div>
            <h3 className="home-feature-title">Личный профиль</h3>
            <p className="home-feature-description">
              Управляйте своими данными и настройками аккаунта
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};