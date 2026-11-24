/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from 'react'
import { MENUS, NOW_MIN, STORES, MAX_CUPS, SIZE_EXTRA, SHOT_EXTRA, storeEtaMin, type PayMethod } from '../data/mock'

export type ScreenId =
  | 'SC-AUTH-01' | 'SC-AUTH-02' | 'SC-HOME-01' | 'SC-MENU-01' | 'SC-MENU-02'
  | 'SC-ORDER-01' | 'SC-ORDER-02' | 'SC-ORDER-03' | 'SC-STATUS-01' | 'SC-HIST-01' | 'SC-MY-01'

export interface Opts { temp: 'HOT' | 'ICE'; size: '레귤러' | '라지'; shot: boolean }
export interface CartItem { key: string; menuId: string; opts: Opts; qty: number }
export type Stage = 0 | 1 | 2 | 3 // 접수 · 제조 중 · 픽업 대기 · 픽업 완료
export const STAGES = ['접수', '제조 중', '픽업 대기', '픽업 완료'] as const

export interface Order {
  no: string
  storeId: string
  items: CartItem[]
  total: number
  pickupMin: number
  stage: Stage
  rejected?: boolean
  canceled?: boolean
  placedAt: string
}

export type Perm = 'undecided' | 'granted' | 'denied'

export interface DemoState {
  loggedIn: boolean
  perm: Perm
  notifOn: boolean
  storeId: string
  category: string
  cart: CartItem[]
  pickup: number | 'asap'
  pay: PayMethod
  sheetMenuId: string | null
  draft: { opts: Opts; qty: number }
  active: Order | null
  history: Order[]
  toast: string | null
  push: string | null
  osDialog: boolean
  confirm: null | 'cancelOrder' | 'clearCart'
  pendingStore: string | null
  loginFailNext: boolean
  loading: boolean
  seq: number
}

export const defaultOpts: Opts = { temp: 'ICE', size: '레귤러', shot: false }
export const optKey = (menuId: string, o: Opts) => `${menuId}|${o.temp}|${o.size}|${o.shot ? 1 : 0}`

export const menuById = (id: string) => MENUS.find((m) => m.id === id)!
export const storeById = (id: string) => STORES.find((s) => s.id === id)!

export const unitPrice = (menuId: string, o: Opts) => {
  const m = menuById(menuId)
  if (m.options !== 'full') return m.price
  return m.price + (o.size === '라지' ? SIZE_EXTRA : 0) + (o.shot ? SHOT_EXTRA : 0)
}
export const cartCups = (c: CartItem[]) => c.reduce((a, i) => a + i.qty, 0)
export const cartTotal = (c: CartItem[]) => c.reduce((a, i) => a + unitPrice(i.menuId, i.opts) * i.qty, 0)
/** 주문 예상 픽업 시각 = 현재 + 매장 예상 소요 + 잔당 1분 (F-CART-02, F-ORDER-01) */
export const orderEtaMin = (storeId: string, cart: CartItem[]) => NOW_MIN + storeEtaMin(storeById(storeId)) + cartCups(cart)
export const optLabel = (menuId: string, o: Opts) => {
  const m = menuById(menuId)
  if (m.options === 'none') return '기본'
  if (m.options === 'tempOnly') return o.temp
  return [o.temp, o.size, o.shot ? '샷 추가' : null].filter(Boolean).join(' · ')
}

const item = (menuId: string, qty = 1, opts: Opts = defaultOpts): CartItem => ({ key: optKey(menuId, opts), menuId, opts, qty })

export const pastOrders: Order[] = [
  { no: 'A-12', storeId: 'hall', items: [item('hall-1'), item('hall-0')], total: 4800, pickupMin: 9 * 60 + 52, stage: 3, placedAt: '11.21 (금) 09:44' },
  { no: 'B-08', storeId: 'library', items: [item('library-2', 1, { temp: 'HOT', size: '라지', shot: false })], total: 3800, pickupMin: 14 * 60 + 10, stage: 3, placedAt: '11.19 (수) 13:58' },
]

export const initialState = (): DemoState => ({
  loggedIn: false,
  perm: 'undecided',
  notifOn: true,
  storeId: 'hall',
  category: '커피',
  cart: [],
  pickup: 'asap',
  pay: '카카오페이',
  sheetMenuId: null,
  draft: { opts: defaultOpts, qty: 1 },
  active: null,
  history: pastOrders,
  toast: null,
  push: null,
  osDialog: false,
  confirm: null,
  pendingStore: null,
  loginFailNext: false,
  loading: false,
  seq: 27,
})

const sampleCart = () => [item('hall-1'), item('hall-0')]
const sampleOrder = (stage: Stage = 1): Order => ({
  no: 'A-27', storeId: 'hall', items: sampleCart(), total: 4800, pickupMin: NOW_MIN + 8, stage, placedAt: '오늘 10:41',
})

/** 화면 직접 진입·문서 미리보기에 필요한 목업 초기 상태 */
export function seedFor(id: ScreenId): DemoState {
  const s = initialState()
  if (id === 'SC-AUTH-01') return s
  const logged: DemoState = { ...s, loggedIn: true, perm: 'granted' }
  switch (id) {
    case 'SC-AUTH-02': return { ...s, loggedIn: true }
    case 'SC-HOME-01': return { ...logged, active: sampleOrder(1) }
    case 'SC-MENU-01': return { ...logged, cart: sampleCart() }
    case 'SC-MENU-02': return { ...logged, sheetMenuId: 'hall-1' }
    case 'SC-ORDER-01': case 'SC-ORDER-02': case 'SC-ORDER-03': return { ...logged, cart: sampleCart() }
    case 'SC-STATUS-01': return { ...logged, active: sampleOrder(1) }
    default: return logged
  }
}

