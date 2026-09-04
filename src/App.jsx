import { useState, useEffect } from 'react';
import './index.css';

const API_BASE = import.meta.env.VITE_API_URL || 'https://localv1r.onrender.com';

function App() {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));

  const handleLogin = (newToken) => {
    localStorage.setItem('adminToken', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
  };

  return (
    <div className="min-h-screen">
      {!token ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard token={token} onLogout={handleLogout} />
      )}
    </div>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [step, setStep] = useState(1); // 1 = Creds, 2 = MFA
  const [preAuthToken, setPreAuthToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCredSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/moderation/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || (data.error && data.error.message) || 'Request failed');
      
      setPreAuthToken(data.pre_auth_token);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/moderation/verify-mfa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pre_auth_token: preAuthToken, mfa_code: mfaCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'MFA failed');
      
      onLogin(data.moderatorToken);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>Vadodara Local Admin</h1>
          <p style={{ color: 'var(--text-muted)' }}>{step === 1 ? 'Sign in to your account' : 'Two-Factor Authentication'}</p>
        </div>
        
        {error && <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--danger)', padding: '10px', borderRadius: '8px', marginBottom: '20px', color: '#fca5a5', fontSize: '0.875rem' }}>{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleCredSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="admin@vadodara.local" required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleMfaSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>6-Digit MFA Code</label>
              <input type="text" value={mfaCode} onChange={e => setMfaCode(e.target.value)} className="input-field" placeholder="123456" required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Enter'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Dashboard({ token, onLogout }) {
  const [activeTab, setActiveTab] = useState('queue'); // queue, users

  return (
    <div className="animate-fade-in" style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Admin Dashboard</h1>
        <button className="btn" style={{ background: 'var(--surface)', color: 'white', border: '1px solid var(--border)' }} onClick={onLogout}>
          Sign Out
        </button>
      </header>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', borderBottom: '1px solid var(--border)', paddingBottom: '15px' }}>
        <button onClick={() => setActiveTab('queue')} className="btn" style={{ background: activeTab === 'queue' ? 'var(--primary)' : 'transparent', color: 'white', border: activeTab === 'queue' ? 'none' : '1px solid var(--border)' }}>Moderation Queue</button>
        <button onClick={() => setActiveTab('users')} className="btn" style={{ background: activeTab === 'users' ? 'var(--primary)' : 'transparent', color: 'white', border: activeTab === 'users' ? 'none' : '1px solid var(--border)' }}>User Management (Ban)</button>
      </div>

      {activeTab === 'queue' && <QueueTab token={token} />}
      {activeTab === 'users' && <UsersTab token={token} />}
    </div>
  );
}

function QueueTab({ token }) {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/moderation/queue`, {
        headers: { 'x-moderator-token': token }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to fetch queue');
      setQueue(data.items || []); // Adjust based on actual backend response
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [token]);

  const handleAction = async (postId, action) => {
    // action is 'hide' or 'restore'
    try {
      const res = await fetch(`${API_BASE}/api/v1/moderation/posts/${postId}/${action}`, {
        method: 'POST',
        headers: { 'x-moderator-token': token }
      });
      if (!res.ok) throw new Error('Action failed');
      // refresh queue
      fetchQueue();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div>Loading queue...</div>;
  if (error) return <div style={{ color: 'var(--danger)' }}>{error}</div>;

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Reported Content</h2>
      
      {queue.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No reported items right now.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {queue.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(15,23,42,0.4)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div>
                <p style={{ fontWeight: '500', marginBottom: '4px' }}>{item.content || 'Unknown Content'}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Author: {item.authorHandle} • Reports: {item.reportCount}</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => handleAction(item.id, 'restore')} className="btn" style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', color: 'white' }}>Clear Flags</button>
                <button onClick={() => handleAction(item.id, 'hide')} className="btn btn-danger" style={{ padding: '8px 16px' }}>Hide Post</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UsersTab({ token }) {
  const [handle, setHandle] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleBan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      const res = await fetch(`${API_BASE}/api/v1/moderation/ban`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-moderator-token': token 
        },
        body: JSON.stringify({ handle, reason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to ban user');
      
      setMessage(`Successfully banned ${handle}`);
      setHandle('');
      setReason('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', maxWidth: '600px' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Ban a User</h2>
      
      {message && <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid var(--success)', padding: '10px', borderRadius: '8px', marginBottom: '20px', color: '#6ee7b7' }}>{message}</div>}
      {error && <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--danger)', padding: '10px', borderRadius: '8px', marginBottom: '20px', color: '#fca5a5' }}>{error}</div>}

      <form onSubmit={handleBan} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>User Handle (e.g., Anon#123ABC)</label>
          <input type="text" value={handle} onChange={e => setHandle(e.target.value)} className="input-field" required />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Reason for Ban</label>
          <input type="text" value={reason} onChange={e => setReason(e.target.value)} className="input-field" placeholder="Spamming the jobs category" required />
        </div>
        <button type="submit" className="btn btn-danger" style={{ marginTop: '10px' }} disabled={loading}>
          {loading ? 'Processing...' : 'Ban User'}
        </button>
      </form>
    </div>
  );
}

export default App;
