import { useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { THEMES } from './themes.js'
import { detectThemes, formatWon, generatePlan } from './planner.js'

const EXAMPLES = [
  { concept: '밤에 즐기는 레트로 야시장 축제', place: '대구 근대골목 일대' },
  { concept: '지역 사과로 만드는 가을 수확 축제', place: '대구 팔공산 일원' },
  { concept: '반려동물과 함께하는 친환경 피크닉 축제', place: '수성못 일대' },
]

const EMPTY_FORM = { concept: '', place: '', startDate: '', days: 2, budget: 5000, visitors: 5000, audience: '', extra: '' }

export default function App() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [manualThemes, setManualThemes] = useState(null) // null이면 컨셉에서 자동 선택
  const [result, setResult] = useState(null)
  const [seed, setSeed] = useState(0)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })
  const autoThemes = useMemo(() => detectThemes(form.concept), [form.concept])
  const themes = manualThemes ?? autoThemes

  function toggleTheme(id) {
    const current = themes
    let next
    if (current.includes(id)) next = current.filter((t) => t !== id)
    else next = [...current, id].slice(-2) // 최대 2개, 넘치면 먼저 고른 것을 뺀다
    setManualThemes(next.length ? next : null)
  }

  function run(nextSeed) {
    if (!form.concept.trim()) {
      setError('컨셉을 입력하세요.')
      return
    }
    setError('')
    setCopied(false)
    setSeed(nextSeed)
    setResult(generatePlan({ ...form, themes }, nextSeed))
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(result.markdown)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('복사하지 못했습니다. 직접 선택해서 복사하세요.')
    }
  }

  function download() {
    const blob = new Blob([result.markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.title.replace(/[\\/:*?"<>|]/g, '')} 기획안.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="app">
      <header className="hero">
        <h1>축제 기획안 만들기</h1>
        <p>컨셉과 조건을 적으면 축제 이름, 프로그램, 일정, 예산, 운영 계획까지 담은 기획안 초안을 바로 만들어 드립니다.</p>
      </header>

      <div className="layout">
        <form
          className="panel input"
          onSubmit={(e) => {
            e.preventDefault()
            run(0)
          }}
        >
          <label className="concept">
            축제 컨셉 *
            <textarea
              rows={3}
              value={form.concept}
              onChange={set('concept')}
              placeholder="예: 대구 근대골목을 배경으로 1930년대 분위기를 재현하는 야간 축제"
            />
          </label>
          <div className="examples">
            {EXAMPLES.map((ex) => (
              <button
                type="button"
                key={ex.concept}
                className="chip"
                onClick={() => {
                  setForm({ ...form, ...ex })
                  setManualThemes(null)
                }}
              >
                {ex.concept}
              </button>
            ))}
          </div>

          <div className="themes">
            <span className="label">
              테마 {manualThemes ? '(직접 선택)' : '(컨셉에서 자동 선택)'} · 최대 2개
            </span>
            <div className="theme-list">
              {Object.entries(THEMES).map(([id, t]) => (
                <button
                  type="button"
                  key={id}
                  className={`theme ${themes.includes(id) ? 'on' : ''}`}
                  onClick={() => toggleTheme(id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid">
            <label className="wide">
              장소
              <input value={form.place} onChange={set('place')} placeholder="예: 대구 수성못 일대" />
            </label>
            <label>
              시작일
              <input type="date" value={form.startDate} onChange={set('startDate')} />
            </label>
            <label>
              기간
              <select value={form.days} onChange={set('days')}>
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <option key={d} value={d}>
                    {d}일
                  </option>
                ))}
              </select>
            </label>
            <label>
              총예산 (만 원)
              <input type="number" min="100" step="100" value={form.budget} onChange={set('budget')} />
              <small>{formatWon(Math.max(Number(form.budget) || 0, 0))}</small>
            </label>
            <label>
              하루 방문객 (명)
              <input type="number" min="100" step="100" value={form.visitors} onChange={set('visitors')} />
            </label>
            <label className="wide">
              주요 대상
              <input value={form.audience} onChange={set('audience')} placeholder="예: 20~30대, 가족 단위" />
            </label>
            <label className="wide">
              추가 요청
              <textarea
                rows={2}
                value={form.extra}
                onChange={set('extra')}
                placeholder="예: 지역 소상공인 참여 프로그램을 꼭 넣어 주세요"
              />
            </label>
          </div>

          {error && <p className="error">{error}</p>}

          <div className="actions">
            <button
              type="button"
              onClick={() => {
                setForm(EMPTY_FORM)
                setManualThemes(null)
                setResult(null)
              }}
            >
              초기화
            </button>
            <button className="primary" type="submit">
              기획안 만들기
            </button>
          </div>
        </form>

        <section className="panel output">
          {!result ? (
            <p className="placeholder">컨셉을 입력하고 ‘기획안 만들기’를 누르세요.</p>
          ) : (
            <>
              <div className="toolbar">
                <span className="muted">초안 {seed + 1}번</span>
                <button onClick={() => run(seed + 1)}>다른 안 보기</button>
                <button onClick={copy}>{copied ? '복사됨' : '복사'}</button>
                <button onClick={download}>.md 저장</button>
                <button onClick={() => window.print()}>인쇄</button>
              </div>
              <article className="plan">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.markdown}</ReactMarkdown>
              </article>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
