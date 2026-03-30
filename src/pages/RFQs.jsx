import { useState, useEffect } from 'react';
import { rfqs as rfqsAPI, vendors as vendorsAPI, quotations as quotationsAPI } from '../utils/api';
import { fmt, statusColor, statusLabel } from '../utils/helpers';
import { Plus, Send, BarChart2, Eye, X, Check } from 'lucide-react';

function RFQModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    title:'', description:'', category:'raw_material', specifications:'',
    quantity:'', unit:'pcs', estimatedBudget:'',
    submissionDeadline:'', deliveryDate:'', paymentTerms:'30 days net', vendorIds:[]
  });
  const [vendorList, setVendorList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    vendorsAPI.list({ status: 'approved' }).then(r => setVendorList(r.data));
  }, []);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const toggleVendor = (id) => setForm(f => ({
    ...f,
    vendorIds: f.vendorIds.includes(id) ? f.vendorIds.filter(x=>x!==id) : [...f.vendorIds, id]
  }));

  const submit = async () => {
    setLoading(true); setError('');
    try {
      const res = await rfqsAPI.create({
        ...form,
        quantity: Number(form.quantity),
        estimatedBudget: Number(form.estimatedBudget)
      });
      onSave(res.data);
    } catch(e) { setError(e.message || 'Failed to create RFQ'); }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:720}} onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Create New RFQ</div>
          <button onClick={onClose} className="btn btn-secondary btn-sm">✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-row">
            <div className="form-group" style={{gridColumn:'1/-1'}}><label>Title *</label><input value={form.title} onChange={e=>set('title',e.target.value)} placeholder="Steel Rods Q2 2026"/></div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={e=>set('category',e.target.value)}>
                {['raw_material','services','equipment','logistics','IT','general'].map(c=><option key={c} value={c}>{c.replace(/_/g,' ')}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Quantity</label><input type="number" value={form.quantity} onChange={e=>set('quantity',e.target.value)} placeholder="100"/></div>
            <div className="form-group"><label>Unit</label><input value={form.unit} onChange={e=>set('unit',e.target.value)} placeholder="pcs"/></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Estimated Budget (₹)</label><input type="number" value={form.estimatedBudget} onChange={e=>set('estimatedBudget',e.target.value)} placeholder="500000"/></div>
            <div className="form-group"><label>Submission Deadline *</label><input type="datetime-local" value={form.submissionDeadline} onChange={e=>set('submissionDeadline',e.target.value)}/></div>
            <div className="form-group"><label>Expected Delivery</label><input type="date" value={form.deliveryDate} onChange={e=>set('deliveryDate',e.target.value)}/></div>
          </div>
          <div className="form-group"><label>Specifications</label><textarea value={form.specifications} onChange={e=>set('specifications',e.target.value)} placeholder="Technical specifications, quality requirements..."/></div>
          <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Brief description of requirements..."/></div>
          <div className="form-group"><label>Payment Terms</label><input value={form.paymentTerms} onChange={e=>set('paymentTerms',e.target.value)} placeholder="30 days net"/></div>

          <div style={{fontFamily:'Syne,sans-serif',fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:'var(--text-muted)',margin:'16px 0 12px'}}>
            Select Vendors ({form.vendorIds.length} selected)
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,maxHeight:200,overflowY:'auto'}}>
            {vendorList.map(v => (
              <div key={v.id} onClick={() => toggleVendor(v.id)}
                style={{padding:'10px 12px',border:`1px solid ${form.vendorIds.includes(v.id)?'var(--accent)':'var(--border)'}`,
                  borderRadius:'var(--radius-sm)',cursor:'pointer',background:form.vendorIds.includes(v.id)?'var(--accent-glow)':'transparent',
                  transition:'all 0.15s',display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:16,height:16,border:`2px solid ${form.vendorIds.includes(v.id)?'var(--accent)':'var(--border-light)'}`,
                  borderRadius:4,background:form.vendorIds.includes(v.id)?'var(--accent)':'transparent',flexShrink:0,
                  display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {form.vendorIds.includes(v.id) && <Check size={10} color="white"/>}
                </div>
                <div>
                  <div style={{fontSize:12,fontWeight:600}}>{v.companyName}</div>
                  <div style={{fontSize:11,color:'var(--text-muted)'}}>{v.category?.replace(/_/g,' ')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={submit} className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create RFQ'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CompareModal({ rfqId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    rfqsAPI.compare(rfqId).then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [rfqId]);

  const [acceptingId, setAcceptingId] = useState(null);
  const handleAccept = async (quotationId) => {
    setAcceptingId(quotationId);
    try {
      await quotationsAPI.accept(quotationId);
      onClose(true);
    } catch(e) { alert(e.message); setAcceptingId(null); }
  };

  if (loading) return <div className="modal-overlay"><div className="modal"><div className="loading-state"><div className="spinner"/> Loading comparison...</div></div></div>;
  if (!data) return null;

  const { quotations, analysis } = data;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:900}} onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Quotation Comparison</div>
          <button onClick={onClose} className="btn btn-secondary btn-sm">✕</button>
        </div>
        <div className="modal-body">
          <div className="alert alert-info" style={{marginBottom:16}}>
            💡 <strong>Recommendation:</strong> {analysis.recommendation}
          </div>
          <div style={{display:'flex',gap:12,marginBottom:16,flexWrap:'wrap'}}>
            <div style={{padding:'10px 14px',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',fontSize:12}}>
              <div className="text-muted">Price Range</div>
              <div style={{fontWeight:600,fontFamily:'DM Mono,monospace'}}>{fmt.currency(analysis.priceRange.min)} – {fmt.currency(analysis.priceRange.max)}</div>
            </div>
            <div style={{padding:'10px 14px',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',fontSize:12}}>
              <div className="text-muted">Average Price</div>
              <div style={{fontWeight:600,fontFamily:'DM Mono,monospace'}}>{fmt.currency(analysis.avgPrice)}</div>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Vendor</th><th>Subtotal</th><th>Tax (GST)</th><th>Grand Total</th>
                  <th>Delivery</th><th>Payment Terms</th><th>Warranty</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map(q => (
                  <tr key={q.id} className={q.vendorId === analysis.lowestPriceVendorId ? 'comparison-winner' : ''}>
                    <td>
                      <div style={{fontWeight:600,fontSize:13}}>{q.vendor?.companyName}</div>
                      {q.vendorId === analysis.lowestPriceVendorId && <span className="badge badge-green" style={{marginTop:2}}>Lowest Price</span>}
                      {q.vendorId === analysis.bestValueVendorId && q.vendorId !== analysis.lowestPriceVendorId && <span className="badge badge-blue" style={{marginTop:2}}>Best Value</span>}
                    </td>
                    <td className="mono">{fmt.currency(q.totalAmount)}</td>
                    <td className="mono">{fmt.currency(q.taxAmount)}</td>
                    <td style={{fontWeight:700,fontFamily:'DM Mono,monospace',color:'var(--accent)'}}>{fmt.currency(q.grandTotal)}</td>
                    <td>{q.deliveryDays} days</td>
                    <td style={{fontSize:12}}>{q.paymentTerms}</td>
                    <td style={{fontSize:12}}>{q.warranty || '—'}</td>
                    <td>
                      {q.status === 'accepted' ? (
                        <span className="badge badge-green">Accepted</span>
                      ) : (
                        <button onClick={() => handleAccept(q.id)} className="btn btn-success btn-sm" disabled={acceptingId === q.id}>
                          {acceptingId === q.id ? 'Accepting...' : 'Accept'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RFQs() {
  const [rfqList, setRfqList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const load = () => {
    setLoading(true);
    rfqsAPI.list(statusFilter !== 'all' ? { status: statusFilter } : {})
      .then(r => { setRfqList(r.data); setLoading(false); });
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleSend = async (rfq) => {
    try {
      await rfqsAPI.send(rfq.id, {});
      load();
    } catch(e) { alert(e.message); }
  };

  const handleClose = async (rfq) => {
    if (!window.confirm('Close this RFQ?')) return;
    try { await rfqsAPI.close(rfq.id); load(); } catch(e) { alert(e.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{fontSize:22}}>RFQ Management</h2>
          <p className="text-muted text-sm" style={{marginTop:4}}>Create and manage requests for quotation</p>
        </div>
        <button onClick={() => setModal('create')} className="btn btn-primary"><Plus size={15}/> New RFQ</button>
      </div>

      <div className="tabs">
        {['all','draft','open','evaluation','closed'].map(s => (
          <div key={s} className={`tab ${statusFilter===s?'active':''}`} onClick={() => setStatusFilter(s)}>
            {s === 'all' ? 'All RFQs' : statusLabel(s)}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div className="loading-state"><div className="spinner"/> Loading...</div>
          ) : rfqList.length === 0 ? (
            <div className="empty-state"><FileText size={40}/><p>No RFQs found</p></div>
          ) : (
            <table>
              <thead>
                <tr><th>RFQ #</th><th>Title</th><th>Category</th><th>Budget</th><th>Deadline</th><th>Vendors</th><th>Quotes</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {rfqList.map(r => (
                  <tr key={r.id}>
                    <td><span className="mono">{r.rfqNumber}</span></td>
                    <td style={{maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontWeight:600}}>{r.title}</td>
                    <td><span className="badge badge-blue">{r.category?.replace(/_/g,' ')}</span></td>
                    <td><span className="mono">{fmt.currency(r.estimatedBudget)}</span></td>
                    <td className="text-sm text-muted">{fmt.date(r.submissionDeadline)}</td>
                    <td style={{textAlign:'center'}}>{r.vendorCount || 0}</td>
                    <td style={{textAlign:'center'}}>{r.quotationCount || 0}</td>
                    <td><span className={`badge badge-${statusColor(r.status)}`}>{statusLabel(r.status)}</span></td>
                    <td>
                      <div className="flex gap-2">
                        {r.status === 'draft' && (
                          <button onClick={() => handleSend(r)} className="btn btn-primary btn-sm"><Send size={12}/> Send</button>
                        )}
                        {(r.status === 'open' || r.status === 'evaluation') && r.quotationCount > 0 && (
                          <button onClick={() => { setSelected(r); setModal('compare'); }} className="btn btn-secondary btn-sm"><BarChart2 size={12}/> Compare</button>
                        )}
                        {r.status === 'open' && (
                          <button onClick={() => handleClose(r)} className="btn btn-secondary btn-sm">Close</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal === 'create' && <RFQModal onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }}/>}
      {modal === 'compare' && selected && <CompareModal rfqId={selected.id} onClose={(refresh) => { setModal(null); if(refresh) load(); }}/>}
    </div>
  );
}
