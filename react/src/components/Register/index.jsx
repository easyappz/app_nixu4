import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../api/auth';

export const Register = () => {
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
    } else if (formData.username.length < 3) {
      newErrors.username = 'Имя пользователя должно содержать минимум 3 символа';
    } else if (formData.username.length > 150) {
      newErrors.username = 'Имя пользователя должно содержать максимум 150 символов';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
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
      await register(formData.username, formData.password);
      navigate('/chat');
    } catch (error) {
      if (error.response?.data) {
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
    <div className="auth-container" data-easytag="id1-react/src/components/Register/index.jsx">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Регистрация</h1>
          <p className="auth-subtitle">Создайте новый аккаунт для доступа к чату</p>
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
              placeholder="Введите пароль (минимум 6 символов)"
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
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>

          <div className="auth-footer">
            <span className="auth-footer-text">Уже есть аккаунт?</span>
            <a href="/login" className="auth-link">
              Войти
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};
