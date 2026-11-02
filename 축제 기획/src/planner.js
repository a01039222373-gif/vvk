import { THEMES, DEFAULT_THEME, AUDIENCE_CHANNELS } from './themes.js'

// 입력값과 테마 템플릿으로 축제 기획안(Markdown)을 만든다. 외부 API 없이 브라우저에서만 계산한다

// 기본 예산 비율(%). 테마의 budgetBias를 더한 뒤 합이 100이 되게 다시 맞춘다
const BUDGET_BASE = {
  '공연·프로그램': 30,
  '시설·부스': 25,
  '홍보·디자인': 15,
  '안전·운영': 15,
  인건비: 10,
  예비비: 5,
}
const BUDGET_NOTES = {
  '공연·프로그램': '출연료, 체험 재료비, 프로그램 진행비',
  '시설·부스': '무대·음향·조명, 텐트·부스, 전기',
  '홍보·디자인': '디자인, 온라인 광고, 인쇄물, 현수막',
  '안전·운영': '안전요원, 보험, 의무실, 이동식 화장실, 청소',
  인건비: '운영 스태프, 자원봉사자 활동비',
  예비비: '우천 대비, 예상 밖 지출',
}
const NAME_SUFFIX = ['축제', '페스타', '페스티벌', '한마당', '위크']
const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']
const PLACE_FILLERS = ['일대', '일원', '인근', '주변', '앞', '광장']

