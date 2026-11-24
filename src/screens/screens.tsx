import { useEffect, type ReactNode } from 'react'
import { ChevronRight, Bell, MapPin } from 'lucide-react'
import {
  CATEGORIES, MAX_QTY, MENUS, NOW_MIN, PAY_METHODS, STORES, fmtTime, fmtWon, isBusy, storeEtaMin,
} from '../data/mock'
import {
  STAGES, cartCups, cartTotal, menuById, optLabel, orderEtaMin, storeById, unitPrice, useDemo,
  type ScreenId, type Opts,
} from '../demo/state'
import {
  Badge, Body, Cta, Dialog, Header, Push, Segment, Sheet, StatusBar, Stepper, Tabs, Thumb, Toast,
} from './ui'

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-white text-neutral-900">
      {children}
      <Toast />
      <Push />
    </div>
  )
}

/* SC-AUTH-01 로그인 */
function Login() {
  const { s, dispatch, go, readonly } = useDemo()
  useEffect(() => {
    if (!s.loading || readonly) return
    const t = setTimeout(() => {
      if (s.loginFailNext) {
        dispatch({ type: 'set', patch: { loading: false, loginFailNext: false, toast: '로그인하지 못했어요. 다시 시도해 주세요' } })
        return
      }
      dispatch({ type: 'set', patch: { loading: false, loggedIn: true } })
      go(s.perm === 'undecided' ? 'SC-AUTH-02' : 'SC-HOME-01')
    }, 700)
    return () => clearTimeout(t)
  }, [s.loading, s.loginFailNext, s.perm, readonly, dispatch, go])
  return (
    <Shell>
      <StatusBar />
      <div className="flex flex-1 flex-col justify-center px-8" data-anno="01">
        <div className="mb-5 grid size-16 place-items-center rounded-2xl bg-neutral-900 text-3xl">☕</div>
        <p className="text-[28px] font-extrabold leading-tight">픽업타임</p>
        <p className="mt-2 text-[15px] leading-relaxed text-neutral-500">쉬는 시간 전에 미리 주문하고<br />줄 없이 받아가세요</p>
      </div>
      <div className="px-5 pb-6">
        <button
          type="button"
          data-anno="02"
          disabled={s.loading}
          onClick={() => dispatch({ type: 'set', patch: { loading: true, toast: null } })}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] text-[15px] font-bold text-black/85 disabled:opacity-60"
        >
          {s.loading ? '로그인 중…' : '카카오로 시작하기'}
        </button>
        <p data-anno="03" className="mt-3 text-center text-[11px] leading-relaxed text-neutral-400">
          시작하면 <u>이용약관</u>과 <u>개인정보처리방침</u>에 동의한 것으로 봐요
        </p>
      </div>
    </Shell>
  )
}

/* SC-AUTH-02 알림 권한 안내 */
function Permission() {
  const { s, dispatch, go } = useDemo()
  const decide = (perm: 'granted' | 'denied') => {
    dispatch({ type: 'set', patch: { perm, osDialog: false, toast: perm === 'denied' ? '마이 > 알림 설정에서 언제든 켤 수 있어요' : null } })
    go('SC-HOME-01')
  }
  return (
    <Shell>
      <StatusBar />
      <div className="flex flex-1 flex-col justify-center px-8" data-anno="01">
        <div className="mb-5 grid size-16 place-items-center rounded-2xl bg-neutral-100"><Bell size={30} /></div>
        <p className="text-[22px] font-extrabold leading-snug">음료가 준비되면<br />바로 알려드릴게요</p>
        <p className="mt-3 text-[14px] leading-relaxed text-neutral-500">알림을 끄면 주문 상태 화면을 직접 확인해야 해요. 쉬는 시간이 짧을수록 알림이 편해요.</p>
      </div>
      <div className="flex flex-col gap-2 px-5 pb-6">
        <Cta anno="02" onClick={() => dispatch({ type: 'set', patch: { osDialog: true } })}>알림 허용</Cta>
        <button type="button" data-anno="03" onClick={() => go('SC-HOME-01')} className="h-11 text-[14px] text-neutral-500">나중에</button>
      </div>
      {s.osDialog && (
        <Dialog
          title="‘픽업타임’에서 알림을 보내려고 해요"
          body="OS 권한 요청 화면을 데모로 재현했어요"
          cancel="허용 안 함"
          ok="허용"
          onCancel={() => decide('denied')}
          onOk={() => decide('granted')}
        />
      )}
    </Shell>
  )
}

