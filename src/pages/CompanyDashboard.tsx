import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useT } from '../store/lang'
import { IcoDocument, IcoCheck, IcoBriefcase, IcoStar, IcoBuilding } from '../components/Icon'

export default function CompanyDashboard() {
  const t = useT()
  const { data, isLoading } = useQuery({
    queryKey: ['company-dashboard'],
    queryFn: async () => (await api.get('/companies/dashboard')).data.data,
  })

  const d = data || {}
  const co = d.company || {}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Pending approval banner — CSS variables instead of raw hex */}
      {!co.is_approved && (
        <div style={{
          background: 'var(--amber-bg, #FFF3CD)',
          border: '1px solid var(--amber-border, #F39C12)',
          borderRadius: 8,
          padding: '1rem',
          color: 'var(--amber-text, #856404)',
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
        }}>
          <span className="badge badge-amber" style={{ flexShrink: 0, marginTop: 1 }}>
            {t('Pending', 'قيد الانتظار')}
          </span>
          <span>
            <strong>{t('Pending Approval', 'قيد الموافقة')}</strong>
            {' — '}
            {t(
              'Your company profile is under review. Once approved, you can submit offers on maintenance needs.',
              'ملفك الشركي قيد المراجعة. بعد الموافقة يمكنك تقديم عروض على طلبات الصيانة.'
            )}
          </span>
        </div>
      )}

      <div className="kpi-grid">
        {/* Pending Offers */}
        <div className="kpi-card amber">
          <div className="kpi-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
            <IcoDocument size={18} />
          </div>
          <div>
            <div className="label">{t('Pending Offers', 'عروض قيد الانتظار')}</div>
            <div className="value">{isLoading ? '…' : (d.pending_offers ?? '—')}</div>
          </div>
        </div>

        {/* Accepted Offers */}
        <div className="kpi-card accent">
          <div className="kpi-icon" style={{ background: 'rgba(192,57,43,0.12)', color: 'var(--accent)' }}>
            <IcoCheck size={18} />
          </div>
          <div>
            <div className="label">{t('Accepted Offers', 'عروض مقبولة')}</div>
            <div className="value">{isLoading ? '…' : (d.accepted_offers ?? '—')}</div>
          </div>
        </div>

        {/* Completed Jobs */}
        <div className="kpi-card green">
          <div className="kpi-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
            <IcoBriefcase size={18} />
          </div>
          <div>
            <div className="label">{t('Completed Jobs', 'مشاريع مكتملة')}</div>
            <div className="value">{isLoading ? '…' : (d.completed_jobs ?? '—')}</div>
          </div>
        </div>

        {/* Rating */}
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
            <IcoStar size={18} />
          </div>
          <div>
            <div className="label">{t('Rating', 'التقييم')}</div>
            <div className="value">{isLoading ? '…' : (co.rating ? Number(co.rating).toFixed(1) : '—')}</div>
            {co.rating && <div className="delta">{t('out of 5', 'من 5')}</div>}
          </div>
        </div>

        {/* Open Needs Available */}
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}>
            <IcoBuilding size={18} />
          </div>
          <div>
            <div className="label">{t('Open Needs Available', 'طلبات مفتوحة متاحة')}</div>
            <div className="value">{isLoading ? '…' : (d.open_needs_market ?? '—')}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
