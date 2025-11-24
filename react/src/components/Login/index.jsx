import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth';

export const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = 'Имя пользователя обязательно';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await login(formData.username, formData.password);
      navigate('/chat');
    } catch (error) {
      if (error.response?.status === 401) {
        setErrors({ general: 'Неверное имя пользователя или пароль' });
      } else if (error.response?.data) {
        const serverErrors = {};
        if (error.response.data.username) {
          serverErrors.username = Array.isArray(error.response.data.username) 
            ? error.response.data.username[0] 
            : error.response.data.username;
        }
        if (error.response.data.password) {
          serverErrors.password = Array.isArray(error.response.data.password) 
            ? error.response.data.password[0] 
            : error.response.data.password;
        }
        if (error.response.data.detail) {
          serverErrors.general = error.response.data.detail;
        }
        if (error.response.data.error) {
          serverErrors.general = error.response.data.error;
        }
        setErrors(serverErrors);
      } else {
        setErrors({ general: 'Произошла ошибка. Попробуйте снова.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container" data-easytag="id1-react/src/components/Login/index.jsx">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Вход</h1>
          <p className="auth-subtitle">Войдите в свой аккаунт для доступа к чату</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.general && (
            <div className="error-message error-message-general">
              {errors.general}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Имя пользователя
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className={`form-input ${errors.username ? 'form-input-error' : ''}`}
              value={formData.username}
              onChange={handleChange}
              placeholder="Введите имя пользователя"
              disabled={isLoading}
            />
            {errors.username && (
              <span className="error-message">{errors.username}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Пароль
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-input ${errors.password ? 'form-input-error' : ''}`}
              value={formData.password}
              onChange={handleChange}
              placeholder="Введите пароль"
              disabled={isLoading}
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </button>

          <div className="auth-footer">
            <span className="auth-footer-text">Нет аккаунта?</span>
            <a href="/register" className="auth-link">
              Зарегистрироваться
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};
