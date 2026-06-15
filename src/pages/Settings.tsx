import { useAuth } from '../store/auth'
import { useT } from '../store/lang'
import { IcoSettings } from '../components/Icon'

function initials(name: string | undefined) {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

export default function Settings() {
  const { user } = useAuth()
  const t = useT()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Profile card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          {/* Avatar */}
          <div style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'var(--accent)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 18,
            flexShrink: 0,
            letterSpacing: 1,
          }}>
            {initials(user?.full_name)}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{user?.full_name}</div>
            <span className="badge badge-ink" style={{ marginTop: 4, display: 'inline-block' }}>{user?.role}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {/* Full name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', fontWeight: 600 }}>
              {t('Full name', 'الاسم الكامل')}
            </span>
            <span style={{ fontSize: 15, fontWeight: 500 }}>{user?.full_name || '—'}</span>
          </div>

          {/* Phone */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', fontWeight: 600 }}>
              {t('Phone', 'الهاتف')}
            </span>
            <span style={{ fontSize: 15, fontWeight: 500 }}>{user?.phone_number || '—'}</span>
          </div>

          {/* Role */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', fontWeight: 600 }}>
              {t('Role', 'الدور')}
            </span>
            <span style={{ fontSize: 15, fontWeight: 500 }}>
              <span className="badge badge-ink">{user?.role || '—'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Platform settings card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div className="kpi-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1', width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <IcoSettings size={18} />
          </div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{t('Platform settings', 'إعدادات المنصة')}</div>
        </div>
        <p style={{ color: 'var(--text-3)', margin: 0, fontSize: 13, lineHeight: 1.6 }}>
          {t(
            'Notification templates, repair-center approval workflow, and donation thresholds will appear here.',
            'قوالب الإشعارات وسير عمل الموافقة وحدود التبرعات ستظهر هنا.'
          )}{' '}
          (Backend hooks ready — UI editor TBD.)
        </p>
      </div>
    </div>
  )
}
