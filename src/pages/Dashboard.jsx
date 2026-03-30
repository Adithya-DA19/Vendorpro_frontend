import { useState, useEffect } from 'react';
import { dashboard } from '../utils/api';
import { fmt, statusColor, statusLabel } from '../utils/helpers';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, FileText, ShoppingCart, Receipt, TrendingUp, AlertCircle, Clock, CheckCircle } from 'lucide-react';

const COLORS = ['#4f7cff', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboard.get().then(r => { setData(r.data); setLoading(false); });
  }, []);

  if (loading) return <div className="loading-state"><div className="spinner" /> Loading dashboard...</div>;

  const { kpis, recentRFQs, recentPOs, spendByCategory, monthlyTrend, topVendors } = data;

  const categoryData = Object.entries(spendByCategory).map(([k, v]) => ({ name: k.replace(/_/g,' '), value: v }));

  return (
    <div>
      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-icon"><Users size={18} /></div>
          <div className="kpi-value">{kpis.totalVendors}</div>
          <div className="kpi-label">Total Vendors</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-icon"><CheckCircle size={18} /></div>
          <div className="kpi-value">{kpis.approvedVendors}</div>
          <div className="kpi-label">Approved Vendors</div>
        </div>
        <div className="kpi-card amber">
          <div className="kpi-icon"><FileText size={18} /></div>
          <div className="kpi-value">{kpis.activeRFQs}</div>
          <div className="kpi-label">Active RFQs</div>
        </div>
        <div className="kpi-card purple">
          <div className="kpi-icon"><Clock size={18} /></div>
          <div className="kpi-value">{kpis.pendingQuotations}</div>
          <div className="kpi-label">Pending Quotations</div>
        </div>
        <div className="kpi-card amber">
          <div className="kpi-icon"><ShoppingCart size={18} /></div>
          <div className="kpi-value">{kpis.pendingPOs}</div>
          <div className="kpi-label">POs Awaiting Approval</div>
        </div>
        <div className="kpi-card red">
          <div className="kpi-icon"><AlertCircle size={18} /></div>
          <div className="kpi-value">{kpis.overdueInvoices}</div>
          <div className="kpi-label">Overdue Invoices</div>
        </div>
        <div className="kpi-card blue">
          <div className="kpi-icon"><TrendingUp size={18} /></div>
          <div className="kpi-value">{fmt.currency(kpis.monthlySpend)}</div>
          <div className="kpi-label">Monthly Spend</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-icon"><Receipt size={18} /></div>
          <div className="kpi-value">{fmt.currency(kpis.totalProcurementValue)}</div>
          <div className="kpi-label">Total Procurement</div>
        </div>
      </div>

      <div className="grid-2 mb-6">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Monthly Procurement Trend</div>
          </div>
          <div style={{padding:'16px 16px 8px'}}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f7cff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f7cff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`}/>
                <Tooltip formatter={v => fmt.currency(v)} contentStyle={{background:'#111318',border:'1px solid #1e2128',borderRadius:'8px',color:'#f0f2f5'}}/>
                <Area type="monotone" dataKey="value" stroke="#4f7cff" strokeWidth={2} fill="url(#grad)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Spend by Category</div>
          </div>
          <div style={{padding:'16px',display:'flex',alignItems:'center',gap:'16px'}}>
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => fmt.currency(v)} contentStyle={{background:'#111318',border:'1px solid #1e2128',borderRadius:'8px',color:'#f0f2f5'}}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{flex:1,display:'flex',flexDirection:'column',gap:'8px'}}>
              {categoryData.map((item, i) => (
                <div key={i} style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'12px'}}>
                  <div style={{width:10,height:10,borderRadius:'50%',background:COLORS[i%COLORS.length],flexShrink:0}}/>
                  <span style={{flex:1,color:'var(--text-dim)',textTransform:'capitalize'}}>{item.name}</span>
                  <span style={{fontWeight:600,fontFamily:'DM Mono, monospace',fontSize:11}}>{fmt.currency(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2 mb-6">
        <div className="card">
          <div className="card-header"><div className="card-title">Recent RFQs</div></div>
          <table>
            <thead><tr><th>RFQ #</th><th>Title</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {recentRFQs.map(r => (
                <tr key={r.id}>
                  <td><span className="mono">{r.rfqNumber}</span></td>
                  <td style={{maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.title}</td>
                  <td><span className={`badge badge-${statusColor(r.status)}`}>{statusLabel(r.status)}</span></td>
                  <td className="text-muted text-sm">{fmt.date(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Recent Purchase Orders</div></div>
          <table>
            <thead><tr><th>PO #</th><th>Vendor</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {recentPOs.map(p => (
                <tr key={p.id}>
                  <td><span className="mono">{p.poNumber}</span></td>
                  <td style={{maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.vendorName}</td>
                  <td style={{fontWeight:600,fontFamily:'DM Mono, monospace',fontSize:12}}>{fmt.currency(p.grandTotal)}</td>
                  <td><span className={`badge badge-${statusColor(p.status)}`}>{statusLabel(p.status)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Top Vendors by Procurement Value</div></div>
        <div style={{padding:'16px 16px 8px'}}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topVendors} layout="vertical">
              <XAxis type="number" tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`}/>
              <YAxis type="category" dataKey="vendorName" tick={{fill:'#9ca3af',fontSize:11}} axisLine={false} tickLine={false} width={140}/>
              <Tooltip formatter={v => fmt.currency(v)} contentStyle={{background:'#111318',border:'1px solid #1e2128',borderRadius:'8px',color:'#f0f2f5'}}/>
              <Bar dataKey="totalSpend" fill="#4f7cff" radius={[0,4,4,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
