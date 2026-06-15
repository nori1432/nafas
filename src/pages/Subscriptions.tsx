import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useT } from '../store/lang'

const PLAN_BADGE: Record<string, string> = {
  premium: 'badge-red',
  standard: 'badge-blue',
  basic: 'badge-green',
  trial: 'badge-amber',
}

const STATUS_BADGE: Record<string, string> = {
  active: 'badge-green',
  trial: 'badge-amber',
  expired: 'badge-red',
  cancelled: 'badge-gray',
}

export default function Subscriptions() {
  const qc = useQueryClient()
  const t = useT()
  const [filter, setFilter] = useState({ status: '', plan: '' })
  const [editing, setEditing] = useState<any>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['subscriptions', filter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filter.status) params.set('status', filter.status)
      if (filter.plan) params.set('plan', filter.plan)
      return (await api.get(`/admin/subscriptions?${params}`)).data.data as any[]
    },
  })

  const updateMut = useMutation({
    mutationFn: (payload: any) => api.put(`/admin/subscriptions/${payload.id}`, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subscriptions'] }); setEditing(null) },
  })

  const rows = data || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="toolbar">
        <label className="field" style={{ flex: 1, minWidth: 140 }}>
          <span>{t('Status', 'الحالة')}</span>
          <select className="input" value={filter.status} onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}>
            <option value="">{t('All', 'الكل')}</option>
            <option value="active">{t('Active', 'نشط')}</option>
            <option value="trial">{t('Trial', 'تجريبي')}</option>
            <option value="expired">{t('Expired', 'منتهي')}</option>
            <option value="cancelled">{t('Cancelled', 'ملغى')}</option>
          </select>
        </label>
        <label className="field" style={{ flex: 1, minWidth: 140 }}>
          <span>{t('Plan', 'الخطة')}</span>
          <select className="input" value={filter.plan} onChange={(e) => setFilter((f) => ({ ...f, plan: e.target.value }))}>
            <option value="">{t('All', 'الكل')}</option>
            <option value="basic">{t('Basic', 'أساسي')}</option>
            <option value="standard">{t('Standard', 'قياسي')}</option>
            <option value="premium">{t('Premium', 'مميز')}</option>
          </select>
        </label>
      </div>

      <div className="table-wrap card">
        {isLoading ? (
          <div className="empty-state">
            <div className="empty-title">{t('Loading…', 'جارٍ التحميل...')}</div>
          </div>
        ) : (
          <table className="nfs">
            <thead>
              <tr>
                <th>{t('Hospital', 'المستشفى')}</th>
                <th>{t('Plan', 'الخطة')}</th>
                <th>{t('Status', 'الحالة')}</th>
                <th>{t('Price/mo (DZD)', 'السعر/شهر (دج)')}</th>
                <th>{t('Start', 'البداية')}</th>
                <th>{t('End', 'النهاية')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s: any) => (
                <tr key={s.id}>
                  <td>{s.hospital_name || `#${s.hospital_id}`}</td>
                  <td>
                    <span className={`badge ${PLAN_BADGE[s.plan] || 'badge-gray'}`}>{s.plan}</span>
                  </td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[s.status] || 'badge-gray'}`}>{s.status}</span>
                  </td>
                  <td>{Number(s.price_monthly).toLocaleString()}</td>
                  <td>{s.start_date?.slice(0, 10)}</td>
                  <td>{s.end_date?.slice(0, 10)}</td>
                  <td>
                    <button className="btn btn-sm btn-ghost" onClick={() => setEditing(s)}>
                      {t('Edit', 'تعديل')}
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-icon">📋</div>
                      <div className="empty-title">{t('No subscriptions found', 'لا توجد اشتراكات')}</div>
                      <div className="empty-sub">{t('Try adjusting your filters.', 'حاول تعديل الفلاتر.')}</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <div className="modal-backdrop">
          <div className="modal">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>{t('Edit Subscription', 'تعديل الاشتراك')} #{editing.id}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>×</button>
            </div>
            <label className="field">
              <span>{t('Plan', 'الخطة')}</span>
              <select className="input" value={editing.plan} onChange={(e) => setEditing((s: any) => ({ ...s, plan: e.target.value }))}>
                <option value="basic">{t('Basic', 'أساسي')}</option>
                <option value="standard">{t('Standard', 'قياسي')}</option>
                <option value="premium">{t('Premium', 'مميز')}</option>
              </select>
            </label>
            <label className="field">
              <span>{t('Status', 'الحالة')}</span>
              <select className="input" value={editing.status} onChange={(e) => setEditing((s: any) => ({ ...s, status: e.target.value }))}>
                <option value="active">{t('Active', 'نشط')}</option>
                <option value="trial">{t('Trial', 'تجريبي')}</option>
                <option value="expired">{t('Expired', 'منتهي')}</option>
                <option value="cancelled">{t('Cancelled', 'ملغى')}</option>
              </select>
            </label>
            <label className="field">
              <span>{t('Price/month (DZD)', 'السعر/شهر (دج)')}</span>
              <input className="input" type="number" value={editing.price_monthly}
                onChange={(e) => setEditing((s: any) => ({ ...s, price_monthly: e.target.value }))} />
            </label>
            <label className="field">
              <span>{t('End date', 'تاريخ الانتهاء')}</span>
              <input className="input" type="date" value={editing.end_date?.slice(0, 10)}
                onChange={(e) => setEditing((s: any) => ({ ...s, end_date: e.target.value }))} />
            </label>
            <label className="field">
              <span>{t('Notes', 'ملاحظات')}</span>
              <input className="input" value={editing.notes || ''}
                onChange={(e) => setEditing((s: any) => ({ ...s, notes: e.target.value }))} />
            </label>
            <div className="drawer-footer">
              <button className="btn btn-ghost" onClick={() => setEditing(null)}>{t('Cancel', 'إلغاء')}</button>
              <button className="btn btn-primary" onClick={() => updateMut.mutate(editing)} disabled={updateMut.isPending}>
                {updateMut.isPending ? t('Saving…', 'جارٍ الحفظ...') : t('Save', 'حفظ')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
