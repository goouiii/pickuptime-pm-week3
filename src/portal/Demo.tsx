import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'
import { DemoCtx, STAGES, ensure, reducer, seedFor, type ScreenId } from '../demo/state'
import { ScreenView } from '../screens/screens'
import { SPEC, screenById } from '../data/spec'
import { FRAME_H, PhoneFrame } from './Static'

const firstId = SPEC.screens[0].id

/** 문서와 독립된 시연. 상태는 이 페이지 안에서만 유지되고 새로고침하면 진입 화면 기준으로 초기화된다. */
export function DemoPage() {
  const params = useParams()
  const id = (screenById(params.id ?? '') ? params.id : firstId) as ScreenId
  const nav = useNavigate()
  const [s, dispatch] = useReducer(reducer, id, seedFor)
  const go = useCallback((to: ScreenId) => nav(`/demo/${to}`), [nav])

  useEffect(() => {
    const fix = ensure(id, s)
    if (fix) dispatch({ type: 'replace', state: fix })
  }, [id, s])

  useEffect(() => {
    if (!s.toast) return
    const t = setTimeout(() => dispatch({ type: 'set', patch: { toast: null } }), 2600)
    return () => clearTimeout(t)
  }, [s.toast])

  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const f = () => setScale(Math.min(1, Math.max(0.55, (window.innerHeight - 120) / FRAME_H), (window.innerWidth - 24) / 376))
    f()
    window.addEventListener('resize', f)
    return () => window.removeEventListener('resize', f)
  }, [])

  const api = useMemo(() => ({ s, dispatch, go, readonly: false }), [s, go])
  const o = s.active
  const sc = screenById(id)!

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 px-4 py-6 lg:flex-row lg:items-start lg:justify-center">
      <div style={{ width: 376 * scale, height: FRAME_H * scale }} className="shrink-0">
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <DemoCtx.Provider value={api}>
            <PhoneFrame><ScreenView id={id} /></PhoneFrame>
          </DemoCtx.Provider>
        </div>
      </div>

      <aside className="no-print w-full max-w-[380px] space-y-4">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-[12px] font-bold text-emerald-700">시연하기</p>
          <p className="mt-1 text-[18px] font-extrabold">{sc.name}</p>
          <p className="mt-1 text-[13px] text-neutral-500">휴대폰 화면 안의 버튼·입력이 실제로 동작해요. 문서와는 따로 움직여요.</p>
          <label className="mt-4 block text-[12px] font-bold text-neutral-500" htmlFor="jump">화면 바로 가기</label>
          <select id="jump" value={id} onChange={(e) => go(e.target.value as ScreenId)} className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-[13px]">
            {SPEC.screens.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
          <button type="button" onClick={() => { dispatch({ type: 'replace', state: seedFor(firstId) }); go(firstId) }} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-neutral-300 py-2 text-[13px] hover:bg-neutral-50">
            <RotateCcw size={14} /> 처음부터 다시
          </button>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-[13px] font-bold">매장 · 시스템 시뮬레이터</p>
          <p className="mt-1 text-[12px] text-neutral-500">매장 POS·PG·OS처럼 앱 밖에서 일어나는 일을 대신 일으켜요.</p>
          {id === 'SC-AUTH-01' && (
            <label className="mt-3 flex items-center gap-2 text-[13px]">
              <input type="checkbox" checked={s.loginFailNext} onChange={(e) => dispatch({ type: 'set', patch: { loginFailNext: e.target.checked } })} />
              다음 로그인 실패시키기
            </label>
          )}
          {o ? (
            <div className="mt-3 space-y-2">
              <p className="text-[12px] text-neutral-600">진행 중 주문 <b>{o.no}</b> · 현재 <b>{STAGES[o.stage]}</b></p>
              <div className="grid grid-cols-2 gap-2">
                <SimBtn disabled={o.stage !== 0} onClick={() => dispatch({ type: 'advance', to: 1 })}>제조 시작</SimBtn>
                <SimBtn disabled={o.stage !== 1} onClick={() => dispatch({ type: 'advance', to: 2 })}>준비 완료</SimBtn>
                <SimBtn disabled={o.stage !== 2} onClick={() => dispatch({ type: 'advance', to: 3 })}>픽업 완료</SimBtn>
                <SimBtn disabled={o.stage > 1} onClick={() => { dispatch({ type: 'reject' }); go('SC-HOME-01') }}>주문 거절</SimBtn>
              </div>
              <p className="text-[11px] text-neutral-400">준비 완료 시 알림이 켜져 있으면 화면 위에 알림 배너가 떠요.</p>
            </div>
          ) : (
            <p className="mt-3 text-[12px] text-neutral-400">결제를 마치면 매장 상태 변경 버튼이 나타나요.</p>
          )}
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-[12.5px] leading-relaxed text-amber-900">
          <p className="font-bold">Mock 범위</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            <li>카카오 로그인·PG 결제·푸시 알림은 실제로 처리하지 않아요.</li>
            <li>매장·메뉴·대기 건수는 고정 Mock Data, 현재 시각은 10:41로 고정이에요.</li>
            <li>상태는 이 탭에서만 유지되고 새로고침하면 지금 화면의 기본 상태로 돌아가요. (저장 정책은 확인 필요)</li>
          </ul>
        </section>
      </aside>
    </div>
  )
}

function SimBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return <button type="button" disabled={disabled} onClick={onClick} className="h-9 rounded-lg bg-neutral-900 text-[13px] font-semibold text-white disabled:bg-neutral-200 disabled:text-neutral-400">{children}</button>
}
