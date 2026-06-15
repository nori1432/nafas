import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useT } from '../store/lang'

export default function Staff() {
  const qc = useQueryClient()
  const t = useT()
  const [editing, setEditing] = useState<any>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['hosp-staff'],
    queryFn: async () => (await api.get('/hospital-portal/staff')).data.data as any[],
  })

  const updateMut = useMutation({
    mutationFn: (u: any) => api.put(`/hospital-portal/staff/${u.id}`, u),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['hosp-staff'] }); setEditing(null) },
  })

  const rows = data || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="table-wrap card">
        {isLoading ? (
          <div className="empty-state">
            <div className="empty-title">{t('Loading…', 'جارٍ التحميل...')}</div>
          </div>
        ) : (
          <table className="nfs">
            <thead>
              <tr>
                <th>{t('Name', 'الاسم')}</th>
                <th>{t('Phone', 'الهاتف')}</th>
                <th>{t('Role', 'الدور')}</th>
                <th>{t('Status', 'الحالة')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u: any) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.full_name}</td>
                  <td>{u.phone_number}</td>
                  <td>
                    <span className={`badge ${u.role === 'doctor' ? 'badge-blue' : 'badge-gray'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-green' : 'badge-red'}`}>
                      {u.is_active ? t('Active', 'نشط') : t('Inactive', 'غير نشط')}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-ghost" onClick={() => setEditing(u)}>
                      {t('Edit', 'تعديل')}
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <div className="empty-icon">👥</div>
                      <div className="empty-title">{t('No staff found', 'لا يوجد كوادر')}</div>
                      <div className="empty-sub">{t('No staff members have been added yet.', 'لم يتم إضافة أي كوادر بعد.')}</div>
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
              <h3 style={{ margin: 0 }}>{editing.full_name}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>×</button>
            </div>
            <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={!!editing.is_active}
                onChange={(e) => setEditing((s: any) => ({ ...s, is_active: e.target.checked }))} />
              <span>{t('Active', 'نشط')}</span>
            </label>
            <div className="drawer-footer">
              <button className="btn btn-ghost" onClick={() => setEditing(null)}>{t('Cancel', 'إلغاء')}</button>
              <button className="btn btn-primary" onClick={() => updateMut.mutate(editing)} disabled={updateMut.isPending}>
                {t('Save', 'حفظ')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
