import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useT } from '../store/lang'

const URGENCY_BADGE: Record<string, string> = {
  critical: 'badge badge-red',
  high: 'badge badge-amber',
  medium: 'badge badge-orange',
  low: 'badge badge-green',
}

const STATUS_BADGE: Record<string, string> = {
  open: 'badge badge-blue',
  reviewing: 'badge badge-gray',
  assigned: 'badge badge-amber',
  in_progress: 'badge badge-orange',
  resolved: 'badge badge-green',
  closed: 'badge badge-gray',
}

const OFFER_STATUS_BADGE: Record<string, string> = {
  accepted: 'badge badge-green',
  rejected: 'badge badge-red',
  pending: 'badge badge-blue',
}

export default function HospNeeds() {
  const t = useT()
  const qc = useQueryClient()
  const [creating, setCreating] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [form, setForm] = useState<any>({})

  const { data, isLoading } = useQuery({
    queryKey: ['hosp-needs'],
    queryFn: async () => (await api.get('/hospital-portal/needs')).data.data as any[],
  })

  const createMut = useMutation({
    mutationFn: (payload: any) => api.post('/hospital-portal/needs', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hosp-needs'] })
      setCreating(false)
      setForm({})
    },
  })

  const offerMut = useMutation({
    mutationFn: ({ nid, oid, action }: any) =>
      api.put(`/hospital-portal/needs/${nid}/offers/${oid}`, { action }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hosp-needs'] })
      setSelected(null)
    },
  })

  const rows = data || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>{t('Maintenance Needs', 'طلبات الصيانة')}</h2>
        <button className="btn btn-primary" onClick={() => setCreating(true)}>
          {t('+ New Maintenance Need', '+ طلب صيانة جديد')}
        </button>
      </div>

      <div className="table-wrap card">
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            {t('Loading…', 'جارٍ التحميل...')}
          </div>
        ) : (
          <table className="nfs">
            <thead>
              <tr>
                <th>{t('Title', 'العنوان')}</th>
                <th>{t('Urgency', 'الأولوية')}</th>
                <th>{t('Status', 'الحالة')}</th>
                <th>{t('Budget (DZD)', 'الميزانية (دج)')}</th>
                <th>{t('Deadline', 'الموعد النهائي')}</th>
                <th>{t('Offers', 'العروض')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((n: any) => (
                <tr key={n.id}>
                  <td style={{ fontWeight: 600 }}>{n.title}</td>
                  <td>
                    <span className={URGENCY_BADGE[n.urgency] || 'badge badge-gray'}>
                      {n.urgency}
                    </span>
                  </td>
                  <td>
                    <span className={STATUS_BADGE[n.status] || 'badge badge-gray'}>
                      {n.status}
                    </span>
                  </td>
                  <td>
                    {n.budget_min?.toLocaleString()} – {n.budget_max?.toLocaleString()}
                  </td>
                  <td>{n.deadline?.slice(0, 10)}</td>
                  <td>{n.offer_count || 0}</td>
                  <td>
                    <button className="btn btn-sm btn-ghost" onClick={() => setSelected(n)}>
                      {t('View Offers', 'عرض العروض')}
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      {t('No maintenance needs posted yet', 'لا توجد طلبات صيانة بعد')}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Create need — drawer */}
      {creating && (
        <>
          <div className="drawer-backdrop" onClick={() => setCreating(false)} />
          <div className="drawer">
            <div className="drawer-header">
              <h3>{t('New Maintenance Need', 'طلب صيانة جديد')}</h3>
              <button className="drawer-close" onClick={() => setCreating(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
              <label className="field">
                <span>{t('Title', 'العنوان')}</span>
                <input
                  className="input"
                  value={form.title || ''}
                  onChange={(e) => setForm((s: any) => ({ ...s, title: e.target.value }))}
                />
              </label>
              <label className="field">
                <span>{t('Description', 'الوصف')}</span>
                <textarea
                  className="input"
                  rows={3}
                  value={form.description || ''}
                  onChange={(e) => setForm((s: any) => ({ ...s, description: e.target.value }))}
                />
              </label>
              <label className="field">
                <span>{t('Urgency', 'الأولوية')}</span>
                <select
                  className="input"
                  value={form.urgency || 'medium'}
                  onChange={(e) => setForm((s: any) => ({ ...s, urgency: e.target.value }))}
                >
                  {['low', 'medium', 'high', 'critical'].map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>{t('Budget min (DZD)', 'الحد الأدنى للميزانية (دج)')}</span>
                <input
                  className="input"
                  type="number"
                  value={form.budget_min || ''}
                  onChange={(e) => setForm((s: any) => ({ ...s, budget_min: e.target.value }))}
                />
              </label>
              <label className="field">
                <span>{t('Budget max (DZD)', 'الحد الأقصى للميزانية (دج)')}</span>
                <input
                  className="input"
                  type="number"
                  value={form.budget_max || ''}
                  onChange={(e) => setForm((s: any) => ({ ...s, budget_max: e.target.value }))}
                />
              </label>
              <label className="field">
                <span>{t('Deadline', 'الموعد النهائي')}</span>
                <input
                  className="input"
                  type="date"
                  value={form.deadline || ''}
                  onChange={(e) => setForm((s: any) => ({ ...s, deadline: e.target.value }))}
                />
              </label>
            </div>

            <div className="drawer-footer">
              <button className="btn btn-ghost" onClick={() => setCreating(false)}>
                {t('Cancel', 'إلغاء')}
              </button>
              <button
                className="btn btn-primary"
                onClick={() => createMut.mutate(form)}
                disabled={createMut.isPending}
              >
                {createMut.isPending ? t('Posting…', 'جارٍ النشر...') : t('Post Need', 'نشر الطلب')}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Offers detail — drawer */}
      {selected && (
        <>
          <div className="drawer-backdrop" onClick={() => setSelected(null)} />
          <div className="drawer">
            <div className="drawer-header">
              <h3>{selected.title}</h3>
              <button className="drawer-close" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
              <p style={{ color: 'var(--text-2)', fontSize: 14, margin: 0 }}>{selected.description}</p>

              <h4 style={{ margin: 0 }}>
                {t('Offers', 'العروض')} ({(selected.offers || []).length})
              </h4>

              {(selected.offers || []).length === 0 && (
                <div className="empty-state">{t('No offers yet.', 'لا توجد عروض بعد.')}</div>
              )}

              {(selected.offers || []).map((o: any) => (
                <div
                  key={o.id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ fontWeight: 600 }}>Company #{o.company_id}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{o.description}</div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: 13, flexWrap: 'wrap' }}>
                    <span>
                      {t('Price:', 'السعر:')}{' '}
                      <strong>{Number(o.price).toLocaleString()} DZD</strong>
                    </span>
                    <span>
                      {t('Duration:', 'المدة:')}{' '}
                      <strong>{o.duration_days}d</strong>
                    </span>
                    <span>
                      {t('Warranty:', 'الضمان:')}{' '}
                      <strong>{o.warranty_months}mo</strong>
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className={OFFER_STATUS_BADGE[o.status] || 'badge badge-gray'}>
                      {o.status}
                    </span>
                    {o.status === 'pending' && (
                      <>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() =>
                            offerMut.mutate({ nid: selected.id, oid: o.id, action: 'accept' })
                          }
                        >
                          {t('Accept', 'قبول')}
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() =>
                            offerMut.mutate({ nid: selected.id, oid: o.id, action: 'reject' })
                          }
                        >
                          {t('Reject', 'رفض')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="drawer-footer">
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>
                {t('Close', 'إغلاق')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
