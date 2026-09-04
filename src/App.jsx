import { useState } from 'react';
import './index.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="min-h-screen">
      {!isLoggedIn ? (
        <Login onLogin={() => setIsLoggedIn(true)} />
      ) : (
        <Dashboard onLogout={() => setIsLoggedIn(false)} />
      )}
    </div>
  );
}

function Login({ onLogin }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>Vadodara Local Admin</h1>
          <p style={{ color: 'var(--text-muted)' }}>Sign in to the moderation portal</p>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Admin Email</label>
            <input type="email" className="input-field" placeholder="admin@vadodara.local" required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Password</label>
            <input type="password" className="input-field" placeholder="••••••••" required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>2FA Code (Optional for demo)</label>
            <input type="text" className="input-field" placeholder="123456" />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ onLogout }) {
  const stats = [
    { label: 'Active Users', value: '4,209' },
    { label: 'Pending Reports', value: '18', alert: true },
    { label: 'Posts Today', value: '342' },
  ];

  return (
    <div className="animate-fade-in" style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Overview</h1>
        <button className="btn" style={{ background: 'var(--surface)', color: 'white', border: '1px solid var(--border)' }} onClick={onLogout}>
          Sign Out
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {stats.map((stat, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '24px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '8px' }}>{stat.label}</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: stat.alert ? 'var(--danger)' : 'white' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Recent Reports Queue</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {[1, 2, 3].map((item) => (
            <div key={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(15,23,42,0.4)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div>
                <p style={{ fontWeight: '500', marginBottom: '4px' }}>Spam Post in "Food" Category</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Reported by 3 users • 10 mins ago</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn" style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', color: 'white' }}>Ignore</button>
                <button className="btn btn-danger" style={{ padding: '8px 16px' }}>Hide Post</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
