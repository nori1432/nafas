import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useT } from '../store/lang'

type Tab = 'equipment' | 'reports' | 'centers'

export default function Maintenance() {
  const t = useT()
  const [tab, setTab] = useState<Tab>('reports')
  return (
    <>
      <div className="toolbar">
        <button className={`btn ${tab === 'reports' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('reports')}>{t('Reports', 'التقارير')}</button>
        <button className={`btn ${tab === 'equipment' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('equipment')}>{t('Equipment', 'المعدات')}</button>
        <button className={`btn ${tab === 'centers' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('centers')}>{t('Repair Centers', 'مراكز الإصلاح')}</button>
      </div>
      {tab === 'reports' && <ReportsTab />}
      {tab === 'equipment' && <EquipmentTab />}
      {tab === 'centers' && <CentersTab />}
    </>
  )
}

function ReportsTab() {
  const t = useT()
  const qc = useQueryClient()
  const [status, setStatus] = useState('')
  const { data } = useQuery({
    queryKey: ['maint', status],
    queryFn: async () => (await api.get('/admin/maintenance', { params: { status: status || undefined, per_page: 100 } })).data.data as any[],
  })
  const upd = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: any }) => (await api.put(`/maintenance/${id}`, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['maint'] }),
  })

  return (
    <>
      <div className="toolbar">
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="">{t('All', 'الكل')}</option>
          <option>open</option><option>assigned</option><option>in_progress</option>
          <option>resolved</option><option>closed</option>
        </select>
      </div>
      <div className="table-wrap card">
        <table className="nfs">
          <thead><tr>
            <th>#</th><th>{t('Equipment', 'المعدات')}</th><th>{t('Severity', 'الخطورة')}</th><th>{t('Status', 'الحالة')}</th><th>{t('Reporter', 'المبلّغ')}</th><th>{t('Repair Center', 'مركز الإصلاح')}</th><th>{t('Opened', 'تاريخ الفتح')}</th><th>{t('Update', 'تحديث')}</th>
          </tr></thead>
          <tbody>
            {(data || []).map((r: any) => (
              <tr key={r.id}>
                <td>#{r.id}</td>
                <td>{r.equipment_name}</td>
                <td><span className={`badge ${r.severity === 'critical' ? 'badge-red' : r.severity === 'high' ? 'badge-amber' : 'badge-gray'}`}>{r.severity}</span></td>
                <td><span className="badge badge-ink">{r.status}</span></td>
                <td>{r.reporter_name}</td>
                <td>{r.repair_center_name || '—'}</td>
                <td className="muted">{(r.opened_at || '').slice(0, 10)}</td>
                <td>
                  <select className="input" style={{ maxWidth: 140 }} value={r.status} onChange={(e) => upd.mutate({ id: r.id, body: { status: e.target.value } })}>
                    {['open', 'assigned', 'in_progress', 'resolved', 'closed'].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {!data?.length && (
              <tr><td colSpan={8}>
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <div className="empty-title">{t('No reports', 'لا توجد تقارير')}</div>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

function EquipmentTab() {
  const t = useT()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const { data } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => (await api.get('/equipment', { params: { per_page: 100 } })).data.data as any[],
  })
  const create = useMutation({
    mutationFn: async (body: any) => (await api.post('/equipment', body)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['equipment'] }); setOpen(false) },
  })

  const statusBadge = (s: string) => {
    if (s === 'operational') return 'badge-green'
    if (s === 'faulty') return 'badge-red'
    if (s === 'under_repair') return 'badge-amber'
    return 'badge-gray'
  }

  return (
    <>
      <div className="toolbar">
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={() => setOpen(true)}>{t('+ Add Equipment', '+ إضافة معدة')}</button>
      </div>
      <div className="table-wrap card">
        <table className="nfs">
          <thead><tr>
            <th>{t('Name', 'الاسم')}</th><th>{t('Hospital', 'المستشفى')}</th><th>{t('Category', 'الفئة')}</th><th>{t('Serial', 'الرقم التسلسلي')}</th><th>{t('Status', 'الحالة')}</th><th>{t('Last maint.', 'آخر صيانة')}</th>
          </tr></thead>
          <tbody>
            {(data || []).map((e: any) => (
              <tr key={e.id}>
                <td>{e.name_ar}</td>
                <td>{e.hospital_name}</td>
                <td>{e.category || '—'}</td>
                <td className="muted">{e.serial_number || '—'}</td>
                <td><span className={`badge ${statusBadge(e.status)}`}>{e.status}</span></td>
                <td className="muted">{(e.last_maintenance || '').slice(0, 10) || '—'}</td>
              </tr>
            ))}
            {!data?.length && (
              <tr><td colSpan={6}>
                <div className="empty-state">
                  <div className="empty-icon">🔧</div>
                  <div className="empty-title">{t('No equipment', 'لا توجد معدات')}</div>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
      {open && (
        <div className="drawer-backdrop" onClick={() => setOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>{t('Add equipment', 'إضافة معدة')}</h3>
              <button className="drawer-close" onClick={() => setOpen(false)}>✕</button>
            </div>
            <EquipmentForm onSubmit={(b) => create.mutate(b)} onCancel={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}

function EquipmentForm({ onSubmit, onCancel }: { onSubmit: (b: any) => void; onCancel: () => void }) {
  const t = useT()
  const [f, setF] = useState({ hospital_id: 1, name_ar: '', name_en: '', category: '', serial_number: '', status: 'operational' })
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(f) }}>
      <div className="drawer-form">
        <label className="field"><span>{t('Hospital ID', 'معرّف المستشفى')}</span><input className="input" type="number" value={f.hospital_id} onChange={(e) => setF({ ...f, hospital_id: +e.target.value })} /></label>
        <label className="field"><span>{t('Name (AR)', 'الاسم (عربي)')}</span><input className="input" value={f.name_ar} onChange={(e) => setF({ ...f, name_ar: e.target.value })} required /></label>
        <label className="field"><span>{t('Name (EN)', 'الاسم (إنجليزي)')}</span><input className="input" value={f.name_en} onChange={(e) => setF({ ...f, name_en: e.target.value })} required /></label>
        <label className="field"><span>{t('Category', 'الفئة')}</span><input className="input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} /></label>
        <label className="field"><span>{t('Serial number', 'الرقم التسلسلي')}</span><input className="input" value={f.serial_number} onChange={(e) => setF({ ...f, serial_number: e.target.value })} /></label>
        <label className="field"><span>{t('Status', 'الحالة')}</span>
          <select className="input" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
            {['operational', 'faulty', 'under_repair', 'decommissioned'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
      </div>
      <div className="drawer-footer">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>{t('Cancel', 'إلغاء')}</button>
        <button type="submit" className="btn btn-primary">{t('Save', 'حفظ')}</button>
      </div>
    </form>
  )
}

function CentersTab() {
  const t = useT()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const { data } = useQuery({
    queryKey: ['repair-centers'],
    queryFn: async () => (await api.get('/repair-centers', { params: { per_page: 100 } })).data.data as any[],
  })
  const create = useMutation({
    mutationFn: async (b: any) => (await api.post('/repair-centers', b)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['repair-centers'] }); setOpen(false) },
  })

  return (
    <>
      <div className="toolbar">
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={() => setOpen(true)}>{t('+ Add Center', '+ إضافة مركز')}</button>
      </div>
      <div className="table-wrap card">
        <table className="nfs">
          <thead><tr><th>{t('Name', 'الاسم')}</th><th>{t('Type', 'النوع')}</th><th>{t('Scope', 'النطاق')}</th><th>{t('Phone', 'الهاتف')}</th><th>{t('Approved', 'معتمد')}</th></tr></thead>
          <tbody>
            {(data || []).map((c: any) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.type}</td>
                <td>{c.scope}</td>
                <td>{c.contact_phone || '—'}</td>
                <td>
                  {c.is_approved
                    ? <span className="badge badge-green">{t('Yes', 'نعم')}</span>
                    : <span className="badge badge-gray">{t('No', 'لا')}</span>}
                </td>
              </tr>
            ))}
            {!data?.length && (
              <tr><td colSpan={5}>
                <div className="empty-state">
                  <div className="empty-icon">🏥</div>
                  <div className="empty-title">{t('No centers', 'لا توجد مراكز')}</div>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
      {open && (
        <div className="drawer-backdrop" onClick={() => setOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>{t('Add repair center', 'إضافة مركز إصلاح')}</h3>
              <button className="drawer-close" onClick={() => setOpen(false)}>✕</button>
            </div>
            <CenterForm onSubmit={(b) => create.mutate(b)} onCancel={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}

function CenterForm({ onSubmit, onCancel }: { onSubmit: (b: any) => void; onCancel: () => void }) {
  const t = useT()
  const [f, setF] = useState({ name: '', type: 'public', scope: 'local', contact_phone: '', contact_email: '', is_approved: true })
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(f) }}>
      <div className="drawer-form">
        <label className="field"><span>{t('Name', 'الاسم')}</span><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></label>
        <div className="row">
          <label className="field flex-1"><span>{t('Type', 'النوع')}</span>
            <select className="input" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
              <option>public</option><option>private</option>
            </select>
          </label>
          <label className="field flex-1"><span>{t('Scope', 'النطاق')}</span>
            <select className="input" value={f.scope} onChange={(e) => setF({ ...f, scope: e.target.value })}>
              <option>local</option><option>national</option><option>international</option>
            </select>
          </label>
        </div>
        <label className="field"><span>{t('Phone', 'الهاتف')}</span><input className="input" value={f.contact_phone} onChange={(e) => setF({ ...f, contact_phone: e.target.value })} /></label>
        <label className="field"><span>{t('Email', 'البريد الإلكتروني')}</span><input className="input" value={f.contact_email} onChange={(e) => setF({ ...f, contact_email: e.target.value })} /></label>
      </div>
      <div className="drawer-footer">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>{t('Cancel', 'إلغاء')}</button>
        <button type="submit" className="btn btn-primary">{t('Save', 'حفظ')}</button>
      </div>
    </form>
  )
}
