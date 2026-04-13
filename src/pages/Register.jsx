import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../state/AppContext.jsx';

export default function Register() {
  const { register } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPending(true);
    setError('');
    try {
      await register({ email, username, password });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="page auth-card" onSubmit={handleSubmit}>
        <h1>Регистрация</h1>
        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} minLength={3} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Пароль
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>
        {error && <div className="notice">{error}</div>}
        <button className="pill" type="submit" disabled={pending}>
          {pending ? 'Создаем...' : 'Создать аккаунт'}
        </button>
        <div className="muted">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </div>
      </form>
    </div>
  );
}
