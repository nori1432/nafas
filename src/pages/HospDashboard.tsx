import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuth } from '../store/auth'
import { useT } from '../store/lang'
import { IcoCalendar, IcoBed, IcoUsers, IcoCommunity, IcoWrench } from '../components/Icon'

export default function HospDashboard() {
  const { user } = useAuth()
  const t = useT()
  const { data, isLoading } = useQuery({
    queryKey: ['hosp-dashboard'],
    queryFn: async () => (await api.get('/hospital-portal/dashboard')).data.data,
  })

  const d = data || {}
  const hosp = d.hospital || {}
  const faultyCount = d.faulty_equipment || 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Hero banner — design tokens instead of raw hex */}
      <div className="card" style={{ background: 'var(--accent, #C0392B)', borderRadius: 12, padding: '1.5rem' }}>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{t('Hospital Admin', 'مسؤول مستشفى')}</div>
        <div style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginTop: 4 }}>{user?.full_name}</div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 }}>
          {hosp.name_en || `Hospital #${user?.hospital_id}`}
        </div>
      </div>

      <div className="kpi-grid">
        {/* Appointments Today */}
        <div className="kpi-card accent">
          <div className="kpi-icon" style={{ background: 'rgba(192,57,43,0.12)', color: 'var(--accent)' }}>
            <IcoCalendar size={18} />
          </div>
          <div>
            <div className="label">{t('Appointments Today', 'مواعيد اليوم')}</div>
            <div className="value">{isLoading ? '…' : (d.appointments_today ?? '—')}</div>
          </div>
        </div>

        {/* Available Beds */}
        <div className="kpi-card green">
          <div className="kpi-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
            <IcoBed size={18} />
          </div>
          <div>
            <div className="label">{t('Available Beds', 'الأسرّة المتاحة')}</div>
            <div className="value">{isLoading ? '…' : (hosp.available_beds ?? '—')}</div>
            <div className="delta">{`${t('of', 'من')} ${hosp.total_beds ?? 0} ${t('total', 'إجمالي')}`}</div>
          </div>
        </div>

        {/* Total Staff */}
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}>
            <IcoUsers size={18} />
          </div>
          <div>
            <div className="label">{t('Total Staff', 'إجمالي الكوادر')}</div>
            <div className="value">{isLoading ? '…' : (d.staff_count ?? '—')}</div>
          </div>
        </div>

        {/* Community Questions */}
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>
            <IcoCommunity size={18} />
          </div>
          <div>
            <div className="label">{t('Community Questions', 'أسئلة المجتمع')}</div>
            <div className="value">{isLoading ? '…' : (d.open_community_questions ?? '—')}</div>
          </div>
        </div>

        {/* Faulty Equipment */}
        <div className={`kpi-card ${faultyCount > 0 ? 'red' : ''}`}>
          <div className="kpi-icon" style={{ background: faultyCount > 0 ? 'rgba(239,68,68,0.12)' : 'rgba(107,114,128,0.12)', color: faultyCount > 0 ? '#ef4444' : 'var(--text-3)' }}>
            <IcoWrench size={18} />
          </div>
          <div>
            <div className="label">{t('Faulty Equipment', 'معدات معطلة')}</div>
            <div className="value">{isLoading ? '…' : (d.faulty_equipment ?? '—')}</div>
          </div>
        </div>

        {/* Open Maintenance Needs */}
        <div className="kpi-card amber">
          <div className="kpi-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
            <IcoWrench size={18} />
          </div>
          <div>
            <div className="label">{t('Open Maintenance Needs', 'طلبات الصيانة المفتوحة')}</div>
            <div className="value">{isLoading ? '…' : (d.open_maintenance_needs ?? '—')}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
