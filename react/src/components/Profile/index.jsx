import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../../api/profile';
import { getToken, logout } from '../../api/auth';

export const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    loadProfile();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getProfile();
      setProfileData(data);
      setUsername(data.username || '');
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError(err.response?.data?.error || 'Ошибка загрузки профиля');
      }
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (username.trim().length < 3 || username.trim().length > 150) {
      errors.username = 'Имя пользователя должно содержать от 3 до 150 символов';
    }

    if (password && password.length < 6) {
      errors.password = 'Пароль должен содержать минимум 6 символов';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setValidationErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const updateData = {
        username: username.trim(),
      };

      if (password) {
        updateData.password = password;
      }

      const data = await updateProfile(updateData);
      setProfileData(data);
      setUsername(data.username || '');
      setPassword('');
      setSuccessMessage('Профиль успешно обновлен');
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.error || 'Некорректные данные');
      } else {
        setError(err.response?.data?.error || 'Ошибка обновления профиля');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigateToChat = () => {
    navigate('/chat');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="profile-container" data-easytag="id1-react/src/components/Profile/index.jsx">
        <div className="profile-loading">
          <div className="profile-loading-spinner"></div>
          <p>Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container" data-easytag="id1-react/src/components/Profile/index.jsx">
      <div className="profile-card">
        <div className="profile-header">
          <h1 className="profile-title">Профиль пользователя</h1>
          <button
            type="button"
            onClick={handleLogout}
            className="profile-logout-button"
          >
            Выйти
          </button>
        </div>

        {error && (
          <div className="error-message-general">
            <span className="error-message">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="success-message-general">
            <span className="success-message">{successMessage}</span>
          </div>
        )}

        {profileData && (
          <div className="profile-info">
            <div className="profile-info-item">
              <span className="profile-info-label">Имя пользователя:</span>
              <span className="profile-info-value">{profileData.username}</span>
            </div>
            {profileData.created_at && (
              <div className="profile-info-item">
                <span className="profile-info-label">Дата регистрации:</span>
                <span className="profile-info-value">{formatDate(profileData.created_at)}</span>
              </div>
            )}
          </div>
        )}

        <div className="profile-divider"></div>

        <h2 className="profile-subtitle">Редактировать профиль</h2>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Имя пользователя
            </label>
            <input
              type="text"
              id="username"
              className={`form-input ${validationErrors.username ? 'form-input-error' : ''}`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Введите имя пользователя"
              disabled={isSubmitting}
              required
            />
            {validationErrors.username && (
              <span className="error-message">{validationErrors.username}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Новый пароль (оставьте пустым, если не хотите менять)
            </label>
            <input
              type="password"
              id="password"
              className={`form-input ${validationErrors.password ? 'form-input-error' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите новый пароль"
              disabled={isSubmitting}
            />
            {validationErrors.password && (
              <span className="error-message">{validationErrors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className="profile-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </form>

        <div className="profile-actions">
          <button
            type="button"
            onClick={handleNavigateToChat}
            className="profile-chat-button"
          >
            Перейти в чат
          </button>
        </div>
      </div>
    </div>
  );
};
