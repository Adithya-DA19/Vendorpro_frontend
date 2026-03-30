import { useState, useEffect } from 'react';
import { inventory as inventoryAPI, purchaseOrders as poAPI } from '../utils/api';
import { fmt, statusColor, statusLabel } from '../utils/helpers';
import { Package, Plus, CheckCircle, RotateCcw } from 'lucide-react';

function ReceiveGoodsModal({ onClose, onSave }) {
  const [poList, setPoList] = useState([]);
  const [form, setForm] = useState({ poId:'', notes:'', items:[{ name:'', sku:'', quantity:1, unit:'pcs' }] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    poAPI.list({ status:'approved' }).then(r => setPoList(r.data));
  }, []);

  const setItem = (i,k,v) => setForm(f => { const items=[...f.items]; items[i]={...items[i],[k]:v}; return {...f,items}; });
  const addItem = () => setForm(f => ({...f, items:[...f.items, { name:'', sku:'', quantity:1, unit:'pcs' }]}));

  const submit = async () => {
    setLoading(true);
    try {
      const res = await inventoryAPI.receive({ ...form, items: form.items.map(i=>({...i,quantity:+i.quantity})) });
      onSave(res.data);
    } catch(e) { alert(e.message); }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:680}} onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Receive Goods</div>
          <button onClick={onClose} className="btn btn-secondary btn-sm">✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Purchase Order *</label>
            <select value={form.poId} onChange={e=>setForm(f=>({...f,poId:e.target.value}))}>
              <option value="">Select PO</option>
              {poList.map(p=><option key={p.id} value={p.id}>{p.poNumber} – {p.vendor?.companyName}</option>)}
            </select>
          </div>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:'var(--text-muted)',margin:'16px 0 12px'}}>Received Items</div>
          {form.items.map((item, i) => (
            <div key={i} style={{border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',padding:12,marginBottom:10}}>
              <div className="form-row">
                <div className="form-group"><label>Item Name</label><input value={item.name} onChange={e=>setItem(i,'name',e.target.value)} placeholder="Steel Rod 12mm"/></div>
                <div className="form-group"><label>SKU</label><input value={item.sku} onChange={e=>setItem(i,'sku',e.target.value)} placeholder="SKU-1001"/></div>
                <div className="form-group"><label>Quantity</label><input type="number" value={item.quantity} onChange={e=>setItem(i,'quantity',e.target.value)}/></div>
                <div className="form-group"><label>Unit</label><input value={item.unit} onChange={e=>setItem(i,'unit',e.target.value)} placeholder="pcs"/></div>
              </div>
            </div>
          ))}
          <button onClick={addItem} className="btn btn-secondary btn-sm"><Plus size={13}/> Add Item</button>
          <div className="form-group" style={{marginTop:12}}><label>Notes</label><textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Delivery notes, condition, etc."/></div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={submit} disabled={loading||!form.poId} className="btn btn-primary">{loading?'Processing...':'Confirm Receipt'}</button>
        </div>
      </div>
    </div>
  );
}

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('stock');
  const [modal, setModal] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [invRes, receiptRes] = await Promise.all([inventoryAPI.list(), inventoryAPI.receipts()]);
      setItems(invRes.data);
      setReceipts(receiptRes.data);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleQualityApprove = async (receiptId) => {
    try {
      await inventoryAPI.qualityCheck(receiptId, { status:'approved', remarks:'Quality check passed' });
      load();
    } catch(e) { alert(e.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{fontSize:22}}>Inventory</h2>
          <p className="text-muted text-sm" style={{marginTop:4}}>Stock tracking, goods receipt, and quality control</p>
        </div>
        <button onClick={() => setModal('receive')} className="btn btn-primary"><Plus size={15}/> Receive Goods</button>
      </div>

      <div className="tabs">
        <div className={`tab ${tab==='stock'?'active':''}`} onClick={() => setTab('stock')}>Stock Levels</div>
        <div className={`tab ${tab==='receipts'?'active':''}`} onClick={() => setTab('receipts')}>Goods Receipts ({receipts.length})</div>
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner"/></div>
      ) : tab === 'stock' ? (
        <div className="card">
          <div className="table-wrap">
            {items.length === 0 ? (
              <div className="empty-state"><Package size={40}/><p>No inventory items</p></div>
            ) : (
              <table>
                <thead>
                  <tr><th>Item Name</th><th>SKU</th><th>Category</th><th>Current Stock</th><th>Reorder Level</th><th>Last Received</th><th>Location</th><th>Quality</th></tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td style={{fontWeight:600}}>{item.name}</td>
                      <td><span className="mono">{item.sku}</span></td>
                      <td><span className="badge badge-blue">{item.category?.replace(/_/g,' ')}</span></td>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <div className="progress" style={{width:60}}>
                            <div className={`progress-bar ${item.currentStock > item.reorderLevel * 2 ? 'green' : item.currentStock > item.reorderLevel ? 'amber' : 'amber'}`}
                              style={{width:`${Math.min(100, (item.currentStock/Math.max(item.reorderLevel*3,1))*100)}%`}}/>
                          </div>
                          <span style={{fontWeight:600,fontFamily:'DM Mono,monospace',fontSize:12}}>{fmt.number(item.currentStock)} {item.unit}</span>
                          {item.currentStock <= item.reorderLevel && <span className="badge badge-red">Low</span>}
                        </div>
                      </td>
                      <td style={{fontSize:12,color:'var(--text-muted)'}}>{fmt.number(item.reorderLevel)} {item.unit}</td>
                      <td className="text-muted text-sm">{fmt.date(item.lastReceivedDate)}</td>
                      <td style={{fontSize:12}}>{item.location}</td>
                      <td><span className={`badge badge-${statusColor(item.qualityStatus)}`}>{statusLabel(item.qualityStatus)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            {receipts.length === 0 ? (
              <div className="empty-state"><Package size={40}/><p>No goods receipts</p></div>
            ) : (
              <table>
                <thead>
                  <tr><th>Receipt Date</th><th>PO #</th><th>Vendor</th><th>Items</th><th>Quality Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {receipts.map(r => (
                    <tr key={r.id}>
                      <td className="text-sm">{fmt.date(r.receivedDate)}</td>
                      <td><span className="mono">{r.po?.poNumber}</span></td>
                      <td style={{fontWeight:600,fontSize:13}}>{r.vendor?.companyName}</td>
                      <td style={{fontSize:12}}>{r.items?.length || 0} items</td>
                      <td><span className={`badge badge-${statusColor(r.qualityStatus)}`}>{statusLabel(r.qualityStatus)}</span></td>
                      <td>
                        <div className="flex gap-2">
                          {r.qualityStatus === 'pending_inspection' && (
                            <>
                              <button onClick={() => handleQualityApprove(r.id)} className="btn btn-success btn-sm"><CheckCircle size={13}/> Approve QC</button>
                            </>
                          )}
                          {r.qualityStatus === 'approved' && <span className="text-muted text-sm">✓ Cleared</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {modal === 'receive' && <ReceiveGoodsModal onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }}/>}
    </div>
  );
}
