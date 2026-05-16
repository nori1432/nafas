import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang, useT } from '../store/lang'
import {
  IcoDashboard, IcoBed, IcoWrench, IcoCalendar,
  IcoHeart, IcoFlag, IcoChart, IcoBuilding,
  IcoShield, IcoGlobe,
} from '../components/Icon'

const FEATURES = [
  {
    Icon: IcoBuilding,
    titleEn: 'Hospital Management',
    titleAr: 'إدارة المستشفيات',
    descEn: 'Full visibility into hospital status, staff, equipment, and real-time capacity across the country.',
    descAr: 'رؤية كاملة لحالة المستشفيات والكوادر والمعدات والطاقة الاستيعابية في الوقت الفعلي.',
  },
  {
    Icon: IcoBed,
    titleEn: 'Bed Availability',
    titleAr: 'توفر الأسرّة',
    descEn: 'Live tracking of bed occupancy across all wards and facilities nationwide.',
    descAr: 'تتبع مباشر لإشغال الأسرّة في جميع الأجنحة والمرافق على المستوى الوطني.',
  },
  {
    Icon: IcoWrench,
    titleEn: 'Maintenance & Equipment',
    titleAr: 'الصيانة والتجهيزات',
    descEn: 'Equipment requests matched with certified maintenance companies for fast response.',
    descAr: 'طلبات المعدات تُقابَل مع شركات الصيانة المعتمدة للاستجابة السريعة.',
  },
  {
    Icon: IcoCalendar,
    titleEn: 'Appointment System',
    titleAr: 'نظام المواعيد',
    descEn: 'Centralized scheduling and appointment management for all connected facilities.',
    descAr: 'جدولة مركزية وإدارة المواعيد لجميع المرافق المتصلة.',
  },
  {
    Icon: IcoHeart,
    titleEn: 'Blood & Organ Donations',
    titleAr: 'التبرع بالدم والأعضاء',
    descEn: 'National donor registry connecting citizens with hospitals in urgent need.',
    descAr: 'سجل وطني للمتبرعين يربط المواطنين بالمستشفيات في حالات الاستعجال.',
  },
  {
    Icon: IcoFlag,
    titleEn: 'Complaints & Reviews',
    titleAr: 'الشكاوى والتقييمات',
    descEn: 'Transparent feedback channel for citizens with full administrative oversight.',
    descAr: 'قناة تغذية راجعة شفافة للمواطنين مع إشراف إداري كامل.',
  },
]

const STATS = [
  { n: '15+',  en: 'Hospitals',    ar: 'مستشفى'      },
  { n: '6.9k', en: 'Beds Tracked', ar: 'سرير مُتابَع' },
  { n: '200+', en: 'Companies',    ar: 'شركة معتمدة'  },
  { n: '100%', en: 'Secure',       ar: 'آمن تماماً'   },
]

const WHO = [
  {
    Icon: IcoChart,
    titleEn: 'National Administrators',
    titleAr: 'المسؤولون الوطنيون',
    descEn: 'Full-platform oversight — manage hospitals, companies, users, reports, and platform-wide settings from one place.',
    descAr: 'إشراف على كامل المنصة — إدارة المستشفيات والشركات والمستخدمين والتقارير من مكان واحد.',
    dark: true,
  },
  {
    Icon: IcoBuilding,
    titleEn: 'Hospital Administrators',
    titleAr: 'مسؤولو المستشفيات',
    descEn: 'Manage beds, staff, appointments, equipment needs, donations, and incoming complaints.',
    descAr: 'إدارة الأسرّة والكوادر والمواعيد واحتياجات المعدات والتبرعات والشكاوى.',
    dark: false,
  },
  {
    Icon: IcoWrench,
    titleEn: 'Maintenance Companies',
    titleAr: 'شركات الصيانة',
    descEn: 'Browse hospital equipment requests, submit competitive offers, manage contracts and service history.',
    descAr: 'تصفح طلبات معدات المستشفيات وتقديم العروض التنافسية وإدارة العقود وسجل الخدمة.',
    dark: false,
  },
]

