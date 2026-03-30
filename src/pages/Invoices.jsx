import { useState, useEffect } from 'react';
import { invoices as invoicesAPI } from '../utils/api';
import { fmt, statusColor, statusLabel } from '../utils/helpers';
import { Receipt, CheckCircle, Calendar, X } from 'lucide-react';

function InvoiceDetailModal({ invoiceId, onClose }) {
  const [inv, setInv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentForm, setPaymentForm] = useState({ amount:'', scheduledDate:'', paymentMethod:'bank_transfer', notes:'' });
  const [scheduling, setScheduling] = useState(false);
  const [tab, setTab] = useState('details');

  useEffect(() => {
    invoicesAPI.get(invoiceId).then(r => { setInv(r.data); setLoading(false); });
  }, [invoiceId]);

  const handleApprove = async () => {
    try { const r = await invoicesAPI.approve(invoiceId); setInv(r.data); } catch(e) { alert(e.message); }
  };

  const handlePayment = async () => {
    setScheduling(true);
    try {
      await invoicesAPI.schedulePayment(invoiceId, { ...paymentForm, amount: Number(paymentForm.amount) });
      const r = await invoicesAPI.get(invoiceId);
      setInv(r.data);
      setTab('payments');
      setPaymentForm({ amount:'', scheduledDate:'', paymentMethod:'bank_transfer', notes:'' });
    } catch(e) { alert(e.message); }
    setScheduling(false);
  };

  if (loading) return <div className="modal-overlay"><div className="modal"><div className="loading-state"><div className="spinner"/></div></div></div>;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:780}} onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{inv.invoiceNumber}</div>
            <div className="text-muted text-sm">{inv.vendor?.companyName} · PO: {inv.po?.poNumber}</div>
          </div>
          <div className="flex gap-2 items-center">
            <span className={`badge badge-${statusColor(inv.status)}`}>{statusLabel(inv.status)}</span>
            <span className={`badge badge-${statusColor(inv.paymentStatus)}`}>{statusLabel(inv.paymentStatus)}</span>
            <button onClick={onClose} className="btn btn-secondary btn-sm">✕</button>
          </div>
        </div>

        <div style={{padding:'0 24px'}}>
          <div className="tabs" style={{marginBottom:0}}>
            {['details','tax','payments'].map(t => <div key={t} className={`tab ${tab===t?'active':''}`} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</div>)}
          </div>
        </div>

        <div className="modal-body">
          {tab === 'details' && (
            <div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}}>
                {[
                  ['Invoice Date', fmt.date(inv.createdAt)],
                  ['Due Date', fmt.date(inv.dueDate)],
                  ['Payment Terms', inv.paymentTerms],
                  ['Budget Code', inv.budgetCode],
                  ['GST (CGST)', fmt.currency(inv.cgst)],
                  ['GST (SGST)', fmt.currency(inv.sgst)],
                  ['TDS Deduction', fmt.currency(inv.tdsAmount)],
                ].map(([k,v]) => (
                  <div key={k} style={{padding:'10px 14px',background:'var(--bg)',borderRadius:'var(--radius-sm)',border:'1px solid var(--border)'}}>
                    <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:2}}>{k}</div>
                    <div style={{fontWeight:600,fontSize:13}}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{background:'var(--accent-glow)',border:'1px solid rgba(79,124,255,0.2)',borderRadius:'var(--radius-sm)',padding:'14px 18px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontFamily:'Syne,sans-serif',fontWeight:700}}>Grand Total</span>
                <span style={{fontFamily:'DM Mono,monospace',fontSize:22,fontWeight:700,color:'var(--accent)'}}>{fmt.currency(inv.grandTotal)}</span>
              </div>
            </div>
          )}

          {tab === 'tax' && (
            <div>
              <table>
                <thead><tr><th>Tax Type</th><th>Base Amount</th><th>Rate</th><th>Tax Amount</th></tr></thead>
                <tbody>
                  <tr><td>CGST</td><td className="mono">{fmt.currency(inv.subtotal)}</td><td>9%</td><td className="mono">{fmt.currency(inv.cgst)}</td></tr>
                  <tr><td>SGST</td><td className="mono">{fmt.currency(inv.subtotal)}</td><td>9%</td><td className="mono">{fmt.currency(inv.sgst)}</td></tr>
                  <tr><td>IGST</td><td className="mono">{fmt.currency(inv.subtotal)}</td><td>0%</td><td className="mono">₹0</td></tr>
                  <tr style={{background:'var(--bg-hover)'}}><td><strong>TDS (Section 194C)</strong></td><td className="mono">{fmt.currency(inv.subtotal)}</td><td>1%</td><td className="mono" style={{color:'var(--red)'}}>-{fmt.currency(inv.tdsAmount)}</td></tr>
                </tbody>
              </table>
              <div style={{marginTop:16,padding:'12px 16px',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',fontSize:13}}>
                <div className="flex justify-between mb-4"><span>Subtotal:</span><span className="mono">{fmt.currency(inv.subtotal)}</span></div>
                <div className="flex justify-between mb-4"><span>Total Tax (GST):</span><span className="mono">{fmt.currency(inv.totalTax)}</span></div>
                <div className="flex justify-between" style={{fontWeight:700,fontSize:15,borderTop:'1px solid var(--border)',paddingTop:8}}>
                  <span>Net Payable (after TDS):</span>
                  <span className="mono" style={{color:'var(--accent)'}}>{fmt.currency(inv.grandTotal - inv.tdsAmount)}</span>
                </div>
              </div>
            </div>
          )}

          {tab === 'payments' && (
            <div>
              {inv.payments?.length > 0 && (
                <table style={{marginBottom:20}}>
                  <thead><tr><th>Amount</th><th>Method</th><th>Scheduled Date</th><th>Status</th></tr></thead>
                  <tbody>
                    {inv.payments.map(p => (
                      <tr key={p.id}>
                        <td className="mono">{fmt.currency(p.amount)}</td>
                        <td>{p.paymentMethod?.replace(/_/g,' ')}</td>
                        <td>{fmt.date(p.scheduledDate)}</td>
                        <td><span className={`badge badge-${statusColor(p.status)}`}>{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {inv.paymentStatus !== 'paid' && inv.status === 'approved' && (
                <div style={{border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',padding:16}}>
                  <div style={{fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:700,marginBottom:12}}>Schedule Payment</div>
                  <div className="form-row">
                    <div className="form-group"><label>Amount (₹)</label><input type="number" value={paymentForm.amount} onChange={e=>setPaymentForm(f=>({...f,amount:e.target.value}))} placeholder={inv.grandTotal}/></div>
                    <div className="form-group"><label>Scheduled Date</label><input type="date" value={paymentForm.scheduledDate} onChange={e=>setPaymentForm(f=>({...f,scheduledDate:e.target.value}))}/></div>
                    <div className="form-group">
                      <label>Payment Method</label>
                      <select value={paymentForm.paymentMethod} onChange={e=>setPaymentForm(f=>({...f,paymentMethod:e.target.value}))}>
                        <option value="bank_transfer">Bank Transfer (NEFT/RTGS)</option>
                        <option value="cheque">Cheque</option>
                        <option value="upi">UPI</option>
                        <option value="dd">Demand Draft</option>
                      </select>
                    </div>
                  </div>
                  <button onClick={handlePayment} disabled={scheduling || !paymentForm.amount || !paymentForm.scheduledDate} className="btn btn-primary btn-sm">
                    <Calendar size={13}/> {scheduling ? 'Scheduling...' : 'Schedule Payment'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          {inv.status === 'draft' && (
            <button onClick={handleApprove} className="btn btn-success"><CheckCircle size={14}/> Approve Invoice</button>
          )}
          <button onClick={onClose} className="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
  );
}

export default function Invoices() {
  const [invoiceList, setInvoiceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const [invRes, statsRes] = await Promise.all([invoicesAPI.list(params), invoicesAPI.stats()]);
      setInvoiceList(invRes.data);
      setStats(statsRes.data);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [statusFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{fontSize:22}}>Invoices</h2>
          <p className="text-muted text-sm" style={{marginTop:4}}>Manage invoices with GST, TDS, and payment scheduling</p>
        </div>
      </div>

      {stats && (
        <div className="kpi-grid" style={{gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',marginBottom:24}}>
          {[
            { label:'Total Invoices', value:stats.total, color:'blue' },
            { label:'Draft', value:stats.draft, color:'amber' },
            { label:'Approved', value:stats.approved, color:'green' },
            { label:'Paid', value:stats.paid, color:'green' },
            { label:'Overdue', value:stats.overdue, color:'red' },
            { label:'Pending Payment', value:fmt.currency(stats.pendingPayment), color:'amber' },
          ].map(k => (
            <div key={k.label} className={`kpi-card ${k.color}`}>
              <div className="kpi-value" style={{fontSize:18}}>{k.value}</div>
              <div className="kpi-label">{k.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="tabs">
        {['all','draft','approved'].map(s => (
          <div key={s} className={`tab ${statusFilter===s?'active':''}`} onClick={() => setStatusFilter(s)}>
            {s === 'all' ? 'All Invoices' : statusLabel(s)}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div className="loading-state"><div className="spinner"/></div>
          ) : invoiceList.length === 0 ? (
            <div className="empty-state"><Receipt size={40}/><p>No invoices found</p><p style={{fontSize:12}}>Invoices are auto-generated when a PO is marked as delivered</p></div>
          ) : (
            <table>
              <thead>
                <tr><th>Invoice #</th><th>Vendor</th><th>PO #</th><th>Subtotal</th><th>GST</th><th>Grand Total</th><th>Due Date</th><th>Status</th><th>Payment</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {invoiceList.map(inv => (
                  <tr key={inv.id}>
                    <td><span className="mono">{inv.invoiceNumber}</span></td>
                    <td>
                      <div style={{fontWeight:600,fontSize:13}}>{inv.vendor?.companyName}</div>
                      <div className="text-muted text-sm">{inv.vendor?.gstNumber}</div>
                    </td>
                    <td><span className="mono" style={{fontSize:11}}>{inv.po?.poNumber}</span></td>
                    <td className="mono">{fmt.currency(inv.subtotal)}</td>
                    <td className="mono">{fmt.currency(inv.totalTax)}</td>
                    <td><strong style={{fontFamily:'DM Mono,monospace',color:'var(--accent)'}}>{fmt.currency(inv.grandTotal)}</strong></td>
                    <td className={`text-sm ${new Date(inv.dueDate)<new Date()&&inv.paymentStatus!=='paid'?'text-sm':'text-muted'}`} style={new Date(inv.dueDate)<new Date()&&inv.paymentStatus!=='paid'?{color:'var(--red)'}:{}}>
                      {fmt.date(inv.dueDate)}
                    </td>
                    <td><span className={`badge badge-${statusColor(inv.status)}`}>{statusLabel(inv.status)}</span></td>
                    <td><span className={`badge badge-${statusColor(inv.paymentStatus)}`}>{statusLabel(inv.paymentStatus)}</span></td>
                    <td>
                      <button onClick={() => setSelectedId(inv.id)} className="btn btn-secondary btn-sm">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedId && <InvoiceDetailModal invoiceId={selectedId} onClose={() => { setSelectedId(null); load(); }}/>}
    </div>
  );
}
