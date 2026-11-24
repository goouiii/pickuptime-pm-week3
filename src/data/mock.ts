// 데모용 Mock Data — 실제 매장·결제·푸시와 연결되지 않는다.

/** 데모 기준 현재 시각 (분 단위, 10:41). 화면 간 시각이 어긋나지 않도록 고정한다. */
export const NOW_MIN = 10 * 60 + 41

export type Category = '커피' | '논커피' | '티' | '디저트'
export const CATEGORIES: Category[] = ['커피', '논커피', '티', '디저트']

export interface Store {
  id: string
  name: string
  location: string
  pickupSpot: string
  open: boolean
  closeMin: number
  nextOpen?: string
  waiting: number
  /** 주문 1건당 평균 제조 시간(분) — 산정 방식 확인 필요 */
  avgMin: number
}

export const STORES: Store[] = [
  { id: 'hall', name: '학생회관 카페', location: '학생회관 1층', pickupSpot: '1층 픽업대', open: true, closeMin: 19 * 60, waiting: 3, avgMin: 1.3 },
  { id: 'library', name: '도서관 카페', location: '중앙도서관 B1', pickupSpot: 'B1 픽업대', open: true, closeMin: 22 * 60, waiting: 11, avgMin: 1.05 },
  { id: 'biz', name: '경영관 카페', location: '경영관 2층', pickupSpot: '2층 카운터', open: false, closeMin: 18 * 60, nextOpen: '내일 08:30 오픈', waiting: 0, avgMin: 1.2 },
]

export type OptionKind = 'full' | 'tempOnly' | 'none'

export interface Menu {
  id: string
  storeId: string
  category: Category
  name: string
  price: number
  soldOut?: boolean
  options: OptionKind
}

const base: Omit<Menu, 'storeId' | 'id'>[] = [
  { category: '커피', name: '아메리카노', price: 2000, options: 'full' },
  { category: '커피', name: '카페라떼', price: 2800, options: 'full' },
  { category: '커피', name: '바닐라라떼', price: 3300, options: 'full' },
  { category: '커피', name: '콜드브루', price: 3500, options: 'full', soldOut: true },
  { category: '커피', name: '카페모카', price: 3300, options: 'full' },
  { category: '논커피', name: '초코라떼', price: 3000, options: 'full' },
  { category: '논커피', name: '딸기라떼', price: 3500, options: 'full' },
  { category: '티', name: '캐모마일', price: 2500, options: 'tempOnly' },
  { category: '티', name: '얼그레이', price: 2500, options: 'tempOnly' },
]

export const MENUS: Menu[] = STORES.flatMap((s) =>
  base.map((m, i) => ({ ...m, storeId: s.id, id: `${s.id}-${i}` })),
)

export const SIZE_EXTRA = 500
export const SHOT_EXTRA = 500
export const MAX_QTY = 10
export const MAX_CUPS = 20

export type PayMethod = '카카오페이' | '토스페이' | '신용·체크카드'
export const PAY_METHODS: PayMethod[] = ['카카오페이', '토스페이', '신용·체크카드']

export const fmtWon = (n: number) => `${n.toLocaleString('ko-KR')}원`
export const fmtTime = (min: number) => {
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** F-STORE-01: 예상 소요(분) = 대기 주문 수 × 평균 제조 시간 + 기본 2분, 올림 */
export const storeEtaMin = (s: Store) => Math.ceil(s.waiting * s.avgMin + 2)
export const isBusy = (s: Store) => s.waiting >= 11
