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

export default function BrowseNeeds() {
  const t = useT()
  const qc = useQueryClient()
  const [offering, setOffering] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [msg, setMsg] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['company-needs'],
    queryFn: async () => (await api.get('/companies/needs')).data.data as any[],
  })

  const offerMut = useMutation({
    mutationFn: ({ nid, payload }: any) => api.post(`/companies/needs/${nid}/offers`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company-needs'] })
      setOffering(null)
      setForm({})
      setMsg(t('Offer submitted!', 'تم تقديم العرض!'))
    },
  })

  const rows = data || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {msg && <div className="success">{msg}</div>}

      <div className="table-wrap card">
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            {t('Loading…', 'جارٍ التحميل...')}
          </div>
        ) : (
          <table className="nfs">
            <thead>
              <tr>
                <th>{t('Hospital', 'المستشفى')}</th>
                <th>{t('Title', 'العنوان')}</th>
                <th>{t('Urgency', 'الأولوية')}</th>
                <th>{t('Budget (DZD)', 'الميزانية (دج)')}</th>
                <th>{t('Deadline', 'الموعد النهائي')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((n: any) => (
                <tr key={n.id}>
                  <td style={{ color: 'var(--text-2)', fontSize: 13 }}>#{n.hospital_id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                      {n.description?.slice(0, 60)}{n.description?.length > 60 ? '…' : ''}
                    </div>
                  </td>
                  <td>
                    <span className={URGENCY_BADGE[n.urgency] || 'badge badge-gray'}>
                      {n.urgency}
                    </span>
                  </td>
                  <td>{n.budget_min?.toLocaleString()} – {n.budget_max?.toLocaleString()}</td>
                  <td>{n.deadline?.slice(0, 10)}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => { setOffering(n); setForm({}) }}
                    >
                      {t('Submit Offer', 'تقديم عرض')}
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      {t('No open needs available', 'لا توجد طلبات مفتوحة')}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Submit offer — drawer */}
      {offering && (
        <>
          <div className="drawer-backdrop" onClick={() => setOffering(null)} />
          <div className="drawer">
            <div className="drawer-header">
              <h3>{t('Submit Offer', 'تقديم عرض')}</h3>
              <button className="drawer-close" onClick={() => setOffering(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
              <div
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '12px',
                  fontSize: 13,
                }}
              >
                <strong>{offering.title}</strong>
                <div style={{ color: 'var(--text-2)', marginTop: 4 }}>{offering.description}</div>
              </div>

              <label className="field">
                <span>{t('Description of your offer', 'وصف العرض')}</span>
                <textarea
                  className="input"
                  rows={3}
                  value={form.description || ''}
                  onChange={(e) => setForm((s: any) => ({ ...s, description: e.target.value }))}
                />
              </label>
              <label className="field">
                <span>{t('Price (DZD)', 'السعر (دج)')}</span>
                <input
                  className="input"
                  type="number"
                  value={form.price || ''}
                  onChange={(e) => setForm((s: any) => ({ ...s, price: e.target.value }))}
                />
              </label>
              <label className="field">
                <span>{t('Duration (days)', 'المدة (أيام)')}</span>
                <input
                  className="input"
                  type="number"
                  value={form.duration_days || ''}
                  onChange={(e) => setForm((s: any) => ({ ...s, duration_days: e.target.value }))}
                />
              </label>
              <label className="field">
                <span>{t('Warranty (months)', 'الضمان (أشهر)')}</span>
                <input
                  className="input"
                  type="number"
                  value={form.warranty_months || ''}
                  onChange={(e) => setForm((s: any) => ({ ...s, warranty_months: e.target.value }))}
                />
              </label>
              <label className="field">
                <span>{t('Notes', 'ملاحظات')}</span>
                <input
                  className="input"
                  value={form.notes || ''}
                  onChange={(e) => setForm((s: any) => ({ ...s, notes: e.target.value }))}
                />
              </label>
            </div>

            <div className="drawer-footer">
              <button className="btn btn-ghost" onClick={() => setOffering(null)}>
                {t('Cancel', 'إلغاء')}
              </button>
              <button
                className="btn btn-primary"
                disabled={offerMut.isPending}
                onClick={() => offerMut.mutate({ nid: offering.id, payload: form })}
              >
                {offerMut.isPending ? t('Submitting…', 'جارٍ الإرسال...') : t('Submit', 'إرسال')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
