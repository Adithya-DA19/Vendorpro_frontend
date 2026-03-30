import { useState, useEffect } from 'react';
import { purchaseOrders as poAPI } from '../utils/api';
import { fmt, statusColor, statusLabel } from '../utils/helpers';
import { ShoppingCart, CheckCircle, Truck, Package } from 'lucide-react';

const STATUS_FLOW = ['pending_approval','approved','sent','acknowledged','in_transit','delivered'];

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const [ordersRes, statsRes] = await Promise.all([poAPI.list(params), poAPI.stats()]);
      setOrders(ordersRes.data);
      setStats(statsRes.data);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleApprove = async (id) => {
    try { await poAPI.approve(id); load(); } catch(e) { alert(e.message); }
  };

  const handleStatusUpdate = async (id, status) => {
    try { await poAPI.updateStatus(id, { status }); load(); } catch(e) { alert(e.message); }
  };

  const getNextStatus = (status) => {
    const idx = STATUS_FLOW.indexOf(status);
    return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{fontSize:22}}>Purchase Orders</h2>
          <p className="text-muted text-sm" style={{marginTop:4}}>Track and manage all purchase orders</p>
        </div>
      </div>

      {stats && (
        <div className="kpi-grid" style={{gridTemplateColumns:'repeat(5,1fr)',marginBottom:24}}>
          {[
            { label:'Total POs', value:stats.total, color:'blue' },
            { label:'Pending Approval', value:stats.pending, color:'amber' },
            { label:'Approved', value:stats.approved, color:'green' },
            { label:'Delivered', value:stats.delivered, color:'purple' },
            { label:'Total Value', value:fmt.currency(stats.totalValue), color:'blue' },
          ].map(k => (
            <div key={k.label} className={`kpi-card ${k.color}`}>
              <div className="kpi-value" style={{fontSize:20}}>{k.value}</div>
              <div className="kpi-label">{k.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="tabs">
        {['all','pending_approval','approved','in_transit','delivered','cancelled'].map(s => (
          <div key={s} className={`tab ${statusFilter===s?'active':''}`} onClick={() => setStatusFilter(s)}>
            {s === 'all' ? 'All Orders' : statusLabel(s)}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div className="loading-state"><div className="spinner"/> Loading...</div>
          ) : orders.length === 0 ? (
            <div className="empty-state"><ShoppingCart size={40}/><p>No purchase orders found</p></div>
          ) : (
            <table>
              <thead>
                <tr><th>PO #</th><th>RFQ</th><th>Vendor</th><th>Amount</th><th>Delivery Date</th><th>Status</th><th>Signature</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {orders.map(po => {
                  const next = getNextStatus(po.status);
                  return (
                    <tr key={po.id}>
                      <td><span className="mono">{po.poNumber}</span></td>
                      <td className="text-sm text-muted">{po.rfq?.rfqNumber || '—'}</td>
                      <td>
                        <div style={{fontWeight:600,fontSize:13}}>{po.vendor?.companyName}</div>
                        <div className="text-muted text-sm">{po.vendor?.category?.replace(/_/g,' ')}</div>
                      </td>
                      <td><span style={{fontWeight:700,fontFamily:'DM Mono,monospace',fontSize:13,color:'var(--accent)'}}>{fmt.currency(po.grandTotal)}</span></td>
                      <td className="text-sm text-muted">{fmt.date(po.deliveryDate)}</td>
                      <td><span className={`badge badge-${statusColor(po.status)}`}>{statusLabel(po.status)}</span></td>
                      <td>
                        {po.digitalSignature
                          ? <span className="mono" style={{fontSize:10,color:'var(--green)'}}>✓ {po.digitalSignature.substring(0,16)}...</span>
                          : <span className="text-muted text-sm">—</span>
                        }
                      </td>
                      <td>
                        <div className="flex gap-2">
                          {po.status === 'pending_approval' && (
                            <button onClick={() => handleApprove(po.id)} className="btn btn-success btn-sm">
                              <CheckCircle size={13}/> Approve
                            </button>
                          )}
                          {next && po.status !== 'pending_approval' && (
                            <button onClick={() => handleStatusUpdate(po.id, next)} className="btn btn-secondary btn-sm">
                              → {statusLabel(next)}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
