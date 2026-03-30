import { useState, useEffect } from 'react';
import { vendors as vendorsAPI } from '../utils/api';
import { fmt, statusColor, statusLabel, Stars } from '../utils/helpers';
import { Plus, Search, Filter, Eye, CheckCircle, XCircle, Star, ChevronDown } from 'lucide-react';

const CATEGORIES = ['all', 'raw_material', 'services', 'equipment', 'logistics', 'IT', 'general'];
const STATUSES = ['all', 'approved', 'pending', 'blacklisted'];

function VendorModal({ onClose, onSave, vendor }) {
  const [form, setForm] = useState(vendor || {
    companyName:'', contactPerson:'', email:'', phone:'', address:'', city:'', state:'', pincode:'',
    gstNumber:'', panNumber:'', category:'raw_material', bankName:'', bankAccountNo:'', ifscCode:''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  const submit = async () => {
    setLoading(true); setError('');
    try {
      let res;
      if (vendor) res = await vendorsAPI.update(vendor.id, form);
      else res = await vendorsAPI.create(form);
      onSave(res.data);
    } catch(e) { setError(e.message || 'Failed to save vendor'); }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:700}} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{vendor ? 'Edit Vendor' : 'Register New Vendor'}</div>
          <button onClick={onClose} className="btn btn-secondary btn-sm">✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          <div style={{fontFamily:'Syne,sans-serif',fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:'var(--text-muted)',marginBottom:12}}>Company Info</div>
          <div className="form-row">
            <div className="form-group"><label>Company Name *</label><input value={form.companyName} onChange={e=>set('companyName',e.target.value)} placeholder="Tata Steel Ltd"/></div>
            <div className="form-group"><label>Contact Person</label><input value={form.contactPerson} onChange={e=>set('contactPerson',e.target.value)} placeholder="John Doe"/></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Email *</label><input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="contact@vendor.com"/></div>
            <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+91-9XXXXXXXXX"/></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Category</label>
              <select value={form.category} onChange={e=>set('category',e.target.value)}>
                {['raw_material','services','equipment','logistics','IT','general'].map(c => <option key={c} value={c}>{c.replace(/_/g,' ')}</option>)}
              </select>
            </div>
            <div className="form-group"><label>GST Number *</label><input value={form.gstNumber} onChange={e=>set('gstNumber',e.target.value)} placeholder="27AABCT3518K1Z0"/></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>PAN Number</label><input value={form.panNumber} onChange={e=>set('panNumber',e.target.value)} placeholder="AABCT3518K"/></div>
            <div className="form-group"><label>Address</label><input value={form.address} onChange={e=>set('address',e.target.value)} placeholder="123, Industrial Area"/></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>City</label><input value={form.city} onChange={e=>set('city',e.target.value)} placeholder="Mumbai"/></div>
            <div className="form-group"><label>State</label><input value={form.state} onChange={e=>set('state',e.target.value)} placeholder="Maharashtra"/></div>
            <div className="form-group"><label>Pincode</label><input value={form.pincode} onChange={e=>set('pincode',e.target.value)} placeholder="400001"/></div>
          </div>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:'var(--text-muted)',margin:'16px 0 12px'}}>Bank Details</div>
          <div className="form-row">
            <div className="form-group"><label>Bank Name</label><input value={form.bankName} onChange={e=>set('bankName',e.target.value)} placeholder="State Bank of India"/></div>
            <div className="form-group"><label>Account Number</label><input value={form.bankAccountNo} onChange={e=>set('bankAccountNo',e.target.value)} placeholder="SBI1234567890"/></div>
            <div className="form-group"><label>IFSC Code</label><input value={form.ifscCode} onChange={e=>set('ifscCode',e.target.value)} placeholder="SBIN0001234"/></div>
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={submit} className="btn btn-primary" disabled={loading}>
            {loading ? <><span className="spinner" style={{width:14,height:14}}/> Saving...</> : 'Save Vendor'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EvaluationModal({ vendor, onClose, onSave }) {
  const [form, setForm] = useState({ qualityScore:80, deliveryScore:80, responseScore:80, complianceScore:80, comments:'' });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const res = await vendorsAPI.evaluate(vendor.id, form);
      onSave(res.data);
    } catch(e) { alert(e.message); }
    setLoading(false);
  };

  const ScoreInput = ({ label, field }) => (
    <div className="form-group">
      <label>{label}: <strong style={{color:'var(--accent)'}}>{form[field]}</strong>/100</label>
      <input type="range" min={0} max={100} value={form[field]} onChange={e => setForm(f=>({...f,[field]:+e.target.value}))}
        style={{padding:0,background:'none',border:'none',cursor:'pointer',accentColor:'var(--accent)'}}/>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Evaluate: {vendor.companyName}</div>
          <button onClick={onClose} className="btn btn-secondary btn-sm">✕</button>
        </div>
        <div className="modal-body">
          <ScoreInput label="Quality Score" field="qualityScore"/>
          <ScoreInput label="Delivery/On-Time Score" field="deliveryScore"/>
          <ScoreInput label="Response Score" field="responseScore"/>
          <ScoreInput label="Compliance Score" field="complianceScore"/>
          <div className="form-group"><label>Comments</label><textarea value={form.comments} onChange={e=>setForm(f=>({...f,comments:e.target.value}))} placeholder="Performance notes..."/></div>
          <div className="alert alert-info">Overall Score: {Math.round((form.qualityScore+form.deliveryScore+form.responseScore+form.complianceScore)/4)}/100</div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={submit} className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Submit Evaluation'}</button>
        </div>
      </div>
    </div>
  );
}