export default function Landing() {
  const { lang, toggle } = useLang()
  const t = useT()
  const nav = useNavigate()
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const featuresRef = useRef<HTMLElement>(null)

  const ff = lang === 'ar' ? "'Cairo', sans-serif" : "'Inter', sans-serif"

  function scrollTo(ref: React.RefObject<HTMLElement | null>) {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div dir={dir} style={{ fontFamily: ff, background: '#fff', color: 'var(--text)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(18px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 clamp(20px, 5vw, 80px)',
        display: 'flex', alignItems: 'center', height: 62, gap: 20,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo.png" alt="NAFAS" style={{ height: 38, width: 'auto', display: 'block' }} />
        </div>
        <div style={{ flex: 1 }} />

        {/* About link */}
        <button onClick={() => nav('/about')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, color: 'var(--text-2)',
          padding: '6px 12px', borderRadius: 8,
        }}>
          {t('About', 'حول المشروع')}
        </button>

        {/* Lang toggle */}
        <button onClick={toggle} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 13px', borderRadius: 8,
          border: '1px solid var(--border)', background: 'transparent',
          cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--text-2)',
        }}>
          <span style={{ color: 'var(--text-3)' }}><IcoGlobe size={13} /></span>
          {lang === 'en' ? 'العربية' : 'English'}
        </button>

        {/* CTA */}
        <button onClick={() => nav('/login')} style={{
          padding: '7px 18px', borderRadius: 8,
          border: 'none', background: 'var(--accent)',
          cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#fff',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {t('Admin Portal', 'بوابة الإدارة')}
          <span style={{ fontSize: 15 }}>{lang === 'ar' ? '←' : '→'}</span>
        </button>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{
        minHeight: 'calc(100vh - 62px)',
        background: 'var(--ink)',
        display: 'flex', alignItems: 'center',
        padding: 'clamp(60px, 8vw, 120px) clamp(20px, 5vw, 80px)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Grid overlay */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, opacity: 0.035,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
        {/* Glow */}
        <div aria-hidden style={{
          position: 'absolute',
          top: '15%', [lang === 'ar' ? 'left' : 'right']: '0',
          width: 600, height: 600,
          background: 'radial-gradient(circle at 50% 50%, rgba(234,88,12,0.16) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        {/* Second glow */}
        <div aria-hidden style={{
          position: 'absolute', bottom: '-10%',
          [lang === 'ar' ? 'right' : 'left']: '10%',
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(234,88,12,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 760, position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 14px', borderRadius: 99,
            border: '1px solid rgba(234,88,12,0.35)',
            background: 'rgba(234,88,12,0.07)',
            marginBottom: 30,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ea580c', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#ea580c', letterSpacing: lang === 'en' ? '0.4px' : 0 }}>
              {lang === 'ar' ? 'منصة الرعاية الصحية الوطنية · الجزائر' : "Algeria's National Healthcare Platform"}
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(40px, 7vw, 76px)',
            fontWeight: 900, color: '#fff',
            lineHeight: 1.07, letterSpacing: -2.5,
            margin: '0 0 22px',
            fontFamily: ff,
          }}>
            {lang === 'ar' ? (
              <>
                إدارة الرعاية<br />
                <span style={{ color: 'var(--accent)' }}>الصحية بذكاء</span><br />
                على المستوى الوطني
              </>
            ) : (
              <>
                Smart Healthcare<br />
                <span style={{ color: 'var(--accent)' }}>Management</span><br />
                at National Scale
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(15px, 1.8vw, 18px)',
            color: 'rgba(255,255,255,0.48)',
            lineHeight: 1.75, maxWidth: 580, margin: '0 0 44px',
            fontFamily: ff,
          }}>
            {lang === 'ar'
              ? 'منصة موحّدة تربط المستشفيات وشركات الصيانة والمسؤولين الصحيين الوطنيين لتبسيط عمليات الرعاية الصحية في الجزائر.'
              : "A unified platform connecting Algeria's hospitals, maintenance companies, and national health administrators to streamline healthcare operations."}
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => scrollTo(featuresRef)}
              style={{
                padding: '13px 30px', borderRadius: 9,
                border: 'none', background: 'var(--accent)',
                color: '#fff', fontWeight: 700, fontSize: 14,
                cursor: 'pointer', letterSpacing: 0.2,
              }}>
              {t('Explore Features', 'استكشاف الميزات')}
            </button>
            <button
              onClick={() => nav('/login')}
              style={{
                padding: '13px 30px', borderRadius: 9,
                border: '1px solid rgba(255,255,255,0.14)',
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.82)', fontWeight: 600, fontSize: 14,
                cursor: 'pointer',
              }}>
              {t('Sign In', 'تسجيل الدخول')}
            </button>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', gap: clamp('28px', '4vw', '44px'), marginTop: 60,
            paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.07)',
            flexWrap: 'wrap',
          }}>
            {STATS.map(s => (
              <div key={s.n}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: -1, lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', marginTop: 4 }}>{lang === 'ar' ? s.ar : s.en}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section ref={featuresRef} style={{ padding: 'clamp(72px, 9vw, 110px) clamp(20px, 5vw, 80px)', background: '#f8f8f7' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '2.5px', textTransform: 'uppercase', margin: '0 0 14px' }}>
            {t('PLATFORM CAPABILITIES', 'قدرات المنصة')}
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: -1.5, margin: '0 0 14px', color: 'var(--text)', fontFamily: ff }}>
            {lang === 'ar' ? 'كل ما تحتاجه لإدارة الرعاية الصحية' : 'Everything You Need to Manage Healthcare'}
          </h2>
          <p style={{ color: 'var(--text-3)', fontSize: 15, maxWidth: 480, margin: '0 auto', lineHeight: 1.65 }}>
            {lang === 'ar' ? 'أدوات مُصمَّمة خصيصاً لكل دور في منظومة الرعاية الصحية.' : 'Purpose-built tools for every role in the healthcare ecosystem.'}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: 18, maxWidth: 1120, margin: '0 auto',
        }}>
          {FEATURES.map(({ Icon, titleEn, titleAr, descEn, descAr }) => (
            <div
              key={titleEn}
              style={{
                background: '#fff', border: '1px solid var(--border)',
                borderRadius: 14, padding: '26px 24px',
                transition: 'box-shadow 0.18s, transform 0.18s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,0,0,0.07)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ width: 42, height: 42, borderRadius: 11, background: 'var(--accent-light)', display: 'grid', placeItems: 'center', marginBottom: 18, color: 'var(--accent)' }}>
                <Icon size={20} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 8 }}>{lang === 'ar' ? titleAr : titleEn}</div>
              <div style={{ fontSize: 13.5, color: 'var(--text-3)', lineHeight: 1.68 }}>{lang === 'ar' ? descAr : descEn}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHO IT'S FOR ──────────────────────────────────── */}
      <section style={{ padding: 'clamp(72px, 9vw, 110px) clamp(20px, 5vw, 80px)', background: '#fff' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '2.5px', textTransform: 'uppercase', margin: '0 0 14px' }}>
            {t("WHO IT'S FOR", 'لمن هذه المنصة')}
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: -1.5, margin: 0, color: 'var(--text)', fontFamily: ff }}>
            {lang === 'ar' ? 'مُصمَّمة لمحترفي الرعاية الصحية' : 'Built for Healthcare Professionals'}
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 18, maxWidth: 1020, margin: '0 auto',
        }}>
          {WHO.map(({ Icon, titleEn, titleAr, descEn, descAr, dark }) => (
            <div
              key={titleEn}
              style={{
                border: dark ? 'none' : '1px solid var(--border)',
                borderRadius: 16, padding: '34px 30px',
                background: dark ? 'var(--ink)' : '#fff',
              }}
            >
              <div style={{
                width: 46, height: 46, borderRadius: 12,
                background: dark ? 'rgba(234,88,12,0.18)' : 'var(--accent-light)',
                display: 'grid', placeItems: 'center', marginBottom: 22,
                color: 'var(--accent)',
              }}>
                <Icon size={22} />
              </div>
              <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 10, color: dark ? '#fff' : 'var(--text)' }}>
                {lang === 'ar' ? titleAr : titleEn}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.68, color: dark ? 'rgba(255,255,255,0.48)' : 'var(--text-3)' }}>
                {lang === 'ar' ? descAr : descEn}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW TO GET ACCESS ─────────────────────────────── */}
      <section style={{
        padding: 'clamp(80px, 10vw, 120px) clamp(20px, 5vw, 80px)',
        background: 'var(--ink)', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Top accent line */}
        <div aria-hidden style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 80, height: 3, background: 'var(--accent)', borderRadius: '0 0 3px 3px' }} />
        {/* Glow */}
        <div aria-hidden style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(234,88,12,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 580, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 58, height: 58, borderRadius: 14,
            background: 'rgba(234,88,12,0.12)',
            border: '1px solid rgba(234,88,12,0.25)',
            display: 'grid', placeItems: 'center',
            margin: '0 auto 28px',
            color: 'var(--accent)',
          }}>
            <IcoShield size={28} />
          </div>

          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#fff', letterSpacing: -1.5, margin: '0 0 18px', fontFamily: ff }}>
            {lang === 'ar' ? 'كيف تحصل على الوصول؟' : 'How to Get Access?'}
          </h2>

          <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 15, lineHeight: 1.75, margin: '0 0 14px' }}>
            {lang === 'ar'
              ? 'منصة نَفَس متاحة حصرياً للمؤسسات الصحية المرخّصة وشركات الصيانة المعتمدة العاملة في الجزائر.'
              : 'NAFAS is available exclusively to licensed healthcare institutions and certified maintenance companies operating in Algeria.'}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13.5, lineHeight: 1.75, margin: '0 0 40px' }}>
            {lang === 'ar'
              ? 'للحصول على الوصول إلى المنصة، تواصل مباشرةً مع المسؤول الوطني الذي سيُزوّدك بمعلومات حسابك.'
              : 'To request access, reach out directly to the national administrator who will provide you with your account credentials.'}
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => nav('/login')}
              style={{
                padding: '13px 30px', borderRadius: 9,
                border: 'none', background: 'var(--accent)',
                color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              }}>
              {t('Sign In to Portal', 'الدخول إلى البوابة')}
            </button>
            <a
              href="mailto:admin@nafas.dz"
              style={{
                padding: '13px 30px', borderRadius: 9,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.75)', fontWeight: 600, fontSize: 14,
                cursor: 'pointer', textDecoration: 'none', display: 'inline-block',
              }}>
              {t('Contact Administrator', 'تواصل مع المسؤول')}
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer style={{
        padding: '22px clamp(20px, 5vw, 80px)',
        background: '#050504',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--accent)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 900, fontSize: 12 }}>N</div>
          <span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>NAFAS</span>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>·</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
            {lang === 'ar' ? 'منصة الرعاية الصحية الوطنية للجزائر' : "Algeria's National Healthcare Platform"}
          </span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={toggle}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
            <IcoGlobe size={12} />
            {lang === 'en' ? 'العربية' : 'English'}
          </button>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>© 2026</span>
        </div>
      </footer>
    </div>
  )
}

// Helper to clamp CSS values (used inline for gap)
function clamp(_min: string, _val: string, _max: string) {
  return `clamp(${_min}, ${_val}, ${_max})`
}
