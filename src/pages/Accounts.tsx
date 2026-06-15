import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useT } from '../store/lang'

export default function Accounts() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<'list' | 'hospital' | 'company'>('list')
  const [roleFilter, setRoleFilter] = useState('')
  const [form, setForm] = useState<any>({})
  const [hospitals, setHospitals] = useState<any[]>([])
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const tr = useT()

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['admin-accounts', roleFilter],
    queryFn: async () => {
      const params = roleFilter ? `?role=${roleFilter}` : ''
      return (await api.get(`/admin/accounts${params}`)).data.data as any[]
    },
  })

  const { data: hospData } = useQuery({
    queryKey: ['hospitals-simple'],
    queryFn: async () => (await api.get('/admin/hospitals?per_page=100')).data.data as any[],
  })

  const createHospAdminMut = useMutation({
    mutationFn: (payload: any) => api.post('/admin/accounts/hospital-admin', payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-accounts'] }); setMsg(tr('Hospital admin account created!', 'تم إنشاء حساب مسؤول المستشفى!')); setForm({}); setTab('list') },
    onError: (e: any) => setErr(e.response?.data?.message || tr('Error', 'خطأ')),
  })

  const createCompanyMut = useMutation({
    mutationFn: (payload: any) => api.post('/admin/accounts/company', payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-accounts'] }); setMsg(tr('Company account created!', 'تم إنشاء حساب الشركة!')); setForm({}); setTab('list') },
    onError: (e: any) => setErr(e.response?.data?.message || tr('Error', 'خطأ')),
  })

  const rows = accounts || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {msg && <div className="success">{msg}</div>}

      <div className="toolbar">
        <div className="tabs">
          {(['list', 'hospital', 'company'] as const).map((tab_item) => (
            <button
              key={tab_item}
              className={`tab-btn${tab === tab_item ? ' active' : ''}`}
              onClick={() => { setTab(tab_item); setMsg(''); setErr('') }}
            >
              {tab_item === 'list'
                ? tr('All Accounts', 'جميع الحسابات')
                : tab_item === 'hospital'
                ? tr('+ Hospital Admin', '+ مسؤول مستشفى')
                : tr('+ Company Account', '+ حساب شركة')}
            </button>
          ))}
        </div>
        {tab === 'list' && (
          <select
            className="input"
            style={{ marginLeft: 'auto', width: 180 }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">{tr('All roles', 'جميع الأدوار')}</option>
            <option value="hospital_admin">{tr('Hospital Admins', 'مسؤولو المستشفيات')}</option>
            <option value="maintenance_company">{tr('Companies', 'الشركات')}</option>
          </select>
        )}
      </div>

      {tab === 'list' && (
        <div className="table-wrap card">
          {isLoading ? (
            <div className="empty-state">
              <div className="empty-title">{tr('Loading…', 'جارٍ التحميل...')}</div>
            </div>
          ) : (
            <table className="nfs">
              <thead>
                <tr>
                  <th>{tr('Name', 'الاسم')}</th>
                  <th>{tr('Phone', 'الهاتف')}</th>
                  <th>{tr('Role', 'الدور')}</th>
                  <th>{tr('Hospital / Company', 'المستشفى / الشركة')}</th>
                  <th>{tr('Active', 'نشط')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a: any) => (
                  <tr key={a.id}>
                    <td>{a.full_name}</td>
                    <td>{a.phone_number}</td>
                    <td>
                      <span className={`badge ${a.role === 'hospital_admin' ? 'badge-blue' : 'badge-green'}`}>
                        {a.role}
                      </span>
                    </td>
                    <td>{a.hospital_id || a.company?.company_name || '—'}</td>
                    <td>
                      <span className={`badge ${a.is_active ? 'badge-green' : 'badge-gray'}`}>
                        {a.is_active ? tr('Active', 'نشط') : tr('Inactive', 'غير نشط')}
                      </span>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state">
                        <div className="empty-icon">👤</div>
                        <div className="empty-title">{tr('No accounts', 'لا توجد حسابات')}</div>
                        <div className="empty-sub">{tr('No accounts match the current filter.', 'لا توجد حسابات تطابق الفلتر الحالي.')}</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'hospital' && (
        <div className="card" style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card-header">
            <div className="card-title">{tr('Create Hospital Admin Account', 'إنشاء حساب مسؤول مستشفى')}</div>
          </div>
          {err && <div className="err">{err}</div>}
          {(['full_name', 'phone_number', 'password'] as const).map((f) => (
            <label key={f} className="field">
              <span>{f.replace('_', ' ')}</span>
              <input className="input" type={f === 'password' ? 'password' : 'text'}
                value={form[f] || ''} onChange={(e) => setForm((s: any) => ({ ...s, [f]: e.target.value }))} />
            </label>
          ))}
          <label className="field">
            <span>{tr('Hospital', 'المستشفى')}</span>
            <select className="input" value={form.hospital_id || ''} onChange={(e) => setForm((s: any) => ({ ...s, hospital_id: e.target.value }))}>
              <option value="">{tr('Select hospital…', 'اختر مستشفى...')}</option>
              {(hospData || []).map((h: any) => <option key={h.id} value={h.id}>{h.name_en}</option>)}
            </select>
          </label>
          <button className="btn btn-primary" disabled={createHospAdminMut.isPending}
            onClick={() => createHospAdminMut.mutate(form)}>
            {createHospAdminMut.isPending ? tr('Creating…', 'جارٍ الإنشاء...') : tr('Create Account', 'إنشاء الحساب')}
          </button>
        </div>
      )}

      {tab === 'company' && (
        <div className="card" style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card-header">
            <div className="card-title">{tr('Create Maintenance Company Account', 'إنشاء حساب شركة صيانة')}</div>
          </div>
          {err && <div className="err">{err}</div>}
          {(['full_name', 'phone_number', 'password', 'company_name', 'contact_email', 'contact_phone'] as const).map((f) => (
            <label key={f} className="field">
              <span>{f.replace(/_/g, ' ')}</span>
              <input className="input" type={f === 'password' ? 'password' : f === 'contact_email' ? 'email' : 'text'}
                value={form[f] || ''} onChange={(e) => setForm((s: any) => ({ ...s, [f]: e.target.value }))} />
            </label>
          ))}
          <label className="field">
            <span>{tr('Description', 'الوصف')}</span>
            <textarea className="input" rows={3} value={form.description || ''}
              onChange={(e) => setForm((s: any) => ({ ...s, description: e.target.value }))} />
          </label>
          <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" checked={!!form.is_approved}
              onChange={(e) => setForm((s: any) => ({ ...s, is_approved: e.target.checked }))} />
            <span>{tr('Approve immediately', 'موافقة فورية')}</span>
          </label>
          <button className="btn btn-primary" disabled={createCompanyMut.isPending}
            onClick={() => createCompanyMut.mutate(form)}>
            {createCompanyMut.isPending ? tr('Creating…', 'جارٍ الإنشاء...') : tr('Create Account', 'إنشاء الحساب')}
          </button>
        </div>
      )}
    </div>
  )
}
