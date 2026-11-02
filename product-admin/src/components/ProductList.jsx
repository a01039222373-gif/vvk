const won = new Intl.NumberFormat('ko-KR')

export default function ProductList({ products, selectedCode, onSelect }) {
  if (products.length === 0) {
    return <section className="list empty">조건에 맞는 상품이 없습니다.</section>
  }
  return (
    <section className="list">
      <table>
        <thead>
          <tr>
            <th>상품코드</th>
            <th>상품명</th>
            <th>분류</th>
            <th>용량</th>
            <th className="num">판매가</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr
              key={p.product_code}
              className={p.product_code === selectedCode ? 'selected' : ''}
              onClick={() => onSelect(p.product_code)}
            >
              <td className="mono">{p.product_code}</td>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>{p.net_amount}</td>
              <td className="num">{won.format(p.price)}원</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
