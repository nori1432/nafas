import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useT } from '../store/lang'

const STATUS_CONFIG: Record<string, { label: string; labelAr: string; badge: string }> = {
  open:      { label: 'Open',      labelAr: 'مفتوح',     badge: 'badge-red'   },
  in_review: { label: 'In Review', labelAr: 'قيد المراجعة', badge: 'badge-amber' },
  resolved:  { label: 'Resolved',  labelAr: 'محلول',    badge: 'badge-green' },
  closed:    { label: 'Closed',    labelAr: 'مغلق',     badge: 'badge-gray'  },
}

const CAT_COLORS: Record<string, string> = {
  cleanliness: '#0891b2', staff: '#16a34a', equipment: '#d97706',
  wait_time: '#7c3aed', billing: '#dc2626', general: '#6b7280',
}

export default function Complaints() {
  const qc = useQueryClient()
  const t = useT()
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState<any>(null)
  const [response, setResponse] = useState('')

  const { data } = useQuery({
    queryKey: ['complaints', status],
    queryFn: async () => (await api.get('/admin/complaints', { params: { status: status || undefined, per_page: 100 } })).data.data as any[],
  })

  const upd = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: any }) => (await api.put(`/complaints/${id}`, body)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['complaints'] }); setOpen(null); setResponse('') },
  })

  const all = data || []
  const list = all.filter((c: any) =>
    !search ||
    (c.submitter_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.hospital_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  )

  const openCount = all.filter((c: any) => c.status === 'open').length
  const inReviewCount = all.filter((c: any) => c.status === 'in_review').length
  const resolvedCount = all.filter((c: any) => c.status === 'resolved').length

  return (
    <>
      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { icon: null, label: t('Total', 'الإجمالي'), value: all.length, color: '' },
          { icon: null, label: t('Open', 'مفتوح'), value: openCount, color: openCount > 20 ? 'accent' : '' },
          { icon: null, label: t('In Review', 'قيد المراجعة'), value: inReviewCount, color: 'amber' },
          { icon: null, label: t('Resolved', 'محلول'), value: resolvedCount, color: 'green' },
        ].map(k => (
          <div key={k.label} className={`kpi-card ${k.color}`} style={{ padding: '14px 16px' }}>
            <div>
              <div className="label">{k.label}</div>
              <div className="value" style={{ fontSize: 22 }}>{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="toolbar">
        <input className="input input-search" placeholder={t('Search complaints…', 'بحث عن شكوى...')} value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)} style={{ maxWidth: 160 }}>
          <option value="">{t('All Statuses', 'جميع الحالات')}</option>
          {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{list.length} {t('complaints', 'شكوى')}</span>
      </div>

      <div className="table-wrap">
        <table className="nfs">
          <thead>
            <tr><th>#</th><th>{t('Citizen', 'مواطن')}</th><th>{t('Hospital', 'المستشفى')}</th><th>{t('Category', 'الفئة')}</th><th>{t('Description', 'الوصف')}</th><th>{t('Status', 'الحالة')}</th><th>{t('Date', 'التاريخ')}</th><th></th></tr>
          </thead>
          <tbody>
            {list.map((c: any) => {
              const sc = STATUS_CONFIG[c.status] || STATUS_CONFIG.open
              return (
                <tr key={c.id}>
                  <td style={{ color: 'var(--text-3)', fontSize: 12 }}>#{c.id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.submitter_name || t('Anonymous', 'مجهول')}</div>
                    {c.submitter_phone && <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{c.submitter_phone}</div>}
                  </td>
                  <td style={{ fontSize: 13 }}>{c.hospital_name || '—'}</td>
                  <td>
                    <span style={{ padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: `${(CAT_COLORS[c.category] || '#6b7280')}18`, color: CAT_COLORS[c.category] || '#6b7280' }}>
                      {(c.category || 'general').replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ maxWidth: 220 }}>
                    <div style={{ fontSize: 13, color: 'var(--text-2)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {c.description}
                    </div>
                  </td>
                  <td><span className={`badge ${sc.badge}`}>{t(sc.label, sc.labelAr)}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                    {(c.created_at || '').slice(0, 10)}
                  </td>
                  <td>
                    <button className="btn btn-sm btn-ghost" onClick={() => { setOpen(c); setResponse(c.response_notes || '') }}>
                      View
                    </button>
                  </td>
                </tr>
              )
            })}
            {!list.length && (
              <tr><td colSpan={8}>
                <div className="empty-state"><div className="empty-icon">📣</div><div className="empty-title">No complaints found</div></div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <>
          <div className="drawer-backdrop" onClick={() => setOpen(null)} />
          <aside className="drawer" style={{ width: 520 }}>
            <div className="drawer-header">
              <div>
                <h3>Complaint #{open.id}</h3>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                  {open.hospital_name} · {(open.category || 'general').replace('_', ' ')} · {(open.created_at || '').slice(0, 10)}
                </div>
              </div>
              <button className="drawer-close" onClick={() => setOpen(null)}>✕</button>
            </div>

            {/* Citizen info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #c0392b, #922b21)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                {(open.submitter_name || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{open.submitter_name || 'Anonymous'}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                  {open.submitter_phone && <span>📱 {open.submitter_phone}</span>}
                  {open.submitter_email && <span style={{ marginLeft: 10 }}>📧 {open.submitter_email}</span>}
                </div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <span className={`badge ${(STATUS_CONFIG[open.status] || STATUS_CONFIG.open).badge}`}>
                  {t((STATUS_CONFIG[open.status] || STATUS_CONFIG.open).label, (STATUS_CONFIG[open.status] || STATUS_CONFIG.open).labelAr)}
                </span>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Complaint Description</div>
              <div style={{ padding: '14px 16px', background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.7 }}>
                {open.description || '—'}
              </div>
            </div>

            {/* Timeline */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Timeline</div>
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-dot" style={{ background: '#dc2626' }} />
                  <div className="timeline-content">
                    <div className="timeline-title">Complaint Submitted</div>
                    <div className="timeline-meta">{(open.created_at || '').slice(0, 16).replace('T', ' ')}</div>
                  </div>
                </div>
                {open.status !== 'open' && (
                  <div className="timeline-item">
                    <div className="timeline-dot" style={{ background: '#d97706' }} />
                    <div className="timeline-content">
                      <div className="timeline-title">Under Review</div>
                      <div className="timeline-meta">Admin assigned</div>
                    </div>
                  </div>
                )}
                {(open.status === 'resolved' || open.status === 'closed') && (
                  <div className="timeline-item">
                    <div className="timeline-dot" style={{ background: '#16a34a' }} />
                    <div className="timeline-content">
                      <div className="timeline-title">Resolved</div>
                      <div className="timeline-meta">{(open.updated_at || '').slice(0, 10)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="field" style={{ marginBottom: 14 }}>
              <span>Admin Response</span>
              <textarea className="input" rows={4} placeholder="Write your official response to the citizen…" value={response} onChange={(e) => setResponse(e.target.value)} />
            </div>

            <div className="field" style={{ marginBottom: 20 }}>
              <span>Update Status</span>
              <select className="input" value={open.status} onChange={(e) => setOpen({ ...open, status: e.target.value })}>
                {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
              </select>
            </div>

            <div className="drawer-footer">
              <button className="btn btn-ghost" onClick={() => setOpen(null)}>Cancel</button>
              <button className="btn btn-primary" disabled={upd.isPending}
                onClick={() => upd.mutate({ id: open.id, body: { status: open.status, response_notes: response } })}>
                {upd.isPending ? 'Saving…' : '💾 Save & Respond'}
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  )
}
