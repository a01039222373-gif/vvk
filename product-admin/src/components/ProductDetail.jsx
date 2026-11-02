import { useState } from 'react'
import { supabase, INFO_TYPES, errorMessage } from '../supabase.js'

const won = new Intl.NumberFormat('ko-KR')
const EMPTY_INFO = { info_type: INFO_TYPES[0], condition: '', content: '' }

export default function ProductDetail({ product, onChanged, onDeleted }) {
  const [info, setInfo] = useState(EMPTY_INFO)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const infos = product.product_infos
  // 안내유형 순서대로 묶어서 보여준다
  const groups = INFO_TYPES.map((type) => ({
    type,
    rows: infos.filter((i) => i.info_type === type).sort((a, b) => a.id - b.id),
  })).filter((g) => g.rows.length > 0)

  async function run(action) {
    setBusy(true)
    setError('')
    const { error } = await action()
    setBusy(false)
    if (error) {
      setError(errorMessage(error))
      return false
    }
    return true
  }

  async function deleteProduct() {
    const msg = `${product.product_code} ${product.name} 상품을 삭제할까요?\n상품안내 ${infos.length}건도 함께 삭제되며 되돌릴 수 없습니다.`
    if (!window.confirm(msg)) return
    const ok = await run(() => supabase.from('products').delete().eq('product_code', product.product_code))
    if (ok) onDeleted()
  }

  async function addInfo(e) {
    e.preventDefault()
    if (!info.content.trim()) {
      setError('안내 내용을 입력하세요.')
      return
    }
    const row = {
      product_code: product.product_code,
      info_type: info.info_type,
      condition: info.condition.trim() || null,
      content: info.content.trim(),
    }
    const ok = await run(() => supabase.from('product_infos').insert(row))
    if (ok) {
      setInfo({ ...EMPTY_INFO, info_type: info.info_type })
      onChanged()
    }
  }

  async function deleteInfo(row) {
    if (!window.confirm(`[${row.info_type}] ${row.content}\n이 안내를 삭제할까요?`)) return
    const ok = await run(() => supabase.from('product_infos').delete().eq('id', row.id))
    if (ok) onChanged()
  }

  return (
    <section className="detail">
      <div className="detail-head">
        <div>
          <span className="mono muted">{product.product_code}</span>
          <h2>{product.name}</h2>
        </div>
        <button className="danger" onClick={deleteProduct} disabled={busy}>
          상품 삭제
        </button>
      </div>

      <dl className="fields">
        <dt>분류</dt>
        <dd>{product.category}</dd>
        <dt>원산지</dt>
        <dd>{product.origin || '—'}</dd>
        <dt>원재료</dt>
        <dd>{product.ingredients || '—'}</dd>
        <dt>용량 · 구성</dt>
        <dd>{[product.net_amount, product.pack_info].filter(Boolean).join(' · ') || '—'}</dd>
        <dt>판매가</dt>
        <dd>{won.format(product.price)}원</dd>
        <dt>판매기간</dt>
        <dd>{product.sale_period}</dd>
        <dt>배송정책</dt>
        <dd>{product.shipping_policy || '—'}</dd>
        <dt>상품설명</dt>
        <dd>{product.description || '—'}</dd>
      </dl>

      <h3>상품안내 ({infos.length}건)</h3>
      {groups.length === 0 && <p className="muted">등록된 안내가 없습니다.</p>}
      {groups.map((g) => (
        <div key={g.type} className="info-group">
          <h4 className={`tag tag-${g.type}`}>{g.type}</h4>
          <ul>
            {g.rows.map((row) => (
              <li key={row.id}>
                {row.condition && <span className="cond">{row.condition}</span>}
                <span className="content">{row.content}</span>
                <button className="link" onClick={() => deleteInfo(row)} disabled={busy} title="안내 삭제">
                  삭제
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <form className="info-form" onSubmit={addInfo}>
        <h4>안내 추가</h4>
        <div className="row">
          <select value={info.info_type} onChange={(e) => setInfo({ ...info, info_type: e.target.value })}>
            {INFO_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <input
            placeholder="조건 (예: 개봉 후, 냉장, 교차오염)"
            value={info.condition}
            onChange={(e) => setInfo({ ...info, condition: e.target.value })}
          />
        </div>
        <div className="row">
          <input
            className="grow"
            placeholder="내용 (금지는 '무엇 금지 — 이유' 형식)"
            value={info.content}
            onChange={(e) => setInfo({ ...info, content: e.target.value })}
          />
          <button className="primary" type="submit" disabled={busy}>
            추가
          </button>
        </div>
      </form>

      {error && <p className="error">{error}</p>}
    </section>
  )
}
