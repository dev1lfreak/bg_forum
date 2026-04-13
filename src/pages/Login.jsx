import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../state/AppContext.jsx';

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPending(true);
    setError('');
    try {
      await login({ email, password });
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
        <h1>Вход</h1>
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
          {pending ? 'Входим...' : 'Войти'}
        </button>
        <div className="muted">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </div>
      </form>
    </div>
  );
}
