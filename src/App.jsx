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
  const [step, setStep] = useState(1);
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
      
      setPreAuthToken(data.preAuthToken);
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
        body: JSON.stringify({ 
          email: email,
          preAuthToken: preAuthToken, 
          mfaCode: mfaCode 
        })
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
  const [activeTab, setActiveTab] = useState('queue');

  return (
    <div className="animate-fade-in" style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Admin Dashboard</h1>
        <button className="btn" style={{ background: 'var(--surface)', color: 'white', border: '1px solid var(--border)' }} onClick={onLogout}>
          Sign Out
        </button>
      </header>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', borderBottom: '1px solid var(--border)', paddingBottom: '15px', overflowX: 'auto' }}>
        <button onClick={() => setActiveTab('queue')} className="btn" style={{ background: activeTab === 'queue' ? 'var(--primary)' : 'transparent', color: 'white', border: activeTab === 'queue' ? 'none' : '1px solid var(--border)' }}>Moderation Queue</button>
        <button onClick={() => setActiveTab('all_users')} className="btn" style={{ background: activeTab === 'all_users' ? 'var(--primary)' : 'transparent', color: 'white', border: activeTab === 'all_users' ? 'none' : '1px solid var(--border)' }}>All Users</button>
        <button onClick={() => setActiveTab('categories')} className="btn" style={{ background: activeTab === 'categories' ? 'var(--primary)' : 'transparent', color: 'white', border: activeTab === 'categories' ? 'none' : '1px solid var(--border)' }}>Categories & Content</button>
        <button onClick={() => setActiveTab('ban')} className="btn" style={{ background: activeTab === 'ban' ? 'var(--primary)' : 'transparent', color: 'white', border: activeTab === 'ban' ? 'none' : '1px solid var(--border)' }}>Manual Ban</button>
      </div>

      {activeTab === 'queue' && <QueueTab token={token} />}
      {activeTab === 'all_users' && <AllUsersTab token={token} />}
      {activeTab === 'categories' && <CategoriesTab token={token} />}
      {activeTab === 'ban' && <BanUserTab token={token} />}
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
      setQueue(data.items || []);
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
    try {
      const res = await fetch(`${API_BASE}/api/v1/moderation/posts/${postId}/${action}`, {
        method: 'POST',
        headers: { 'x-moderator-token': token }
      });
      if (!res.ok) throw new Error('Action failed');
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

function BanUserTab({ token }) {
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
      <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Ban a User Manually</h2>
      
      {message && <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid var(--success)', padding: '10px', borderRadius: '8px', marginBottom: '20px', color: '#6ee7b7' }}>{message}</div>}
      {error && <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--danger)', padding: '10px', borderRadius: '8px', marginBottom: '20px', color: '#fca5a5' }}>{error}</div>}

      <form onSubmit={handleBan} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>User Handle</label>
          <input type="text" value={handle} onChange={e => setHandle(e.target.value)} className="input-field" required />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Reason for Ban</label>
          <input type="text" value={reason} onChange={e => setReason(e.target.value)} className="input-field" required />
        </div>
        <button type="submit" className="btn btn-danger" style={{ marginTop: '10px' }} disabled={loading}>
          {loading ? 'Processing...' : 'Ban User'}
        </button>
      </form>
    </div>
  );
}

function AllUsersTab({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/moderation/users?limit=50`, {
        headers: { 'x-moderator-token': token }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to fetch users');
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleDelete = async (handle) => {
    if (!window.confirm(`Are you sure you want to permanently delete user ${handle}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/moderation/users/${handle}`, {
        method: 'DELETE',
        headers: { 'x-moderator-token': token }
      });
      if (!res.ok) throw new Error('Action failed');
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div style={{ color: 'var(--danger)' }}>{error}</div>;

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>All Users (Recent 50)</h2>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Handle</th>
              <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Friends</th>
              <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Created At</th>
              <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.handle} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px' }}>@{u.handle}</td>
                <td style={{ padding: '12px' }}>{u.friendCount}</td>
                <td style={{ padding: '12px' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '12px' }}>
                  <button onClick={() => handleDelete(u.handle)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CategoriesTab({ token }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState(''); // empty = all categories

  const categoriesList = ['traffic', 'services', 'food', 'educationJobs', 'general', 'emergency'];

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const url = category ? `${API_BASE}/api/v1/moderation/posts?category=${category}&limit=50` : `${API_BASE}/api/v1/moderation/posts?limit=50`;
      const res = await fetch(url, {
        headers: { 'x-moderator-token': token }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to fetch posts');
      setPosts(data.posts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [token, category]);

  const handleDelete = async (postId) => {
    if (!window.confirm(`Are you sure you want to delete this post?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/moderation/posts/${postId}/hide`, {
        method: 'POST',
        headers: { 'x-moderator-token': token }
      });
      if (!res.ok) throw new Error('Action failed');
      fetchPosts();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
        <h2 style={{ fontSize: '1.25rem' }}>Posts by Category</h2>
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          className="input-field"
          style={{ width: '200px', padding: '8px', background: '#0f172a' }}
        >
          <option value="">All Categories</option>
          {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      
      {loading ? (
        <div>Loading posts...</div>
      ) : error ? (
        <div style={{ color: 'var(--danger)' }}>{error}</div>
      ) : posts.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No posts found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {posts.map((post) => (
            <div key={post.id} style={{ padding: '15px', background: 'rgba(15,23,42,0.4)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', background: 'var(--primary)', padding: '4px 8px', borderRadius: '4px' }}>{post.category}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(post.createdAt).toLocaleString()}</span>
              </div>
              <p style={{ fontWeight: '500', marginBottom: '10px' }}>{post.content}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>By: @{post.authorHandle} • Upvotes: {post.upvotes} • Reports: {post.reportCount}</span>
                <button onClick={() => handleDelete(post.id)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Hide/Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