/* SC-HOME-01 홈 */
function HomeScreen() {
  const { s, dispatch, go } = useDemo()
  const pick = (id: string) => {
    if (s.cart.length && s.storeId !== id) {
      dispatch({ type: 'set', patch: { confirm: 'clearCart', pendingStore: id } })
      return
    }
    dispatch({ type: 'set', patch: { storeId: id, category: '커피' } })
    go('SC-MENU-01')
  }
  return (
    <Shell>
      <StatusBar />
      <Header title="픽업타임" />
      <Body className="flex flex-col gap-3">
        {s.active && s.active.stage < 3 && (
          <button type="button" data-anno="01" onClick={() => go('SC-STATUS-01')} className="flex items-center justify-between rounded-xl bg-neutral-900 px-4 py-3 text-left text-white">
            <span>
              <span className="block text-[11px] text-white/60">진행 중인 주문</span>
              <span className="block text-[14px] font-bold">{s.active.no} · {STAGES[s.active.stage]} · {fmtTime(s.active.pickupMin)} 픽업 예정</span>
            </span>
            <ChevronRight size={18} />
          </button>
        )}
        <p className="mt-1 text-[17px] font-bold">어디서 받을까요?</p>
        {STORES.map((st) => {
          const eta = storeEtaMin(st)
          return (
            <button
              key={st.id}
              type="button"
              data-anno="02"
              disabled={!st.open}
              onClick={() => pick(st.id)}
              className="rounded-xl border border-neutral-300 p-4 text-left disabled:opacity-45"
            >
              <span className="flex items-center justify-between">
                <span className="text-[15px] font-bold">
                  {st.name}
                  {st.open ? (isBusy(st) ? <Badge tone="warn">혼잡</Badge> : <Badge tone="fill">영업 중</Badge>) : <Badge>영업 종료</Badge>}
                </span>
                {st.open && <ChevronRight size={16} className="text-neutral-400" />}
              </span>
              <span className="mt-0.5 block text-[12px] text-neutral-500">{st.location}</span>
              {st.open ? (
                <>
                  <span className="mt-2 block text-[20px] font-extrabold">약 {eta}분 후 픽업</span>
                  <span className="block text-[12px] text-neutral-500">대기 주문 {st.waiting}건 · {fmtTime(NOW_MIN + eta)} 수령 예상</span>
                </>
              ) : (
                <span className="mt-1 block text-[12px] text-neutral-500">{st.nextOpen}</span>
              )}
            </button>
          )
        })}
      </Body>
      <Tabs current="home" anno="03" />
      {s.confirm === 'clearCart' && (
        <Dialog
          title="장바구니를 비울까요?"
          body={`${storeById(s.storeId).name} 메뉴가 담겨 있어요. 한 번에 한 매장만 주문할 수 있어요.`}
          cancel="취소"
          ok="비우고 이동"
          onCancel={() => dispatch({ type: 'set', patch: { confirm: null, pendingStore: null } })}
          onOk={() => {
            dispatch({ type: 'set', patch: { confirm: null, cart: [], storeId: s.pendingStore!, pendingStore: null, category: '커피' } })
            go('SC-MENU-01')
          }}
        />
      )}
    </Shell>
  )
}