// 같은 입력·같은 번호면 같은 결과가 나오도록 하는 난수
function makeRandom(text, seed) {
  let h = 2166136261 ^ seed
  for (const ch of text) h = Math.imul(h ^ ch.codePointAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}
const pick = (rand, list) => list[Math.floor(rand() * list.length)]
function shuffle(rand, list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// 컨셉 문장에서 테마를 찾는다 (일치하는 단어가 많은 순으로 최대 2개)
export function detectThemes(concept) {
  const text = concept.toLowerCase()
  const scored = Object.entries(THEMES)
    .map(([id, t]) => [id, t.keywords.filter((k) => text.includes(k)).length])
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
  return scored.length ? scored.slice(0, 2) : [DEFAULT_THEME]
}

// 만 원 단위 금액을 읽기 쉬운 문자열로 (예: 12500 → 1억 2,500만 원)
export function formatWon(man) {
  const eok = Math.floor(man / 10000)
  const rest = man % 10000
  if (eok && rest) return `${eok}억 ${rest.toLocaleString('ko-KR')}만 원`
  if (eok) return `${eok}억 원`
  return `${rest.toLocaleString('ko-KR')}만 원`
}

// 시작일이 없으면 오늘 날짜의 계절을 쓴다
function seasonOf(date) {
  const m = (date ?? new Date()).getMonth() + 1
  if (m >= 3 && m <= 5) return '봄'
  if (m >= 6 && m <= 8) return '여름'
  if (m >= 9 && m <= 11) return '가을'
  return '겨울'
}

function shortPlace(place) {
  const words = place.split(/\s+/).filter((w) => w && !PLACE_FILLERS.includes(w))
  return words.length ? words[words.length - 1] : '우리 동네'
}

const fmtDate = (d) => `${d.getMonth() + 1}월 ${d.getDate()}일(${DAY_NAMES[d.getDay()]})`
const table = (head, rows) =>
  [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.join(' | ')} |`)].join('\n')

// 예산 비율 계산: 기본 비율 + 주 테마 가중치 + 보조 테마 가중치의 절반
function budgetRows(total, themeIds) {
  const ratio = { ...BUDGET_BASE }
  themeIds.forEach((id, i) => {
    for (const [k, v] of Object.entries(THEMES[id].budgetBias)) ratio[k] += i === 0 ? v : v / 2
  })
  const sum = Object.values(ratio).reduce((a, b) => a + b, 0)
  const rows = Object.entries(ratio).map(([k, v]) => [k, Math.round((total * v) / sum / 10) * 10])
  // 반올림 차이는 예비비에서 맞춘다
  const diff = total - rows.reduce((a, [, v]) => a + v, 0)
  rows[rows.length - 1][1] += diff
  return rows
}

export function generatePlan(input, seed = 0) {
  const concept = input.concept.trim()
  const rand = makeRandom(concept + input.place, seed)
  const themeIds = input.themes?.length ? input.themes : detectThemes(concept)
  const themes = themeIds.map((id) => THEMES[id])
  const main = themes[0]

  const days = Math.min(Math.max(Number(input.days) || 2, 1), 7)
  const budget = Math.max(Number(input.budget) || 5000, 100)
  const dailyVisitors = Math.max(Number(input.visitors) || 5000, 100)
  const start = input.startDate ? new Date(`${input.startDate}T00:00:00`) : null
  const season = seasonOf(start)
  const place = input.place.trim() || '(가정) 도심 공원 일대'
  const placeName = input.place.trim() ? shortPlace(input.place.trim()) : '우리 동네'
  const audience = input.audience.trim() || '(가정) 지역 주민과 가족 단위 방문객'

  // 축제 이름 후보와 슬로건
  const nameWords = shuffle(rand, themes.flatMap((t) => t.nameWords))
  const suffixes = shuffle(rand, NAME_SUFFIX)
  const names = [0, 1, 2].map((i) => `${placeName} ${nameWords[i % nameWords.length]} ${suffixes[i]}`)
  const slogan = pick(rand, main.slogans).replace('{place}', placeName).replace('{season}', season)

  // 기간
  let period
  if (start) {
    const end = new Date(start)
    end.setDate(end.getDate() + days - 1)
    period = days === 1 ? `${fmtDate(start)}, 1일` : `${fmtDate(start)} ~ ${fmtDate(end)}, ${days}일`
  } else {
    period = `(가정) ${season} 주말 포함 ${days}일`
  }

  // 프로그램: 개막·폐막 + 주 테마 전부 + 보조 테마 2개
  const themePrograms = [
    ...main.programs,
    ...(themes[1] ? shuffle(rand, themes[1].programs).slice(0, 2) : []),
  ]
  const programs = [
    ['개막 세리머니', `"${slogan}"을 주제로 한 오프닝 공연과 점등식`, '저녁', '전 연령'],
    ...themePrograms,
    ['폐막 피날레', '참여 프로그램 시상과 관객이 함께하는 마무리 무대', '저녁', '전 연령'],
  ]

  // 일정표: 낮 프로그램은 낮 시간대에, 저녁 프로그램은 저녁 시간대에 돌아가며 배치
  const isNight = themeIds.includes('night')
  const daySlots = isNight ? ['15:00~17:00', '17:00~19:00'] : ['11:00~13:00', '13:00~15:00', '15:00~17:00']
  const eveSlots = isNight ? ['19:00~20:30', '20:30~22:00'] : ['18:00~19:30', '19:30~21:00']
  const dayProgs = themePrograms.filter((p) => p[2] === '낮').map((p) => p[0])
  const eveProgs = themePrograms.filter((p) => p[2] === '저녁').map((p) => p[0])
  const allDay = themePrograms.filter((p) => p[2] === '종일').map((p) => p[0])
  const scheduleRows = []
  let di = 0
  let ei = 0
  for (let d = 0; d < days; d++) {
    const label = start ? fmtDate(new Date(start.getTime() + d * 86400000)) : `${d + 1}일차`
    daySlots.forEach((slot) => {
      const prog = dayProgs.length ? dayProgs[di++ % dayProgs.length] : '자유 관람·체험'
      scheduleRows.push([label, slot, prog])
    })
    eveSlots.forEach((slot, i) => {
      let prog
      if (d === 0 && i === 0) prog = '개막 세리머니'
      else if (d === days - 1 && i === eveSlots.length - 1) prog = '폐막 피날레'
      else prog = eveProgs.length ? eveProgs[ei++ % eveProgs.length] : '자유 관람'
      scheduleRows.push([label, slot, prog])
    })
  }

  // 운영 규모: 동시 체류 인원을 하루 방문객의 40%로 보고 계산
  const peak = Math.ceil(dailyVisitors * 0.4)
  const safety = Math.max(Math.ceil(peak / 100), 4)
  const guides = Math.max(Math.ceil(peak / 300), 3)
  const staff = Math.max(Math.ceil(programs.length * 2), 6)
  const volunteers = Math.max(Math.ceil(dailyVisitors / 250), 10)
  const toilets = Math.max(Math.ceil(peak / 100), 4)

  // 홍보 채널: 주요 대상에 맞는 채널 + 공통 채널
  const aud = audience.toLowerCase()
  const targetChannels = AUDIENCE_CHANNELS.filter((c) => c.match.some((m) => aud.includes(m))).flatMap((c) => c.channels)

  // 위험 요소: 계절·공통·테마별
  const weatherRisk =
    season === '여름'
      ? ['폭염·소나기', '그늘막·쿨링포그·급수대 설치, 낮 시간 야외 프로그램 축소, 우천 시 실내 대체 장소 확보']
      : season === '겨울'
        ? ['한파·강설', '난방 쉼터 운영, 결빙 구간 제설·미끄럼 방지, 야외 프로그램 시간 단축']
        : ['우천', '대형 천막과 실내 대체 장소 확보, 기상특보 시 프로그램 축소 기준 사전 결정']
  const risks = [
    weatherRisk,
    ['인파 밀집', `시간대별 입장 인원 모니터링(동시 ${peak.toLocaleString('ko-KR')}명 기준), 일방통행 동선, 밀집 구역 안전요원 추가 배치`],
    ['주차·교통 혼잡', '임시 주차장과 셔틀버스 운영, 대중교통 이용 안내, 주변 도로 교통 통제 협의'],
    ...themes.flatMap((t) => t.risks),
  ]

  const budgets = budgetRows(budget, themeIds)
  const totalVisitors = dailyVisitors * days
  const extra = input.extra.trim()

  const md = [
    `# ${names[0]}`,
    `> ${slogan}`,
    '',
    `이름 후보: ${names.join(' / ')}`,
    '',
    '## 1. 기획 개요',
    table(
      ['항목', '내용'],
      [
        ['축제 이름', names[0]],
        ['기간', period],
        ['장소', place],
        ['주요 대상', audience],
        ['예상 방문객', `하루 ${dailyVisitors.toLocaleString('ko-KR')}명, 총 ${totalVisitors.toLocaleString('ko-KR')}명`],
        ['총예산', formatWon(budget)],
        ['주최·주관', '(가정) ○○시 / ○○축제추진위원회'],
        ['테마', themes.map((t) => t.label).join(', ')],
      ],
    ),
    '',
    '## 2. 기획 의도와 컨셉',
    `- **컨셉**: ${concept}`,
    `- **방향**: ${themes.map((t) => t.label).join('과 ')}을 중심으로, ${placeName}을 찾은 사람들이 "${slogan}"을 직접 느낄 수 있는 체류형 축제를 만든다.`,
    `- **대상에 맞춘 설계**: ${audience}이(가) 머무는 시간을 늘리도록 낮에는 체험, 저녁에는 공연·야간 프로그램을 배치한다.`,
    '- **지역과 함께**: 지역 상인·단체·주민이 프로그램과 부스 운영에 직접 참여해 축제 효과가 지역에 남게 한다.',
    ...(extra ? [`- **추가 요청 반영**: ${extra}`] : []),
    '',
    '## 3. 주요 프로그램',
    table(['프로그램', '내용', '시간대', '대상'], programs),
    '',
    '## 4. 일정표',
    table(['날짜', '시간', '프로그램'], scheduleRows),
    '',
    ...(allDay.length ? [`상시 운영: ${allDay.join(', ')}`, ''] : []),
    '## 5. 공간 구성',
    table(
      ['구역', '내용'],
      [
        ['입구·종합안내소', '안내 지도 배포, 분실물·미아 접수, 다국어 안내'],
        ...themes.flatMap((t) => t.zones).map((z) => [z, '테마 프로그램 운영 구역']),
        ['휴게·그늘 쉼터', '벤치·그늘막, 휴대폰 충전'],
        ['의무실', '응급처치 인력 상주, 구급차 대기 위치 확보'],
        ['이동식 화장실', `(가정) ${toilets}동 (동시 체류 100명당 1동 기준)`],
        ['분리수거장', '구역별 분리배출함, 다회용기 반납'],
      ],
    ),
    '',
    '## 6. 홍보 계획',
    '**사전 (D-30 ~ D-1)**',
    '- 축제 이름·슬로건으로 대표 포스터와 SNS 게시물 제작',
    '- 프로그램 사전 신청 페이지 오픈과 얼리버드 이벤트',
    ...targetChannels.map((c) => `- ${c}`),
    '- 지역 언론 보도자료 배포 (D-14, D-3)',
    '',
    '**현장**',
    `- 대표 포토존과 해시태그 이벤트 (#${names[0].replace(/\s+/g, '')})`,
    '- 프로그램 참여 스탬프 투어, 완성 시 기념품 증정',
    '',
    '**사후**',
    '- 방문객 후기 이벤트와 하이라이트 영상 공개',
    '- 만족도 조사 결과를 담은 결과 보고서 공유',
    '',
    '## 7. 예산안',
    table(
      ['항목', '금액', '비율', '주요 내용'],
      [
        ...budgets.map(([k, v]) => [k, formatWon(v), `${((v / budget) * 100).toFixed(1)}%`, BUDGET_NOTES[k]]),
        ['**합계**', `**${formatWon(budget)}**`, '**100%**', ''],
      ],
    ),
    '',
    '## 8. 운영 계획',
    table(
      ['구분', '인원(일)', '역할'],
      [
        ['운영 스태프', `${staff}명`, '프로그램 진행, 부스 관리'],
        ['안전요원', `${safety}명`, '동선 관리, 밀집 구역 통제 (동시 체류 100명당 1명)'],
        ['안내요원', `${guides}명`, '종합안내소, 길 안내'],
        ['자원봉사자', `${volunteers}명`, '안내 보조, 분리수거, 설문 조사'],
        ['의료 인력', '2명', '의무실 상주 (간호사 1, 응급구조사 1)'],
      ],
    ),
    '',
    '- 매일 시작 1시간 전 전체 브리핑, 종료 후 정리 회의',
    '- 무전기 채널을 운영·안전·의료로 나눠 운영',
    '- 행사 배상책임보험 가입',
    '',
    '## 9. 위험 요소와 대응',
    table(['위험 요소', '대응'], risks),
    '',
    '## 10. 기대 효과와 성과 지표',
    table(
      ['지표', '목표'],
      [
        ['총 방문객', `${totalVisitors.toLocaleString('ko-KR')}명`],
        ['방문객 만족도', '5점 만점에 4.0점 이상'],
        ['재방문 의향', '70% 이상'],
        ['SNS 해시태그 게시물', `${Math.round(totalVisitors * 0.02).toLocaleString('ko-KR')}건`],
        ['주변 상권 매출', '축제 기간 평시 대비 10% 증가'],
      ],
    ),
    '',
    '---',
    '_이 기획안은 입력한 조건과 테마 템플릿으로 자동 작성한 초안입니다. (가정)이라고 표시된 부분과 인원·예산 수치는 실제 상황에 맞게 고쳐 주세요._',
  ]
  return { markdown: md.join('\n'), themeIds, title: names[0] }
}
