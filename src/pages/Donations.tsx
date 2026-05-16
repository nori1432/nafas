import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useT } from '../store/lang'

type Tab = 'blood' | 'organ' | 'financial'

export default function Donations() {
  const [tab, setTab] = useState<Tab>('blood')
  const t = useT()
  return (
    <>
      <div className="toolbar">
        <button className={`btn ${tab === 'blood' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('blood')}>{t('Blood', 'الدم')}</button>
        <button className={`btn ${tab === 'organ' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('organ')}>{t('Organ', 'أعضاء')}</button>
        <button className={`btn ${tab === 'financial' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('financial')}>{t('Financial', 'مالي')}</button>
      </div>
      {tab === 'blood' && <BloodTab />}
      {tab === 'organ' && <OrganTab />}
      {tab === 'financial' && <FinancialTab />}
    </>
  )
}

function BloodTab() {
  const { data } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => (await api.get('/blood/campaigns', { params: { per_page: 100 } })).data.data as any[],
  })
  return (
    <div className="table-wrap">
      <table className="nfs">
        <thead><tr><th>Title</th><th>Hospital</th><th>Types</th><th>Progress</th><th>Status</th></tr></thead>
        <tbody>
          {(data || []).map((c: any) => (
            <tr key={c.id}>
              <td>{c.title_ar}</td>
              <td>{c.hospital_name}</td>
              <td>{(c.blood_types_needed || []).join(', ')}</td>
              <td>
                <div style={{ background: '#eee', borderRadius: 6, height: 8, width: 180, overflow: 'hidden' }}>
                  <div style={{ background: 'var(--accent)', width: `${c.progress_percent}%`, height: '100%' }} />
                </div>
                <span className="muted" style={{ fontSize: 12 }}>{c.collected_units}/{c.target_units}</span>
              </td>
              <td><span className="badge badge-ink">{c.status}</span></td>
            </tr>
          ))}
          {!data?.length && <tr><td colSpan={5} className="muted" style={{ padding: 30, textAlign: 'center' }}>No campaigns</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

function OrganTab() {
  const qc = useQueryClient()
  const { data } = useQuery({
    queryKey: ['organ'],
    queryFn: async () => (await api.get('/admin/donations', { params: { type: 'organ', per_page: 100 } })).data.data as any[],
  })
  // organ uses /admin/donations? not implemented; we keep simple
  const review = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: any }) => (await api.put(`/organ/${id}/review`, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organ'] }),
  })
  return (
    <div className="table-wrap">
      <table className="nfs">
        <thead><tr><th>Donor</th><th>Organs</th><th>Status</th><th>Submitted</th><th>Actions</th></tr></thead>
        <tbody>
          {(data || []).map((o: any) => (
            <tr key={o.id}>
              <td>{o.donor_name}</td>
              <td>{(o.organs || []).join(', ')}</td>
              <td><span className="badge badge-ink">{o.status}</span></td>
              <td className="muted">{(o.created_at || '').slice(0, 10)}</td>
              <td>
                <button className="btn btn-primary" onClick={() => review.mutate({ id: o.id, body: { status: 'approved' } })}>Approve</button>{' '}
                <button className="btn btn-danger" onClick={() => review.mutate({ id: o.id, body: { status: 'rejected' } })}>Reject</button>
              </td>
            </tr>
          ))}
          {!data?.length && <tr><td colSpan={5} className="muted" style={{ padding: 30, textAlign: 'center' }}>No organ registrations</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

function FinancialTab() {
  const qc = useQueryClient()
  const { data } = useQuery({
    queryKey: ['financial'],
    queryFn: async () => (await api.get('/financial/donations', { params: { per_page: 100 } })).data.data as any[],
  })
  const confirm = useMutation({
    mutationFn: async (id: number) => (await api.put(`/financial/donations/${id}/confirm`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['financial'] }),
  })
  const disburse = useMutation({
    mutationFn: async (id: number) => (await api.put(`/financial/donations/${id}/disburse`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['financial'] }),
  })
  return (
    <div className="table-wrap">
      <table className="nfs">
        <thead><tr><th>Donor</th><th>Hospital</th><th>Amount</th><th>Purpose</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {(data || []).map((f: any) => (
            <tr key={f.id}>
              <td>{f.donor_name}</td>
              <td>{f.hospital_name}</td>
              <td>{f.amount} DZD</td>
              <td>{f.purpose}</td>
              <td><span className="badge badge-ink">{f.status}</span></td>
              <td>
                {f.status === 'pending' && <button className="btn btn-primary" onClick={() => confirm.mutate(f.id)}>Confirm</button>}
                {f.status === 'confirmed' && <button className="btn btn-ghost" onClick={() => disburse.mutate(f.id)}>Mark disbursed</button>}
              </td>
            </tr>
          ))}
          {!data?.length && <tr><td colSpan={6} className="muted" style={{ padding: 30, textAlign: 'center' }}>No donations</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
