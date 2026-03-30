import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import RFQs from './pages/RFQs';
import Quotations from './pages/Quotations';
import PurchaseOrders from './pages/PurchaseOrders';
import Invoices from './pages/Invoices';
import Inventory from './pages/Inventory';
import './styles/global.css';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/vendors': 'Vendor Management',
  '/rfqs': 'RFQ Management',
  '/quotations': 'Quotations',
  '/purchase-orders': 'Purchase Orders',
  '/invoices': 'Invoices',
  '/inventory': 'Inventory',
};

function ProtectedLayout() {
  const { user, loading } = useAuth();
  const path = window.location.pathname;

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:48,height:48,background:'linear-gradient(135deg,var(--accent),var(--purple))',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:18,color:'white'}}>VP</div>
        <div className="spinner" style={{margin:'0 auto'}}/>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace/>;

  return (
    <div className="app-shell">
      <Sidebar/>
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <div className="topbar-title">{PAGE_TITLES[path] || 'VendorPro'}</div>
          </div>
          <div style={{fontSize:12,color:'var(--text-muted)',fontFamily:'DM Mono,monospace'}}>
            {new Date().toLocaleDateString('en-IN', { weekday:'short', day:'2-digit', month:'short', year:'numeric' })}
          </div>
        </div>
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard/>}/>
            <Route path="/vendors" element={<Vendors/>}/>
            <Route path="/rfqs" element={<RFQs/>}/>
            <Route path="/quotations" element={<Quotations/>}/>
            <Route path="/purchase-orders" element={<PurchaseOrders/>}/>
            <Route path="/invoices" element={<Invoices/>}/>
            <Route path="/inventory" element={<Inventory/>}/>
            <Route path="*" element={<Navigate to="/" replace/>}/>
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login/>}/>
          <Route path="/*" element={<ProtectedLayout/>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
