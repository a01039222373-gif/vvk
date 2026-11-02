import { useState } from 'react'
import { supabase, CATEGORIES, errorMessage } from '../supabase.js'

// 입력란 정의: [필드, 라벨, 안내 문구]
const TEXT_FIELDS = [
  ['origin', '원산지', '예: 경북 성주 (모르면 미기재)'],
  ['ingredients', '원재료', '예: 사과 100%'],
  ['net_amount', '용량', '예: 500g'],
  ['pack_info', '구성', '예: 10개 (없으면 비움)'],
  ['sale_period', '판매기간', '예: 상시, 4~7월'],
]

export default function ProductForm({ policies, onClose, onCreated }) {
  const [form, setForm] = useState({
    product_code: '',
    name: '',
    category: CATEGORIES[0],
    origin: '',
    ingredients: '',
    net_amount: '',
    pack_info: '',
    price: '',
    sale_period: '상시',
    description: '',
    shipping_policy: policies[0]?.policy_code || '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  // DB 제약과 같은 규칙을 먼저 화면에서 확인한다
  function validate() {
    if (!/^P-[0-9]{4}$/.test(form.product_code.trim())) return '상품코드는 P-0000 형식이어야 합니다.'
    if (!form.name.trim()) return '상품명을 입력하세요.'
    if (!/^[0-9]+$/.test(form.price.trim())) return '판매가는 0 이상의 정수로 입력하세요.'
    return ''
  }

  async function submit(e) {
    e.preventDefault()
    const message = validate()
    if (message) {
      setError(message)
      return
    }
    // 빈 문자열은 null로 저장
    const row = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, typeof v === 'string' ? v.trim() || null : v]),
    )
    row.price = Number(form.price)
    row.sale_period = row.sale_period || '상시'

    setBusy(true)
    setError('')
    const { error } = await supabase.from('products').insert(row)
    setBusy(false)
    if (error) setError(errorMessage(error))
    else onCreated(row.product_code)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onSubmit={submit} onClick={(e) => e.stopPropagation()}>
        <h2>상품 추가</h2>
        <p className="muted">상품안내(보관·알레르기 등)는 상품을 만든 뒤 상세 화면에서 추가합니다.</p>

        <div className="grid">
          <label>
            상품코드 *
            <input value={form.product_code} onChange={set('product_code')} placeholder="P-0000" autoFocus />
          </label>
          <label>
            상품명 *
            <input value={form.name} onChange={set('name')} />
          </label>
          <label>
            분류 *
            <select value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            판매가(원) *
            <input value={form.price} onChange={set('price')} inputMode="numeric" placeholder="예: 9900" />
          </label>
          {TEXT_FIELDS.map(([field, label, placeholder]) => (
            <label key={field}>
              {label}
              <input value={form[field]} onChange={set(field)} placeholder={placeholder} />
            </label>
          ))}
          <label>
            배송정책
            <select value={form.shipping_policy} onChange={set('shipping_policy')}>
              <option value="">없음</option>
              {policies.map((p) => (
                <option key={p.policy_code} value={p.policy_code}>
                  {p.policy_code}
                </option>
              ))}
            </select>
          </label>
          <label className="wide">
            상품설명
            <textarea rows={3} value={form.description} onChange={set('description')} />
          </label>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="actions">
          <button type="button" onClick={onClose}>
            취소
          </button>
          <button className="primary" type="submit" disabled={busy}>
            {busy ? '저장 중…' : '저장'}
          </button>
        </div>
      </form>
    </div>
  )
}
