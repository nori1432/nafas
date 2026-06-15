import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useT } from '../store/lang'
import { IcoHeart } from '../components/Icon'

export default function Donations() {
  return <BloodTab />
}

function statusBadge(status: string) {
  if (status === 'active') return 'badge-green'
  if (status === 'ended') return 'badge-gray'
  if (status === 'upcoming') return 'badge-blue'
  return 'badge-ink'
}

function BloodTab() {
  const t = useT()
  const { data } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () =>
      (await api.get('/blood/campaigns', { params: { per_page: 100 } })).data.data as any[],
  })

  const campaigns = data || []

  return (
    <div className="table-wrap card">
      <table className="nfs">
        <thead>
          <tr>
            <th>{t('Title', 'العنوان')}</th>
            <th>{t('Hospital', 'المستشفى')}</th>
            <th>{t('Types', 'الأنواع')}</th>
            <th>{t('Progress', 'التقدم')}</th>
            <th>{t('Status', 'الحالة')}</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c: any) => (
            <tr key={c.id}>
              <td>{c.title_ar}</td>
              <td>{c.hospital_name}</td>
              <td>{(c.blood_types_needed || []).join(', ')}</td>
              <td>
                <div style={{ background: 'var(--surface-3)', borderRadius: 6, height: 8, width: 180, overflow: 'hidden' }}>
                  <div style={{ background: 'var(--accent)', width: `${Math.min(c.progress_percent ?? 0, 100)}%`, height: '100%' }} />
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginTop: 3 }}>
                  {c.collected_units}/{c.target_units}
                </span>
              </td>
              <td>
                <span className={`badge ${statusBadge(c.status)}`}>{c.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!campaigns.length && (
        <div className="empty-state">
          <div className="empty-icon"><IcoHeart size={32} /></div>
          <div className="empty-title">{t('No campaigns', 'لا توجد حملات')}</div>
          <div className="empty-sub">{t('Blood donation campaigns will appear here.', 'ستظهر حملات التبرع بالدم هنا.')}</div>
        </div>
      )}
    </div>
  )
}