/* SC-MENU-01 메뉴 목록 (+ SC-MENU-02 시트) */
function MenuList({ withSheet }: { withSheet?: boolean }) {
  const { s, dispatch, go } = useDemo()
  const st = storeById(s.storeId)
  const list = MENUS.filter((m) => m.storeId === s.storeId && m.category === s.category)
  const cups = cartCups(s.cart)
  return (
    <Shell>
      <StatusBar />
      <Header title={st.name} back={() => go('SC-HOME-01')} />
      <div className="shrink-0 space-y-3 px-4 pt-3">
        <div data-anno="01" className="rounded-xl border border-dashed border-neutral-400 bg-neutral-50 px-4 py-2.5 text-[14px] font-bold">
          지금 주문하면 약 {storeEtaMin(st)}분 후 픽업
        </div>
        <div data-anno="02" role="tablist" aria-label="카테고리" className="flex gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={s.category === c}
              onClick={() => dispatch({ type: 'set', patch: { category: c } })}
              className={`rounded-full border px-3.5 py-1.5 text-[12px] ${s.category === c ? 'border-neutral-900 bg-neutral-900 font-semibold text-white' : 'border-neutral-300 text-neutral-600'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <Body className="pt-1">
        {list.length === 0 && <p className="py-16 text-center text-[13px] text-neutral-400">준비 중인 메뉴가 없어요</p>}
        {list.map((m) => (
          <button
            key={m.id}
            type="button"
            data-anno="03"
            disabled={m.soldOut}
            onClick={() => { dispatch({ type: 'openSheet', menuId: m.id }); go('SC-MENU-02') }}
            className="flex w-full items-center gap-3 border-b border-neutral-100 py-2.5 text-left disabled:opacity-40"
          >
            <Thumb />
            <span className="flex-1">
              <span className="block text-[14px] font-bold">{m.name}{m.soldOut && <Badge>품절</Badge>}</span>
              <span className="block text-[12px] text-neutral-500">{fmtWon(m.price)}</span>
            </span>
          </button>
        ))}
      </Body>
      {cups > 0 && (
        <div className="shrink-0 px-4 pb-4 pt-2">
          <button type="button" data-anno="04" onClick={() => go('SC-ORDER-01')} className="flex h-[52px] w-full items-center justify-between rounded-xl bg-neutral-900 px-4 text-[13px] text-white">
            <span>{cups}개 · {fmtWon(cartTotal(s.cart))}</span>
            <b>주문서 보기 ›</b>
          </button>
        </div>
      )}
      {withSheet && <OptionSheet />}
    </Shell>
  )
}

function OptionSheet() {
  const { s, dispatch, go } = useDemo()
  if (!s.sheetMenuId) return null
  const m = menuById(s.sheetMenuId)
  const { opts, qty } = s.draft
  const setOpts = (p: Partial<Opts>) => dispatch({ type: 'set', patch: { draft: { qty, opts: { ...opts, ...p } } } })
  const setQty = (q: number) => dispatch({ type: 'set', patch: { draft: { opts, qty: q } } })
  const close = () => { dispatch({ type: 'set', patch: { sheetMenuId: null } }); go('SC-MENU-01') }
  return (
    <Sheet onClose={close}>
      <div data-anno="01" className="flex items-baseline justify-between">
        <p className="text-[17px] font-bold">{m.name}</p>
        <p className="text-[14px] font-bold">{fmtWon(m.price)}</p>
      </div>
      <div data-anno="02" className="space-y-2.5">
        <div>
          <p className="mb-1.5 text-[12px] font-bold text-neutral-600">온도 <span className="text-orange-600">필수</span></p>
          <Segment label="온도" value={opts.temp} onChange={(v) => setOpts({ temp: v })} options={[{ v: 'HOT', label: 'HOT' }, { v: 'ICE', label: 'ICE' }]} />
        </div>
        {m.options === 'full' && (
          <>
            <div>
              <p className="mb-1.5 text-[12px] font-bold text-neutral-600">사이즈</p>
              <Segment label="사이즈" value={opts.size} onChange={(v) => setOpts({ size: v })} options={[{ v: '레귤러', label: '레귤러' }, { v: '라지', label: '라지 +500' }]} />
            </div>
            <div>
              <p className="mb-1.5 text-[12px] font-bold text-neutral-600">샷 추가</p>
              <Segment label="샷 추가" value={opts.shot ? 'y' : 'n'} onChange={(v) => setOpts({ shot: v === 'y' })} options={[{ v: 'n', label: '없음' }, { v: 'y', label: '+1샷 +500' }]} />
            </div>
          </>
        )}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-bold text-neutral-600">수량</p>
        <span data-anno="03"><Stepper label="수량" value={qty} max={MAX_QTY} onDec={() => setQty(qty - 1)} onInc={() => setQty(qty + 1)} /></span>
      </div>
      <Cta anno="04" onClick={() => { dispatch({ type: 'addToCart' }); go('SC-MENU-01') }}>
        {fmtWon(unitPrice(m.id, opts) * qty)} 담기
      </Cta>
    </Sheet>
  )
}

/* SC-ORDER-01 주문서 (+ SC-ORDER-02 시트) */
function OrderSheetScreen({ withTimeSheet }: { withTimeSheet?: boolean }) {
  const { s, dispatch, go } = useDemo()
  const st = storeById(s.storeId)
  const eta = orderEtaMin(s.storeId, s.cart)
  const empty = s.cart.length === 0
  return (
    <Shell>
      <StatusBar />
      <Header title="주문서" back={() => go('SC-MENU-01')} />
      <Body className="space-y-3">
        <p className="text-[12px] text-neutral-500">{st.name} · {st.location}</p>
        <section data-anno="01">
          <p className="mb-1 text-[12px] font-bold text-neutral-600">담은 메뉴</p>
          {empty && <p className="rounded-xl bg-neutral-50 py-8 text-center text-[13px] text-neutral-400">담은 메뉴가 없어요</p>}
          {s.cart.map((i) => (
            <div key={i.key} className="flex items-center gap-3 border-b border-neutral-100 py-2.5">
              <Thumb />
              <div className="flex-1">
                <p className="text-[14px] font-bold">{menuById(i.menuId).name}</p>
                <p className="text-[12px] text-neutral-500">{optLabel(i.menuId, i.opts)} · {fmtWon(unitPrice(i.menuId, i.opts))}</p>
              </div>
              <Stepper label={`${menuById(i.menuId).name} 수량`} value={i.qty} min={0} onDec={() => dispatch({ type: 'changeQty', key: i.key, delta: -1 })} onInc={() => dispatch({ type: 'changeQty', key: i.key, delta: 1 })} />
            </div>
          ))}
          <button type="button" onClick={() => go('SC-MENU-01')} className="mt-2 w-full text-center text-[12px] text-neutral-500 underline">+ 메뉴 더 담기</button>
        </section>
        <section data-anno="02" className="rounded-xl border border-neutral-300 px-3.5 py-3">
          <p className="text-[12px] font-bold text-neutral-600">픽업 시간</p>
          <div className="mt-1 flex items-center justify-between">
            <p className="text-[14px] font-bold">{s.pickup === 'asap' ? `가능한 빨리 (약 ${fmtTime(eta)})` : `${fmtTime(s.pickup)} 픽업`}</p>
            <button type="button" disabled={empty} onClick={() => go('SC-ORDER-02')} className="text-[12px] text-neutral-500 disabled:opacity-40">변경 ›</button>
          </div>
        </section>
        <section data-anno="03" className="rounded-xl border border-neutral-300 px-3.5 py-3" role="radiogroup" aria-label="결제 수단">
          <p className="mb-1 text-[12px] font-bold text-neutral-600">결제 수단</p>
          {PAY_METHODS.map((p) => (
            <button key={p} type="button" role="radio" aria-checked={s.pay === p} onClick={() => dispatch({ type: 'set', patch: { pay: p } })} className="flex w-full items-center gap-2.5 py-1.5 text-[13px]">
              <span className={`size-4 rounded-full border ${s.pay === p ? 'border-[5px] border-neutral-900' : 'border-neutral-400'}`} />
              {p}
            </button>
          ))}
        </section>
        <div className="flex items-center justify-between pt-1">
          <p className="text-[14px] font-bold">결제 금액</p>
          <p className="text-[19px] font-extrabold">{fmtWon(cartTotal(s.cart))}</p>
        </div>
      </Body>
      <div className="shrink-0 px-4 pb-4 pt-2">
        <Cta anno="04" disabled={empty} onClick={() => go('SC-ORDER-03')}>{empty ? '메뉴를 담아 주세요' : `${fmtWon(cartTotal(s.cart))} 결제하기`}</Cta>
      </div>
      {withTimeSheet && <TimeSheet eta={eta} />}
    </Shell>
  )
}

function TimeSheet({ eta }: { eta: number }) {
  const { s, dispatch, go } = useDemo()
  const st = storeById(s.storeId)
  const start = Math.floor(NOW_MIN / 10) * 10
  const slots: number[] = []
  for (let t = start; t <= st.closeMin - 30; t += 10) slots.push(t)
  const sel = s.pickup
  const close = () => go('SC-ORDER-01')
  return (
    <Sheet onClose={close}>
      <p className="text-[17px] font-bold">언제 받을까요?</p>
      <button
        type="button"
        data-anno="01"
        aria-pressed={sel === 'asap'}
        onClick={() => dispatch({ type: 'set', patch: { pickup: 'asap' } })}
        className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left ${sel === 'asap' ? 'border-neutral-900 ring-1 ring-neutral-900' : 'border-neutral-300'}`}
      >
        <span className="text-[14px] font-bold">가능한 빨리</span>
        <span className="text-[13px] text-neutral-500">약 {fmtTime(eta)}</span>
      </button>
      <div data-anno="02">
        <p className="mb-1.5 text-[12px] font-bold text-neutral-600">시간 지정</p>
        <div className="grid max-h-[176px] grid-cols-4 gap-1.5 overflow-y-auto">
          {slots.map((t) => (
            <button
              key={t}
              type="button"
              disabled={t < eta}
              aria-pressed={sel === t}
              onClick={() => dispatch({ type: 'set', patch: { pickup: t } })}
              className={`rounded-lg border py-2 text-[12px] tabular-nums disabled:border-neutral-200 disabled:text-neutral-300 ${sel === t ? 'border-neutral-900 bg-neutral-900 font-semibold text-white' : 'border-neutral-300'}`}
            >
              {fmtTime(t)}
            </button>
          ))}
        </div>
      </div>
      <Cta anno="03" onClick={close}>선택 완료</Cta>
    </Sheet>
  )
}

