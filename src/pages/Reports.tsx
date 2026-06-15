import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { useT } from '../store/lang'

export default function Reports() {
  const t = useT()
  const beds = useQuery({
    queryKey: ['rep-beds'],
    queryFn: async () => (await api.get('/admin/reports/beds')).data.data as any[],
  })
  const dons = useQuery({
    queryKey: ['rep-dons'],
    queryFn: async () => (await api.get('/admin/reports/donations', { params: { days: 30 } })).data.data,
  })

  function exportCSV() {
    const rows = beds.data || []
    const csv = ['wilaya_id,total_beds,available_beds,hospital_count']
      .concat(rows.map((r: any) => `${r.wilaya_id},${r.total_beds},${r.available_beds},${r.hospital_count}`))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'beds_by_wilaya.csv'; a.click()
  }

  const wilayaCoverage = new Set((beds.data || []).map((r: any) => r.wilaya_id)).size

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">{t('Bed availability by wilaya', 'توافر الأسرّة حسب الولاية')}</div>
            <div className="card-subtitle">{t('All wilayas · live data', 'جميع الولايات · بيانات مباشرة')}</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-ghost btn-sm" onClick={exportCSV}>{t('Export CSV', 'تصدير CSV')}</button>
            <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>{t('Print PDF', 'طباعة PDF')}</button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={beds.data || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="wilaya_id" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total_beds" fill="var(--ink)" />
            <Bar dataKey="available_beds" fill="var(--green)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">{t('Donations', 'التبرعات')}</div>
            <div className="card-subtitle">{t('Last 30 days', 'آخر 30 يوماً')}</div>
          </div>
        </div>
        <div className="kpi-grid">
          <div className="kpi-card green">
            <div className="kpi-icon" style={{ background: 'var(--green-light, #e6f9ee)', color: 'var(--green)' }}>🩸</div>
            <div>
              <div className="label">{t('Blood units', 'وحدات الدم')}</div>
              <div className="value">{dons.data?.blood_units_collected ?? 0}</div>
            </div>
          </div>
          <div className="kpi-card accent">
            <div className="kpi-icon" style={{ background: 'var(--accent-light, #eef2ff)', color: 'var(--accent)' }}>📣</div>
            <div>
              <div className="label">{t('Active campaigns', 'الحملات النشطة')}</div>
              <div className="value">{dons.data?.active_campaigns ?? 0}</div>
            </div>
          </div>
          <div className="kpi-card amber">
            <div className="kpi-icon" style={{ background: 'var(--amber-light, #fef9ec)', color: 'var(--amber)' }}>🗺️</div>
            <div>
              <div className="label">{t('Wilaya coverage', 'تغطية الولايات')}</div>
              <div className="value">{wilayaCoverage}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