function BlacklistModal({ vendor, onClose, onSave }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!reason.trim()) return alert('Reason required');
    setLoading(true);
    try {
      const res = await vendorsAPI.blacklist(vendor.id, { reason });
      onSave(res.data);
    } catch(e) { alert(e.message); }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:480}} onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{color:'var(--red)'}}>Blacklist Vendor</div>
          <button onClick={onClose} className="btn btn-secondary btn-sm">✕</button>
        </div>
        <div className="modal-body">
          <div className="alert alert-error">Warning: Blacklisting {vendor.companyName} will prevent them from receiving future RFQs.</div>
          <div className="form-group"><label>Reason *</label><textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder="Describe the reason for blacklisting..." rows={4}/></div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={submit} className="btn btn-danger" disabled={loading}>{loading ? 'Processing...' : 'Confirm Blacklist'}</button>
        </div>
      </div>
    </div>
  );
}

export default function Vendors() {
  const [vendorList, setVendorList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [modal, setModal] = useState(null); // null | 'create' | 'edit' | 'evaluate' | 'blacklist'
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category !== 'all') params.category = category;
      if (status !== 'all') params.status = status;
      const res = await vendorsAPI.list(params);
      setVendorList(res.data);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [search, category, status]);

  const handleApprove = async (vendor) => {
    try {
      await vendorsAPI.approve(vendor.id);
      load();
    } catch(e) { alert(e.message); }
  };

  const handleSave = () => { setModal(null); setSelected(null); load(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{fontSize:22}}>Vendor Management</h2>
          <p className="text-muted text-sm" style={{marginTop:4}}>Manage supplier registrations, evaluations, and performance</p>
        </div>
        <button onClick={() => setModal('create')} className="btn btn-primary">
          <Plus size={15}/> Add Vendor
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="card-body" style={{padding:16}}>
          <div className="flex gap-3 items-center" style={{flexWrap:'wrap'}}>
            <div style={{position:'relative',flex:1,minWidth:220}}>
              <Search size={14} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)'}}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, email, GST..." style={{paddingLeft:32}}/>
            </div>
            <select value={category} onChange={e=>setCategory(e.target.value)} style={{width:'auto'}}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.replace(/_/g,' ')}</option>)}
            </select>
            <select value={status} onChange={e=>setStatus(e.target.value)} style={{width:'auto'}}>
              {STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div className="loading-state"><div className="spinner"/> Loading vendors...</div>
          ) : vendorList.length === 0 ? (
            <div className="empty-state"><Users size={40}/><p>No vendors found</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Vendor</th><th>Category</th><th>GST No.</th><th>Rating</th>
                  <th>Performance</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendorList.map(v => (
                  <tr key={v.id}>
                    <td>
                      <div style={{fontWeight:600,fontSize:13}}>{v.companyName}</div>
                      <div className="text-muted text-sm">{v.email}</div>
                    </td>
                    <td><span className="badge badge-blue" style={{textTransform:'capitalize'}}>{v.category?.replace(/_/g,' ')}</span></td>
                    <td><span className="mono">{v.gstNumber}</span></td>
                    <td><Stars score={v.ratingScore}/></td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div className="progress" style={{width:70}}>
                          <div className={`progress-bar ${v.performanceScore>=70?'green':v.performanceScore>=40?'blue':'amber'}`} style={{width:`${v.performanceScore}%`}}/>
                        </div>
                        <span style={{fontSize:11,color:'var(--text-muted)'}}>{v.performanceScore}%</span>
                      </div>
                    </td>
                    <td><span className={`badge badge-${statusColor(v.status)}`}>{statusLabel(v.status)}</span></td>
                    <td>
                      <div className="flex gap-2">
                        {v.status === 'pending' && (
                          <button onClick={() => handleApprove(v)} className="btn btn-success btn-sm" title="Approve">
                            <CheckCircle size={13}/>
                          </button>
                        )}
                        <button onClick={() => { setSelected(v); setModal('evaluate'); }} className="btn btn-secondary btn-sm" title="Evaluate">
                          <Star size={13}/>
                        </button>
                        <button onClick={() => { setSelected(v); setModal('edit'); }} className="btn btn-secondary btn-sm" title="Edit">Edit</button>
                        {v.status !== 'blacklisted' && (
                          <button onClick={() => { setSelected(v); setModal('blacklist'); }} className="btn btn-danger btn-sm" title="Blacklist">
                            <XCircle size={13}/>
                          </button>
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

      {modal === 'create' && <VendorModal onClose={() => setModal(null)} onSave={handleSave}/>}
      {modal === 'edit' && selected && <VendorModal vendor={selected} onClose={() => setModal(null)} onSave={handleSave}/>}
      {modal === 'evaluate' && selected && <EvaluationModal vendor={selected} onClose={() => setModal(null)} onSave={handleSave}/>}
      {modal === 'blacklist' && selected && <BlacklistModal vendor={selected} onClose={() => setModal(null)} onSave={handleSave}/>}
    </div>
  );
}