/* SC-ORDER-03 결제 (PG 모의 화면) */
function Payment() {
  const { s, dispatch, go } = useDemo()
  const st = storeById(s.storeId)
  const fail = () => { dispatch({ type: 'set', patch: { toast: '결제가 승인되지 않았어요. 다시 시도해 주세요' } }); go('SC-ORDER-01') }
  return (
    <Shell>
      <StatusBar />
      <div className="flex h-12 shrink-0 items-center justify-between bg-neutral-100 px-4">
        <p className="text-[14px] font-bold">{s.pay} 결제</p>
        <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-neutral-500">PG 화면 · 데모</span>
      </div>
      <Body className="flex flex-col justify-center gap-4 bg-neutral-50">
        <div data-anno="01" className="rounded-2xl bg-white p-5 text-center shadow-sm">
          <p className="text-[13px] text-neutral-500">{st.name}</p>
          <p className="mt-1 text-[28px] font-extrabold">{fmtWon(cartTotal(s.cart))}</p>
          <p className="mt-1 text-[12px] text-neutral-500">{s.pay} · 메뉴 {cartCups(s.cart)}개</p>
        </div>
        <p className="text-center text-[11px] leading-relaxed text-neutral-400">실제 결제는 이루어지지 않아요. 아래에서 PG 응답을 골라 재현합니다.</p>
      </Body>
      <div className="shrink-0 space-y-2 bg-neutral-50 px-4 pb-4 pt-2">
        <div data-anno="02" className="space-y-2">
          <Cta onClick={() => { dispatch({ type: 'placeOrder' }); go('SC-STATUS-01') }}>결제 승인</Cta>
          <button type="button" onClick={fail} className="h-10 w-full rounded-xl border border-neutral-300 bg-white text-[13px] text-neutral-600">승인 실패 재현</button>
        </div>
        <button type="button" data-anno="03" onClick={() => go('SC-ORDER-01')} className="h-10 w-full text-[13px] text-neutral-500">결제 취소</button>
      </div>
    </Shell>
  )
}

