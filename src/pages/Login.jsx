import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('admin@vendorpro.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch(err) {
      setError(err.message || 'Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--bg)',
      backgroundImage:'radial-gradient(ellipse at 20% 50%, rgba(79,124,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.06) 0%, transparent 60%)'
    }}>
      <div style={{width:'100%',maxWidth:420,padding:'0 24px'}}>
        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:40}}>
          <div style={{width:56,height:56,background:'linear-gradient(135deg,var(--accent),var(--purple))',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:20,color:'white'}}>VP</div>
          <h1 style={{fontFamily:'Syne,sans-serif',fontSize:28,fontWeight:800,marginBottom:4}}>VendorPro</h1>
          <p style={{color:'var(--text-muted)',fontSize:14}}>Procurement & Vendor Management System</p>
        </div>

        <div className="card">
          <div className="card-body">
            <h2 style={{fontSize:18,marginBottom:4}}>Sign In</h2>
            <p className="text-muted text-sm" style={{marginBottom:24}}>Access your procurement dashboard</p>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={submit}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@vendorpro.com" required/>
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required/>
              </div>
              <button type="submit" className="btn btn-primary w-full" style={{justifyContent:'center',padding:'11px',marginTop:4}} disabled={loading}>
                {loading ? <><span className="spinner" style={{width:16,height:16}}/> Signing in...</> : 'Sign In'}
              </button>
            </form>
          </div>
        </div>

        {/* Demo credentials */}
        <div style={{marginTop:20,padding:16,background:'rgba(79,124,255,0.06)',border:'1px solid rgba(79,124,255,0.15)',borderRadius:'var(--radius-sm)',fontSize:12}}>
          <div style={{fontWeight:700,marginBottom:8,color:'var(--accent)'}}>Demo Credentials</div>
          <div style={{display:'grid',gap:6}}>
            {[
              { role:'Admin', email:'admin@vendorpro.com', pwd:'admin123' },
              { role:'Manager', email:'procurement@vendorpro.com', pwd:'manager123' },
            ].map(c => (
              <div key={c.role} style={{display:'flex',gap:8,alignItems:'center',cursor:'pointer'}}
                onClick={() => { setEmail(c.email); setPassword(c.pwd); }}>
                <span style={{background:'var(--accent)',color:'white',padding:'1px 6px',borderRadius:4,fontSize:10,fontWeight:700}}>{c.role}</span>
                <span style={{color:'var(--text-muted)',fontFamily:'DM Mono,monospace'}}>{c.email}</span>
                <span style={{color:'var(--text-muted)',marginLeft:'auto',fontFamily:'DM Mono,monospace'}}>{c.pwd}</span>
              </div>
            ))}
          </div>
          <div style={{marginTop:8,color:'var(--text-muted)',fontSize:11}}>Click a row to auto-fill credentials</div>
        </div>
      </div>
    </div>
  );
}
