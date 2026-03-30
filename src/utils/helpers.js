export const fmt = {
  currency: (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0),
  number: (n) => new Intl.NumberFormat('en-IN').format(n || 0),
  date: (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
  dateTime: (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—',
  percent: (n) => `${Math.round(n || 0)}%`,
};

export const statusColor = (status) => {
  const map = {
    approved: 'green', active: 'green', open: 'green', paid: 'green', delivered: 'green', accepted: 'green', in_transit: 'green',
    pending: 'amber', pending_approval: 'amber', submitted: 'amber', draft: 'amber', under_review: 'amber', evaluation: 'amber', acknowledged: 'amber', sent: 'amber', scheduled: 'amber',
    rejected: 'red', blacklisted: 'red', cancelled: 'red', overdue: 'red', failed: 'red',
    closed: 'blue', partial: 'blue', pre_qualified: 'blue',
    new: 'purple', negotiation: 'purple',
  };
  return map[status] || 'gray';
};

export const statusLabel = (status) => {
  const map = {
    pending_approval: 'Pending Approval', under_review: 'Under Review',
    in_transit: 'In Transit', pre_qualified: 'Pre-Qualified'
  };
  return map[status] || (status ? status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '');
};

export const Stars = ({ score }) => {
  const full = Math.floor(score || 0);
  const half = (score || 0) - full >= 0.5;
  return (
    <span className="stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`star ${i <= full ? '' : (i === full+1 && half ? 'half' : 'empty')}`}>★</span>
      ))}
      <span style={{fontSize:'11px',marginLeft:'4px',color:'var(--text-muted)'}}>{(score||0).toFixed(1)}</span>
    </span>
  );
};
