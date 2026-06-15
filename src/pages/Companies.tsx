import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Link } from 'react-router-dom'
import { useT } from '../store/lang'
import { IcoBuilding, IcoCheck, IcoCalendar, IcoStar, IcoPlus } from '../components/Icon'

export default function Companies() {
  const qc = useQueryClient()
  const t = useT()
  const [search, setSearch] = useState('')
  const [filterApproved, setFilterApproved] = useState('')
  const [filterActive, setFilterActive] = useState('')
  const [view, setView] = useState<'table' | 'grid'>('table')

  const { data, isLoading } = useQuery({
    queryKey: ['companies', filterApproved, search],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filterApproved !== '') params.set('approved', filterApproved)
      if (search) params.set('search', search)
      return (await api.get(`/admin/companies?${params}`)).data.data as any[]
    },
  })

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => api.put(`/admin/companies/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['companies'] }),
  })

  const all = data || []
  const rows = all.filter((c: any) =>
    (!filterActive || (filterActive === 'active' ? c.is_active : !c.is_active))
  )

  const pendingCount = all.filter((c: any) => !c.is_approved).length

  return (
    <>
      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { icon: <IcoBuilding size={16} />, label: t('Total', 'الإجمالي'), value: all.length, color: '' },
          { icon: <IcoCheck size={16} />, label: t('Approved', 'معتمد'), value: all.filter((c: any) => c.is_approved).length, color: 'green' },
          { icon: <IcoCalendar size={16} />, label: t('Pending', 'معلق'), value: pendingCount, color: pendingCount > 0 ? 'amber' : '' },
          { icon: <IcoStar size={16} />, label: t('Avg Rating', 'متوسط التقييم'), value: (all.filter((c: any) => c.rating).reduce((s: number, c: any) => s + Number(c.rating), 0) / (all.filter((c: any) => c.rating).length || 1)).toFixed(1), color: '' },
        ].map(k => (
          <div key={k.label} className={`kpi-card ${k.color}`} style={{ padding: '14px 16px' }}>
            <div className="kpi-icon" style={{ width: 36, height: 36 }}>{k.icon}</div>
            <div><div className="label">{k.label}</div><div className="value" style={{ fontSize: 22 }}>{k.value}</div></div>
          </div>
        ))}
      </div>

      <div className="toolbar">
        <input className="input input-search" placeholder={t('Search companies…', 'البحث عن شركات...')} value={search}
          onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 260 }} />
        <select className="input" value={filterApproved} onChange={(e) => setFilterApproved(e.target.value)} style={{ maxWidth: 150 }}>
          <option value="">{t('All Approval', 'الكل')}</option>
          <option value="true">{t('Approved', 'معتمد')}</option>
          <option value="false">{t('Pending', 'قيد الانتظار')}</option>
        </select>
        <select className="input" value={filterActive} onChange={(e) => setFilterActive(e.target.value)} style={{ maxWidth: 130 }}>
          <option value="">{t('All Status', 'كل الحالات')}</option>
          <option value="active">{t('Active', 'نشط')}</option>
          <option value="suspended">{t('Suspended', 'موقوف')}</option>
        </select>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 3 }}>
          {(['table', 'grid'] as const).map(v => (
            <button key={v} className={`btn btn-sm ${view === v ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView(v)} style={{ padding: '4px 12px' }}>
              {v === 'table' ? '☰' : '⊞'}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{rows.length} {t('companies', 'شركة')}</span>
      </div>

      {isLoading ? (
        <div className="empty-state"><div className="empty-icon">⏳</div><div className="empty-title">{t('Loading…', 'جارٍ التحميل...')}</div></div>
      ) : view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {rows.map((c: any) => (
            <div key={c.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ height: 72, background: `linear-gradient(135deg, hsl(${(c.id * 47) % 360},60%,35%), hsl(${(c.id * 47 + 30) % 360},60%,20%))`, position: 'relative' }}>
                <div style={{ position: 'absolute', bottom: -20, left: 16, width: 48, height: 48, borderRadius: 12, background: 'var(--surface)', border: '2px solid var(--surface)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', display: 'grid', placeItems: 'center', fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>
                  {c.company_name?.charAt(0) || '?'}
                </div>
              </div>
              <div style={{ padding: '28px 16px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{c.company_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{c.contact_phone}</div>
                  </div>
                  <span className={`badge ${c.is_approved ? 'badge-blue' : 'badge-amber'}`} style={{ fontSize: 11 }}>
                    {c.is_approved ? t('Approved', 'معتمد') : t('Pending', 'قيد الانتظار')}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--text-3)', margin: '10px 0' }}>
                  <span>{c.rating ? `⭐ ${Number(c.rating).toFixed(1)}` : '⭐ —'}</span>
                  <span>🔧 {c.completed_jobs || 0} jobs</span>
                  <span>👥 {c.employee_count || 0}</span>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                  <Link to={`/profile?id=${c.id}`} className="btn btn-sm btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>{t('View Profile', 'عرض الملف')}</Link>
                  {!c.is_approved ? (
                    <button className="btn btn-sm btn-success" style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => updateMut.mutate({ id: c.id, payload: { is_approved: true } })}>
                      ✓ {t('Approve', 'موافقة')}
                    </button>
                  ) : (
                    <button className={`btn btn-sm ${c.is_active ? 'btn-danger' : 'btn-ghost'}`} style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => updateMut.mutate({ id: c.id, payload: { is_active: !c.is_active } })}>
                      {c.is_active ? t('Suspend', 'تعليق') : t('Activate', 'تفعيل')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {!rows.length && <div className="empty-state" style={{ gridColumn: '1/-1' }}><div className="empty-icon">🏢</div><div className="empty-title">{t('No companies found', 'لا توجد شركات')}</div></div>}
        </div>
      ) : (
        <div className="table-wrap">
          <table className="nfs">
            <thead>
              <tr><th>{t('Company', 'الشركة')}</th><th>{t('Contact', 'التواصل')}</th><th>{t('Rating', 'التقييم')}</th><th>{t('Jobs', 'المشاريع')}</th><th>{t('Employees', 'الموظفون')}</th><th>{t('Approval', 'الموافقة')}</th><th>{t('Status', 'الحالة')}</th><th>{t('Actions', 'إجراءات')}</th></tr>
            </thead>
            <tbody>
              {rows.map((c: any) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: `linear-gradient(135deg, hsl(${(c.id * 47) % 360},60%,35%), hsl(${(c.id * 47 + 30) % 360},60%,20%))`, display: 'grid', placeItems: 'center', fontSize: 16, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                        {c.company_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{c.company_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{c.contact_email || 'No email'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 13 }}>{c.contact_phone}</td>
                  <td style={{ fontWeight: 600 }}>{c.rating ? `⭐ ${Number(c.rating).toFixed(1)}` : '—'}</td>
                  <td>{c.completed_jobs || 0}</td>
                  <td>{c.employee_count || 0}</td>
                  <td><span className={`badge ${c.is_approved ? 'badge-blue' : 'badge-amber'}`}>{c.is_approved ? `✓ ${t('Approved', 'معتمد')}` : `⏳ ${t('Pending', 'قيد الانتظار')}`}</span></td>
                  <td><span className={`badge ${c.is_active ? 'badge-green' : 'badge-gray'}`}>{c.is_active ? `● ${t('Active', 'نشط')}` : `○ ${t('Suspended', 'موقوف')}`}</span></td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <Link to={`/profile?id=${c.id}`} className="btn btn-sm btn-ghost">{t('Profile', 'الملف')}</Link>
                    {' '}
                    {!c.is_approved && (
                      <button className="btn btn-sm btn-success"
                        onClick={() => updateMut.mutate({ id: c.id, payload: { is_approved: true } })}>
                        ✓ {t('Approve', 'موافقة')}
                      </button>
                    )}
                    {' '}
                    <button className={`btn btn-sm ${c.is_active ? 'btn-danger' : 'btn-ghost'}`}
                      onClick={() => updateMut.mutate({ id: c.id, payload: { is_active: !c.is_active } })}>
                      {c.is_active ? t('Suspend', 'تعليق') : t('Activate', 'تفعيل')}
                    </button>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={8}>
                  <div className="empty-state"><div className="empty-icon">🏢</div><div className="empty-title">{t('No companies found', 'لا توجد شركات')}</div></div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
