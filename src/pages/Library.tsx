import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useT } from '../store/lang'

type Category = 'free' | 'paid'

interface Book {
  id: number
  title: string
  description: string
  category: Category
  cover_image: string | null
  file_url: string | null
  price: string | null
  buy_url: string | null
  is_active: boolean
  created_at: string
}

const EMPTY_FORM = {
  title: '',
  description: '',
  category: 'free' as Category,
  cover_image: '',
  file_url: '',
  price: '',
  buy_url: '',
}

export default function Library() {
  const t = useT()
  const qc = useQueryClient()
  const [tab, setTab] = useState<Category>('free')
  const [open, setOpen] = useState<Book | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Book | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const { data: books = [], isLoading } = useQuery<Book[]>({
    queryKey: ['library-books', tab],
    queryFn: async () => {
      const r = await api.get('/library/books', { params: { category: tab, per_page: 100 } })
      return r.data.data ?? []
    },
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['library-books', 'free'] })
    qc.invalidateQueries({ queryKey: ['library-books', 'paid'] })
  }

  const createBook = useMutation({
    mutationFn: async (data: typeof EMPTY_FORM) =>
      (await api.post('/library/books', data)).data,
    onSuccess: () => { invalidate(); setShowForm(false); setForm(EMPTY_FORM) },
  })

  const updateBook = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<typeof EMPTY_FORM> }) =>
      (await api.put(`/library/books/${id}`, data)).data,
    onSuccess: () => { invalidate(); setEditing(null); setShowForm(false); setForm(EMPTY_FORM) },
  })

  const deleteBook = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/library/books/${id}`)).data,
    onSuccess: () => { invalidate(); setOpen(null) },
  })

  const seed = useMutation({
    mutationFn: async () => (await api.post('/library/seed')).data,
    onSuccess: () => invalidate(),
  })

  function openAdd() {
    setEditing(null)
    setForm({ ...EMPTY_FORM, category: tab })
    setShowForm(true)
  }

  function openEdit(b: Book) {
    setEditing(b)
    setForm({
      title: b.title,
      description: b.description ?? '',
      category: b.category,
      cover_image: b.cover_image ?? '',
      file_url: b.file_url ?? '',
      price: b.price ?? '',
      buy_url: b.buy_url ?? '',
    })
    setShowForm(true)
    setOpen(null)
  }

  function submitForm() {
    if (!form.title.trim()) return
    if (editing) {
      updateBook.mutate({ id: editing.id, data: form })
    } else {
      createBook.mutate(form)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
            {t('Medical Library', 'المكتبة الطبية')}
          </h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-3)', fontSize: 13 }}>
            {t('Manage free and paid medical books', 'إدارة الكتب الطبية المجانية والمدفوعة')}
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => seed.mutate()} disabled={seed.isPending}
          title={t('Seed placeholder books (runs once)', 'إضافة بيانات تجريبية (مرة واحدة)')}>
          {seed.isPending ? '…' : t('Seed', 'تعبئة تجريبية')}
        </button>
        <button className="btn btn-primary" onClick={openAdd}>
          + {t('Add Book', 'إضافة كتاب')}
        </button>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        {(['free', 'paid'] as Category[]).map((c) => (
          <button key={c} className={`tab ${tab === c ? 'active' : ''}`} onClick={() => setTab(c)}>
            {c === 'free' ? t('Free Books', 'كتب مجانية') : t('Paid Books', 'كتب للشراء')}
          </button>
        ))}
      </div>

      {/* Book list */}
      {isLoading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)' }}>
          {t('Loading…', 'جارٍ التحميل...')}
        </div>
      ) : books.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)' }}>
          {t('No books yet. Click "Add Book" or "Seed" to get started.', 'لا توجد كتب. انقر على "إضافة كتاب" أو "تعبئة تجريبية".')}
        </div>
      ) : (
        <div className="table-wrap card">
          <table className="table">
            <thead>
              <tr>
                <th>{t('Cover', 'الغلاف')}</th>
                <th>{t('Title', 'العنوان')}</th>
                <th>{t('Description', 'الوصف')}</th>
                {tab === 'free'
                  ? <th>{t('File / Link', 'الملف / الرابط')}</th>
                  : <><th>{t('Price', 'السعر')}</th><th>{t('Buy Link', 'رابط الشراء')}</th></>
                }
                <th>{t('Actions', 'إجراءات')}</th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b.id} style={{ cursor: 'pointer' }} onClick={() => setOpen(b)}>
                  <td>
                    {b.cover_image ? (
                      <img src={b.cover_image} alt="" style={{ width: 40, height: 54, objectFit: 'cover', borderRadius: 4 }} />
                    ) : (
                      <div style={{ width: 40, height: 54, borderRadius: 4, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 18 }}>📖</div>
                    )}
                  </td>
                  <td style={{ fontWeight: 600, maxWidth: 200 }}>{b.title}</td>
                  <td style={{ color: 'var(--text-3)', maxWidth: 260, fontSize: 12 }}>
                    {(b.description || '').slice(0, 80)}{(b.description || '').length > 80 ? '…' : ''}
                  </td>
                  {tab === 'free' ? (
                    <td>
                      {b.file_url
                        ? <a href={b.file_url} target="_blank" rel="noopener noreferrer" className="badge badge-green" onClick={(e) => e.stopPropagation()}>{t('Open', 'فتح')}</a>
                        : <span className="badge badge-gray">{t('No file', 'لا يوجد ملف')}</span>}
                    </td>
                  ) : (
                    <>
                      <td>{b.price || <span style={{ color: 'var(--text-3)' }}>—</span>}</td>
                      <td>
                        {b.buy_url
                          ? <a href={b.buy_url} target="_blank" rel="noopener noreferrer" className="badge badge-amber" onClick={(e) => e.stopPropagation()}>{t('Link', 'رابط')}</a>
                          : <span className="badge badge-gray">{t('No link', 'لا يوجد رابط')}</span>}
                      </td>
                    </>
                  )}
                  <td onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: 6, flexWrap: 'nowrap' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(b)}>{t('Edit', 'تعديل')}</button>
                    <button className="btn btn-ghost btn-sm" style={{ color: '#ef4444' }}
                      disabled={deleteBook.isPending}
                      onClick={() => { if (window.confirm(t('Remove this book?', 'حذف هذا الكتاب؟'))) deleteBook.mutate(b.id) }}>
                      {t('Remove', 'حذف')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail drawer */}
      {open && (
        <div className="drawer-overlay" onClick={() => setOpen(null)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{open.title}</div>
                <span className={`badge ${open.category === 'free' ? 'badge-green' : 'badge-amber'}`} style={{ marginTop: 4 }}>
                  {open.category === 'free' ? t('Free', 'مجاني') : t('Paid', 'مدفوع')}
                </span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setOpen(null)}>✕</button>
            </div>
            <div className="drawer-body">
              {open.cover_image && (
                <img src={open.cover_image} alt="" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8, marginBottom: 16 }} />
              )}
              {open.description && (
                <p style={{ color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 16 }}>{open.description}</p>
              )}
              {open.category === 'free' && open.file_url && (
                <a href={open.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'block', textAlign: 'center' }}>
                  {t('Open / Download', 'فتح / تحميل')}
                </a>
              )}
              {open.category === 'paid' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {open.price && <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--accent)' }}>{open.price}</div>}
                  {open.buy_url && (
                    <a href={open.buy_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ textAlign: 'center' }}>
                      {t('Buy Now', 'شراء الآن')}
                    </a>
                  )}
                </div>
              )}
            </div>
            <div className="drawer-footer">
              <button className="btn btn-ghost" onClick={() => setOpen(null)}>{t('Close', 'إغلاق')}</button>
              <button className="btn btn-primary" onClick={() => openEdit(open)}>{t('Edit', 'تعديل')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      {showForm && (
        <div className="drawer-overlay" onClick={() => { setShowForm(false); setEditing(null) }}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                {editing ? t('Edit Book', 'تعديل الكتاب') : t('Add Book', 'إضافة كتاب')}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => { setShowForm(false); setEditing(null) }}>✕</button>
            </div>
            <div className="drawer-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="field-label">{t('Title *', 'العنوان *')}</label>
                <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="field-label">{t('Description', 'الوصف')}</label>
                <textarea className="input" rows={3} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="field-label">{t('Category', 'التصنيف')}</label>
                <select className="input" value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as Category })}>
                  <option value="free">{t('Free', 'مجاني')}</option>
                  <option value="paid">{t('Paid', 'مدفوع')}</option>
                </select>
              </div>
              <div>
                <label className="field-label">{t('Cover Image URL', 'رابط صورة الغلاف')}</label>
                <input className="input" value={form.cover_image}
                  onChange={(e) => setForm({ ...form, cover_image: e.target.value })} placeholder="https://…" />
              </div>
              {form.category === 'free' ? (
                <div>
                  <label className="field-label">{t('File URL (PDF / link)', 'رابط الملف (PDF / رابط)')}</label>
                  <input className="input" value={form.file_url}
                    onChange={(e) => setForm({ ...form, file_url: e.target.value })} placeholder="https://…" />
                </div>
              ) : (
                <>
                  <div>
                    <label className="field-label">{t('Price', 'السعر')}</label>
                    <input className="input" value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="e.g. 1500 DZD" />
                  </div>
                  <div>
                    <label className="field-label">{t('Buy URL', 'رابط الشراء')}</label>
                    <input className="input" value={form.buy_url}
                      onChange={(e) => setForm({ ...form, buy_url: e.target.value })} placeholder="https://…" />
                  </div>
                </>
              )}
            </div>
            <div className="drawer-footer">
              <button className="btn btn-ghost" onClick={() => { setShowForm(false); setEditing(null) }}>{t('Cancel', 'إلغاء')}</button>
              <button className="btn btn-primary"
                disabled={!form.title.trim() || createBook.isPending || updateBook.isPending}
                onClick={submitForm}>
                {createBook.isPending || updateBook.isPending
                  ? t('Saving…', 'جارٍ الحفظ...')
                  : editing ? t('Save Changes', 'حفظ التغييرات') : t('Add Book', 'إضافة الكتاب')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