/* SC-STATUS-01 주문 상태 */
function OrderStatus() {
  const { s, dispatch, go } = useDemo()
  const o = s.active
  if (!o) {
    return (
      <Shell>
        <StatusBar />
        <Header title="주문 상태" close={() => go('SC-HOME-01')} />
        <Body className="grid place-items-center text-center text-[13px] text-neutral-500">진행 중인 주문이 없어요</Body>
        <div className="shrink-0 px-4 pb-4"><Cta onClick={() => go('SC-HOME-01')}>홈으로</Cta></div>
      </Shell>
    )
  }
  const st = storeById(o.storeId)
  const ready = o.stage === 2
  const leave = () => { dispatch({ type: 'archive' }); go('SC-HOME-01') }
  return (
    <Shell>
      <StatusBar />
      <Header title="주문 상태" close={leave} />
      <Body className="space-y-3.5">
        <div data-anno="01" className={`rounded-2xl py-3 text-center ${ready ? 'bg-neutral-900 text-white' : ''}`}>
          <p className={`text-[12px] ${ready ? 'text-white/70' : 'text-neutral-500'}`}>{ready ? '음료가 준비됐어요' : o.stage === 3 ? '픽업을 완료했어요' : '주문번호'}</p>
          <p className="text-[42px] font-black tracking-wide">{o.no}</p>
          <p className={`text-[12px] ${ready ? 'text-white/70' : 'text-neutral-500'}`}>픽업대에서 이 번호를 보여주세요</p>
        </div>
        <ol data-anno="02" className="relative flex justify-between rounded-xl border border-neutral-300 px-3 pb-3 pt-4" aria-label="진행 단계">
          <span className="absolute left-9 right-9 top-[25px] h-0.5 bg-neutral-200" aria-hidden />
          {STAGES.map((label, i) => (
            <li key={label} aria-current={i === o.stage ? 'step' : undefined} className={`relative z-10 flex w-14 flex-col items-center gap-1.5 text-[11px] ${i === o.stage ? 'font-bold text-neutral-900' : i < o.stage ? 'text-neutral-600' : 'text-neutral-400'}`}>
              <span className={`size-5 rounded-full border-2 ${i < o.stage ? 'border-neutral-900 bg-neutral-900' : i === o.stage ? 'border-[6px] border-neutral-900 bg-white' : 'border-neutral-300 bg-white'}`} />
              {label}
            </li>
          ))}
        </ol>
        <div data-anno="03" className="rounded-xl border border-dashed border-neutral-400 bg-neutral-50 px-4 py-3">
          <p className="text-[14px] font-bold">{fmtTime(o.pickupMin)} 픽업 예정</p>
          <p className="mt-0.5 flex items-center gap-1 text-[12px] text-neutral-500"><MapPin size={12} />{st.name} · {st.pickupSpot}</p>
          <p className="mt-1 text-[12px] text-neutral-500">
            {s.perm === 'granted' && s.notifOn ? '음료가 준비되면 알림을 보내드려요' : '알림이 꺼져 있어요. 이 화면에서 상태를 확인해 주세요'}
          </p>
        </div>
        <div>
          <p className="mb-1 text-[12px] font-bold text-neutral-600">주문 메뉴</p>
          {o.items.map((i) => (
            <div key={i.key} className="flex items-center gap-3 border-b border-neutral-100 py-2">
              <Thumb size={34} />
              <div>
                <p className="text-[13px] font-bold">{menuById(i.menuId).name} {i.qty}</p>
                <p className="text-[12px] text-neutral-500">{optLabel(i.menuId, i.opts)}</p>
              </div>
            </div>
          ))}
        </div>
        {o.stage === 0 && (
          <button type="button" data-anno="04" onClick={() => dispatch({ type: 'set', patch: { confirm: 'cancelOrder' } })} className="w-full text-center text-[12px] text-neutral-500 underline">
            주문 취소 (접수 단계에서만)
          </button>
        )}
      </Body>
      <div className="shrink-0 px-4 pb-4 pt-2"><Cta onClick={leave}>홈으로</Cta></div>
      {s.confirm === 'cancelOrder' && (
        <Dialog
          title="주문을 취소할까요?"
          body="결제 금액은 결제 수단으로 환불돼요."
          cancel="유지하기"
          ok="취소하기"
          onCancel={() => dispatch({ type: 'set', patch: { confirm: null } })}
          onOk={() => { dispatch({ type: 'cancelOrder' }); go('SC-HOME-01') }}
        />
      )}
    </Shell>
  )
}

