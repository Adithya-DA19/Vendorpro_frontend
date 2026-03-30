import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard, Users, FileText, ShoppingCart,
  Receipt, Package, ChevronRight, LogOut, Settings
} from 'lucide-react';

const navItems = [
  { section: 'Overview', items: [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  ]},
  { section: 'Procurement', items: [
    { to: '/vendors', icon: Users, label: 'Vendors' },
    { to: '/rfqs', icon: FileText, label: 'RFQ Management' },
    { to: '/quotations', icon: ChevronRight, label: 'Quotations' },
  ]},
  { section: 'Orders & Finance', items: [
    { to: '/purchase-orders', icon: ShoppingCart, label: 'Purchase Orders' },
    { to: '/invoices', icon: Receipt, label: 'Invoices' },
  ]},
  { section: 'Warehouse', items: [
    { to: '/inventory', icon: Package, label: 'Inventory' },
  ]},
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">VP</div>
        <div className="logo-text">Vendor<span>Pro</span></div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(section => (
          <div key={section.section}>
            <div className="nav-section-label">{section.section}</div>
            {section.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div style={{flex:1,minWidth:0}}>
            <div className="user-name" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
          <button onClick={handleLogout} title="Logout"
            style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',padding:'4px',borderRadius:'4px'}}
            onMouseEnter={e => e.target.style.color = 'var(--red)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
