import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useT } from '../store/lang'

const STATUS_BADGE: Record<string, string> = {
  pending: 'badge badge-blue',
  accepted: 'badge badge-green',
  rejected: 'badge badge-red',
  withdrawn: 'badge badge-gray',
  completed: 'badge badge-orange',
}

export default function MyOffers() {
  const t = useT()
  const qc = useQueryClient()
  const [editing, setEditing] = useState<any>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['company-offers'],
    queryFn: async () => (await api.get('/companies/offers')).data.data as any[],
  })

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: any) => api.put(`/companies/offers/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company-offers'] })
      setEditing(null)
    },
  })

  const rows = data || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="table-wrap card">
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            {t('Loading…', 'جارٍ التحميل...')}
          </div>
        ) : (
          <table className="nfs">
            <thead>
              <tr>
                <th>{t('Need', 'الطلب')}</th>
                <th>{t('Price (DZD)', 'السعر (دج)')}</th>
                <th>{t('Duration', 'المدة')}</th>
                <th>{t('Warranty', 'الضمان')}</th>
                <th>{t('Status', 'الحالة')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o: any) => (
                <tr key={o.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>Need #{o.need_id}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                      {o.description?.slice(0, 50)}{o.description?.length > 50 ? '…' : ''}
                    </div>
                  </td>
                  <td>{Number(o.price).toLocaleString()}</td>
                  <td>{o.duration_days}d</td>
                  <td>{o.warranty_months}mo</td>
                  <td>
                    <span className={STATUS_BADGE[o.status] || 'badge badge-gray'}>
                      {o.status}
                    </span>
                  </td>
                  <td>
                    {o.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-sm btn-ghost" onClick={() => setEditing(o)}>
                          {t('Edit', 'تعديل')}
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => updateMut.mutate({ id: o.id, payload: { status: 'withdrawn' } })}
                        >
                          {t('Withdraw', 'سحب')}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      {t('No offers submitted yet', 'لا توجد عروض مقدَّمة بعد')}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit offer — drawer */}
      {editing && (
        <>
          <div className="drawer-backdrop" onClick={() => setEditing(null)} />
          <div className="drawer">
            <div className="drawer-header">
              <h3>{t('Edit Offer', 'تعديل العرض')} #{editing.id}</h3>
              <button className="drawer-close" onClick={() => setEditing(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
              <label className="field">
                <span>{t('Price (DZD)', 'السعر (دج)')}</span>
                <input
                  className="input"
                  type="number"
                  value={editing.price}
                  onChange={(e) => setEditing((s: any) => ({ ...s, price: e.target.value }))}
                />
              </label>
              <label className="field">
                <span>{t('Duration (days)', 'المدة (أيام)')}</span>
                <input
                  className="input"
                  type="number"
                  value={editing.duration_days}
                  onChange={(e) => setEditing((s: any) => ({ ...s, duration_days: e.target.value }))}
                />
              </label>
              <label className="field">
                <span>{t('Warranty (months)', 'الضمان (أشهر)')}</span>
                <input
                  className="input"
                  type="number"
                  value={editing.warranty_months}
                  onChange={(e) => setEditing((s: any) => ({ ...s, warranty_months: e.target.value }))}
                />
              </label>
              <label className="field">
                <span>{t('Notes', 'ملاحظات')}</span>
                <input
                  className="input"
                  value={editing.notes || ''}
                  onChange={(e) => setEditing((s: any) => ({ ...s, notes: e.target.value }))}
                />
              </label>
            </div>

            <div className="drawer-footer">
              <button className="btn btn-ghost" onClick={() => setEditing(null)}>
                {t('Cancel', 'إلغاء')}
              </button>
              <button
                className="btn btn-primary"
                disabled={updateMut.isPending}
                onClick={() => updateMut.mutate({ id: editing.id, payload: editing })}
              >
                {updateMut.isPending ? t('Saving…', 'جارٍ الحفظ...') : t('Save', 'حفظ')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