/** 이동 중 필요한 데이터가 없을 때만 보충 (예: 주문 없이 주문 상태 진입) */
export function ensure(id: ScreenId, s: DemoState): DemoState | null {
  if (id !== 'SC-AUTH-01' && !s.loggedIn) return { ...seedFor(id), history: s.history }
  if (id === 'SC-MENU-02' && !s.sheetMenuId) return { ...s, sheetMenuId: `${s.storeId}-1`, draft: { opts: defaultOpts, qty: 1 } }
  if (id === 'SC-STATUS-01' && !s.active) return { ...s, active: sampleOrder(0) }
  if ((id === 'SC-ORDER-02' || id === 'SC-ORDER-03') && s.cart.length === 0) return { ...s, cart: sampleCart(), storeId: 'hall' }
  return null
}

export type Action =
  | { type: 'set'; patch: Partial<DemoState> }
  | { type: 'replace'; state: DemoState }
  | { type: 'openSheet'; menuId: string }
  | { type: 'addToCart' }
  | { type: 'changeQty'; key: string; delta: number }
  | { type: 'placeOrder' }
  | { type: 'advance'; to: Stage }
  | { type: 'reject' }
  | { type: 'cancelOrder' }
  | { type: 'reorder'; no: string }
  | { type: 'archive' }

export function reducer(s: DemoState, a: Action): DemoState {
  switch (a.type) {
    case 'set': return { ...s, ...a.patch }
    case 'replace': return a.state
    case 'openSheet': return { ...s, sheetMenuId: a.menuId, draft: { opts: defaultOpts, qty: 1 } }
    case 'addToCart': {
      if (!s.sheetMenuId) return s
      if (cartCups(s.cart) + s.draft.qty > MAX_CUPS) return { ...s, toast: `한 번에 최대 ${MAX_CUPS}잔까지 주문할 수 있어요` }
      const key = optKey(s.sheetMenuId, s.draft.opts)
      const exists = s.cart.find((i) => i.key === key)
      const cart = exists
        ? s.cart.map((i) => (i.key === key ? { ...i, qty: i.qty + s.draft.qty } : i))
        : [...s.cart, { key, menuId: s.sheetMenuId, opts: s.draft.opts, qty: s.draft.qty }]
      return { ...s, cart, sheetMenuId: null, toast: '장바구니에 담았어요' }
    }
    case 'changeQty': {
      const cart = s.cart
        .map((i) => (i.key === a.key ? { ...i, qty: Math.min(i.qty + a.delta, 10) } : i))
        .filter((i) => i.qty > 0)
      return { ...s, cart }
    }
    case 'placeOrder': {
      const eta = orderEtaMin(s.storeId, s.cart)
      const pickupMin = s.pickup === 'asap' ? eta : s.pickup
      const order: Order = {
        no: `A-${s.seq}`, storeId: s.storeId, items: s.cart, total: cartTotal(s.cart), pickupMin, stage: 0, placedAt: `오늘 ${String(Math.floor(NOW_MIN / 60)).padStart(2, '0')}:${String(NOW_MIN % 60).padStart(2, '0')}`,
      }
      const prev = s.active ? [s.active] : []
      return { ...s, active: order, history: [...prev, ...s.history], cart: [], pickup: 'asap', seq: s.seq + 1, toast: null }
    }
    case 'advance': {
      if (!s.active) return s
      const active = { ...s.active, stage: a.to }
      const push = a.to === 2 && s.perm === 'granted' && s.notifOn
        ? `음료가 준비됐어요 · ${active.no} · ${storeById(active.storeId).location} 픽업대`
        : null
      if (a.to === 3) return { ...s, active, push: null, toast: '픽업 완료! 맛있게 드세요' }
      return { ...s, active, push: push ?? s.push }
    }
    case 'reject': {
      if (!s.active) return s
      const done = { ...s.active, rejected: true }
      return { ...s, active: null, history: [done, ...s.history], toast: '매장 사정으로 주문이 거절되어 자동 환불됐어요' }
    }
    case 'cancelOrder': {
      if (!s.active) return s
      if (s.active.stage !== 0) return { ...s, confirm: null, toast: '이미 제조가 시작되어 취소할 수 없어요' }
      const done = { ...s.active, canceled: true }
      return { ...s, active: null, confirm: null, history: [done, ...s.history], toast: '주문을 취소했어요. 결제 금액은 환불돼요' }
    }
    case 'archive':
      return s.active?.stage === 3 ? { ...s, active: null, history: [s.active, ...s.history] } : s
    case 'reorder': {
      const o = s.history.find((h) => h.no === a.no)
      if (!o) return s
      const st = storeById(o.storeId)
      if (!st.open) return { ...s, toast: `${st.name}은 지금 영업 중이 아니에요` }
      const ok = o.items.filter((i) => !menuById(i.menuId).soldOut)
      const dropped = o.items.length - ok.length
      return { ...s, storeId: o.storeId, cart: ok, pickup: 'asap', toast: dropped ? `품절된 메뉴 ${dropped}개는 빼고 담았어요` : '같은 메뉴로 다시 담았어요' }
    }
  }
}

export interface DemoApi {
  s: DemoState
  dispatch: (a: Action) => void
  go: (id: ScreenId) => void
  readonly: boolean
}

export const DemoCtx = createContext<DemoApi | null>(null)
export const useDemo = () => {
  const v = useContext(DemoCtx)
  if (!v) throw new Error('DemoCtx missing')
  return v
}
