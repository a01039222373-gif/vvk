import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase, isConfigured, CATEGORIES, errorMessage } from './supabase.js'
import ProductList from './components/ProductList.jsx'
import ProductDetail from './components/ProductDetail.jsx'
import ProductForm from './components/ProductForm.jsx'

export default function App() {
  const [products, setProducts] = useState([])
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [selectedCode, setSelectedCode] = useState(null)
  const [showForm, setShowForm] = useState(false)

  // 상품과 상품안내를 한 번에 불러온다 (상품 수가 적어 검색은 화면에서 처리)
  const load = useCallback(async () => {
    if (!isConfigured) return
    setLoading(true)
    const [p, s] = await Promise.all([
      supabase.from('products').select('*, product_infos(*)').order('product_code'),
      supabase.from('shipping_policies').select('*').order('policy_code'),
    ])
    if (p.error || s.error) {
      setError(errorMessage(p.error || s.error))
    } else {
      setError('')
      setProducts(p.data)
      setPolicies(s.data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // 상품 기본 정보와 안내 내용 모두에서 검색
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      if (category && p.category !== category) return false
      if (!q) return true
      const fields = [p.product_code, p.name, p.origin, p.ingredients, p.description]
      const infos = p.product_infos.flatMap((i) => [i.condition, i.content])
      return [...fields, ...infos].some((v) => v && v.toLowerCase().includes(q))
    })
  }, [products, query, category])

  const selected = products.find((p) => p.product_code === selectedCode) || null

  if (!isConfigured) {
    return (
      <main className="setup">
        <h1>상품 관리</h1>
        <p>Supabase 연결 정보가 없습니다.</p>
        <ol>
          <li>
            <code>.env.example</code>을 <code>.env.local</code>로 복사합니다.
          </li>
          <li>
            <code>SUPABASE_URL</code>과 <code>SUPABASE_SERVICE_ROLE_KEY</code>를 채웁니다.
          </li>
          <li>
            개발 서버를 다시 시작합니다 (<code>npm run dev</code>).
          </li>
        </ol>
      </main>
    )
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1>상품 관리</h1>
        <span className="count">{loading ? '불러오는 중…' : `${filtered.length} / ${products.length}개`}</span>
        <button className="primary" onClick={() => setShowForm(true)}>
          + 상품 추가
        </button>
      </header>

      <div className="filters">
        <input
          type="search"
          placeholder="상품코드, 상품명, 원재료, 안내 내용 검색 (예: 견과류, 냉장)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">전체 분류</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button onClick={load} disabled={loading}>
          새로고침
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="layout">
        <ProductList products={filtered} selectedCode={selectedCode} onSelect={setSelectedCode} />
        {selected ? (
          <ProductDetail
            key={selected.product_code}
            product={selected}
            onChanged={load}
            onDeleted={() => {
              setSelectedCode(null)
              load()
            }}
          />
        ) : (
          <section className="detail empty">왼쪽 목록에서 상품을 선택하세요.</section>
        )}
      </div>

      {showForm && (
        <ProductForm
          policies={policies}
          onClose={() => setShowForm(false)}
          onCreated={(code) => {
            setShowForm(false)
            setSelectedCode(code)
            load()
          }}
        />
      )}
    </div>
  )
}