/* SC-HIST-01 주문 내역 */
function History() {
  const { s, dispatch, go } = useDemo()
  const rows = [...(s.active ? [s.active] : []), ...s.history]
  return (
    <Shell>
      <StatusBar />
      <Header title="주문 내역" />
      <Body className="space-y-2.5">
        {rows.length === 0 && <p className="py-20 text-center text-[13px] text-neutral-400">아직 주문 내역이 없어요</p>}
        <div data-anno="01" className="space-y-2.5">
          {rows.map((o) => {
            const live = s.active?.no === o.no && o.stage < 3
            const label = live ? STAGES[o.stage] : o.canceled ? '취소됨' : o.rejected ? '거절·환불' : '픽업 완료'
            return (
              <div key={o.no} className="rounded-xl border border-neutral-300 p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-[14px] font-bold">{storeById(o.storeId).name}<Badge tone={live ? 'fill' : 'line'}>{label}</Badge></p>
                  <p className="text-[11px] text-neutral-400">{o.placedAt}</p>
                </div>
                <p className="mt-1 text-[12px] text-neutral-500">
                  {menuById(o.items[0].menuId).name}{o.items.length > 1 ? ` 외 ${o.items.length - 1}개` : ''} · {fmtWon(o.total)}
                </p>
                <div className="mt-2.5">
                  {live ? (
                    <button type="button" onClick={() => go('SC-STATUS-01')} className="h-9 w-full rounded-lg bg-neutral-900 text-[13px] font-semibold text-white">주문 상태 보기</button>
                  ) : (
                    <button type="button" data-anno="02" onClick={() => { dispatch({ type: 'reorder', no: o.no }); if (storeById(o.storeId).open) go('SC-ORDER-01') }} className="h-9 w-full rounded-lg border border-neutral-300 text-[13px] font-semibold">다시 담기</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Body>
      <Tabs current="hist" anno="03" />
    </Shell>
  )
}

/* SC-MY-01 마이 */
function My() {
  const { s, dispatch, go } = useDemo()
  return (
    <Shell>
      <StatusBar />
      <Header title="마이" />
      <Body className="space-y-3">
        <div data-anno="01" className="flex items-center gap-3 rounded-xl bg-neutral-50 p-4">
          <span className="grid size-11 place-items-center rounded-full bg-[#FEE500] text-[15px] font-bold">K</span>
          <span>
            <span className="block text-[15px] font-bold">카카오 사용자</span>
            <span className="block text-[12px] text-neutral-500">카카오 계정으로 로그인됨</span>
          </span>
        </div>
        <div data-anno="02" className="flex items-center justify-between rounded-xl border border-neutral-300 px-4 py-3.5">
          <span>
            <span className="block text-[14px] font-bold">준비 완료 알림</span>
            <span className="block text-[12px] text-neutral-500">
              {s.perm === 'granted' ? '음료가 준비되면 푸시로 알려드려요' : '휴대폰 설정에서 알림을 켜야 받을 수 있어요'}
            </span>
          </span>
          {s.perm === 'granted' ? (
            <button
              type="button"
              role="switch"
              aria-checked={s.notifOn}
              aria-label="준비 완료 알림"
              onClick={() => dispatch({ type: 'set', patch: { notifOn: !s.notifOn } })}
              className={`relative h-7 w-12 rounded-full transition ${s.notifOn ? 'bg-neutral-900' : 'bg-neutral-300'}`}
            >
              <span className={`absolute top-1 size-5 rounded-full bg-white transition ${s.notifOn ? 'left-6' : 'left-1'}`} />
            </button>
          ) : (
            <button type="button" onClick={() => dispatch({ type: 'set', patch: { perm: 'granted', toast: '설정에서 알림을 켰어요 (데모)' } })} className="text-[12px] font-semibold underline">설정에서 켜기</button>
          )}
        </div>
        <div data-anno="03" className="divide-y divide-neutral-100 rounded-xl border border-neutral-300 text-[14px]">
          <p className="px-4 py-3">이용약관</p>
          <p className="px-4 py-3">개인정보처리방침</p>
          <button type="button" onClick={() => { dispatch({ type: 'set', patch: { loggedIn: false, cart: [] } }); go('SC-AUTH-01') }} className="w-full px-4 py-3 text-left">로그아웃</button>
          <p className="px-4 py-3 text-neutral-400">회원 탈퇴 <span className="text-[11px]">(정책 확인 필요)</span></p>
        </div>
      </Body>
      <Tabs current="my" anno="04" />
    </Shell>
  )
}

export function ScreenView({ id }: { id: ScreenId }) {
  switch (id) {
    case 'SC-AUTH-01': return <Login />
    case 'SC-AUTH-02': return <Permission />
    case 'SC-HOME-01': return <HomeScreen />
    case 'SC-MENU-01': return <MenuList />
    case 'SC-MENU-02': return <MenuList withSheet />
    case 'SC-ORDER-01': return <OrderSheetScreen />
    case 'SC-ORDER-02': return <OrderSheetScreen withTimeSheet />
    case 'SC-ORDER-03': return <Payment />
    case 'SC-STATUS-01': return <OrderStatus />
    case 'SC-HIST-01': return <History />
    case 'SC-MY-01': return <My />
  }
}
