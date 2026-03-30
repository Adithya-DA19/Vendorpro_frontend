import { useState, useEffect } from 'react';
import { quotations as quotationsAPI, rfqs as rfqsAPI, vendors as vendorsAPI } from '../utils/api';
import { fmt, statusColor, statusLabel } from '../utils/helpers';
import { Plus, MessageSquare } from 'lucide-react';

function SubmitQuotationModal({ onClose, onSave }) {
  const [rfqList, setRfqList] = useState([]);
  const [vendorList, setVendorList] = useState([]);
  const [form, setForm] = useState({ rfqId:'', vendorId:'', validUntil:'', deliveryDays:'', paymentTerms:'30 days net', warranty:'12 months', notes:'', items:[{ description:'', quantity:1, unit:'pcs', unitPrice:'', gstRate:18, hsnCode:'' }] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([rfqsAPI.list({ status:'open' }), vendorsAPI.list({ status:'approved' })]).then(([r, v]) => { setRfqList(r.data); setVendorList(v.data); });
  }, []);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const setItem = (i, k, v) => setForm(f => { const items=[...f.items]; items[i]={...items[i],[k]:v}; return {...f,items}; });
  const addItem = () => setForm(f => ({...f, items:[...f.items, { description:'', quantity:1, unit:'pcs', unitPrice:'', gstRate:18, hsnCode:'' }]}));
  const removeItem = (i) => setForm(f => ({...f, items:f.items.filter((_,idx)=>idx!==i)}));

  const total = form.items.reduce((s,i) => s + (i.quantity||0)*(+i.unitPrice||0), 0);
  const tax = form.items.reduce((s,i) => s + (i.quantity||0)*(+i.unitPrice||0)*(i.gstRate/100), 0);

  const submit = async () => {
    setLoading(true); setError('');
    try {
      const items = form.items.map(i=>({...i, quantity:+i.quantity, unitPrice:+i.unitPrice}));
      const res = await quotationsAPI.submit({...form, items});
      onSave(res.data);
    } catch(e) { setError(e.message || 'Failed to submit'); }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:800}} onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Submit Quotation</div>
          <button onClick={onClose} className="btn btn-secondary btn-sm">✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-row">
            <div className="form-group">
              <label>RFQ *</label>
              <select value={form.rfqId} onChange={e=>set('rfqId',e.target.value)}>
                <option value="">Select RFQ</option>
                {rfqList.map(r=><option key={r.id} value={r.id}>{r.rfqNumber} – {r.title}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Vendor *</label>
              <select value={form.vendorId} onChange={e=>set('vendorId',e.target.value)}>
                <option value="">Select Vendor</option>
                {vendorList.map(v=><option key={v.id} value={v.id}>{v.companyName}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Valid Until</label><input type="date" value={form.validUntil} onChange={e=>set('validUntil',e.target.value)}/></div>
            <div className="form-group"><label>Delivery Days</label><input type="number" value={form.deliveryDays} onChange={e=>set('deliveryDays',e.target.value)} placeholder="15"/></div>
            <div className="form-group"><label>Payment Terms</label><input value={form.paymentTerms} onChange={e=>set('paymentTerms',e.target.value)}/></div>
            <div className="form-group"><label>Warranty</label><input value={form.warranty} onChange={e=>set('warranty',e.target.value)}/></div>
          </div>

          <div style={{fontFamily:'Syne,sans-serif',fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:'var(--text-muted)',margin:'16px 0 12px'}}>Line Items</div>
          {form.items.map((item, i) => (
            <div key={i} style={{border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',padding:12,marginBottom:10}}>
              <div className="form-row">
                <div className="form-group" style={{gridColumn:'1/-1'}}><label>Description</label><input value={item.description} onChange={e=>setItem(i,'description',e.target.value)} placeholder="Steel Rod 12mm"/></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Qty</label><input type="number" value={item.quantity} onChange={e=>setItem(i,'quantity',e.target.value)}/></div>
                <div className="form-group"><label>Unit</label><input value={item.unit} onChange={e=>setItem(i,'unit',e.target.value)}/></div>
                <div className="form-group"><label>Unit Price (₹)</label><input type="number" value={item.unitPrice} onChange={e=>setItem(i,'unitPrice',e.target.value)}/></div>
                <div className="form-group"><label>GST %</label><select value={item.gstRate} onChange={e=>setItem(i,'gstRate',+e.target.value)}><option value={5}>5%</option><option value={12}>12%</option><option value={18}>18%</option><option value={28}>28%</option></select></div>
                <div className="form-group"><label>HSN Code</label><input value={item.hsnCode} onChange={e=>setItem(i,'hsnCode',e.target.value)}/></div>
                <div style={{display:'flex',alignItems:'flex-end',paddingBottom:18}}>
                  {form.items.length > 1 && <button onClick={() => removeItem(i)} className="btn btn-danger btn-sm">Remove</button>}
                </div>
              </div>
              <div style={{textAlign:'right',fontSize:12,color:'var(--text-muted)'}}>
                Line Total: <strong style={{color:'var(--text)'}}>{fmt.currency(item.quantity * (+item.unitPrice||0))}</strong>
              </div>
            </div>
          ))}
          <button onClick={addItem} className="btn btn-secondary btn-sm"><Plus size={13}/> Add Item</button>

          <div style={{marginTop:16,padding:'12px 16px',background:'var(--bg)',borderRadius:'var(--radius-sm)',border:'1px solid var(--border)',display:'flex',gap:20,justifyContent:'flex-end',fontSize:13}}>
            <span>Subtotal: <strong>{fmt.currency(total)}</strong></span>
            <span>Tax: <strong>{fmt.currency(tax)}</strong></span>
            <span style={{fontWeight:700,color:'var(--accent)'}}>Grand Total: {fmt.currency(total + tax)}</span>
          </div>

          <div className="form-group" style={{marginTop:12}}><label>Notes</label><textarea value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Additional terms or notes..."/></div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={submit} disabled={loading||!form.rfqId||!form.vendorId} className="btn btn-primary">{loading?'Submitting...':'Submit Quotation'}</button>
        </div>
      </div>
    </div>
  );
}

export default function Quotations() {
  const [quotationList, setQuotationList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const load = () => {
    setLoading(true);
    quotationsAPI.list().then(r => { setQuotationList(r.data); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{fontSize:22}}>Quotations</h2>
          <p className="text-muted text-sm" style={{marginTop:4}}>Vendor quote submissions and comparison</p>
        </div>
        <button onClick={() => setModal('submit')} className="btn btn-primary"><Plus size={15}/> Submit Quotation</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div className="loading-state"><div className="spinner"/></div>
          ) : quotationList.length === 0 ? (
            <div className="empty-state"><MessageSquare size={40}/><p>No quotations yet</p></div>
          ) : (
            <table>
              <thead>
                <tr><th>Quote #</th><th>Vendor</th><th>RFQ</th><th>Items</th><th>Subtotal</th><th>Tax</th><th>Grand Total</th><th>Delivery</th><th>Valid Until</th><th>Status</th></tr>
              </thead>
              <tbody>
                {quotationList.map(q => (
                  <tr key={q.id}>
                    <td><span className="mono">{q.quotationNumber}</span></td>
                    <td>
                      <div style={{fontWeight:600,fontSize:13}}>{q.vendor?.companyName}</div>
                      <div className="text-muted text-sm">{q.vendor?.category?.replace(/_/g,' ')}</div>
                    </td>
                    <td><span className="mono" style={{fontSize:11}}>{q.rfq?.rfqNumber}</span></td>
                    <td style={{textAlign:'center'}}>{q.items?.length || 0}</td>
                    <td className="mono">{fmt.currency(q.totalAmount)}</td>
                    <td className="mono">{fmt.currency(q.taxAmount)}</td>
                    <td><strong style={{fontFamily:'DM Mono,monospace',color:'var(--accent)'}}>{fmt.currency(q.grandTotal)}</strong></td>
                    <td style={{fontSize:12}}>{q.deliveryDays} days</td>
                    <td className="text-muted text-sm">{fmt.date(q.validUntil)}</td>
                    <td>
                      <div style={{display:'flex',gap:4,flexDirection:'column'}}>
                        <span className={`badge badge-${statusColor(q.status)}`}>{statusLabel(q.status)}</span>
                        {q.isRecommended && <span className="badge badge-amber">⭐ Recommended</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal === 'submit' && <SubmitQuotationModal onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }}/>}
    </div>
  );
}
