import { useMemo, type ReactNode } from 'react'
import { DemoCtx, seedFor, type ScreenId } from '../demo/state'
import { ScreenView } from '../screens/screens'
import { SCREEN_H, SCREEN_W } from '../screens/ui'

export const BEZEL = 8
export const FRAME_W = SCREEN_W + BEZEL * 2
export const FRAME_H = SCREEN_H + BEZEL * 2

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[40px] bg-neutral-900 shadow-[0_10px_40px_-12px_rgba(0,0,0,.35)]" style={{ width: FRAME_W, height: FRAME_H, padding: BEZEL }}>
      <div className="relative overflow-hidden rounded-[32px] bg-white" style={{ width: SCREEN_W, height: SCREEN_H }}>
        {children}
      </div>
    </div>
  )
}

const noop = () => {}

/** 문서·전체 흐름용 정적 화면: 목업 상태로 그리고 조작은 막는다 */
export function StaticScreen({ id }: { id: ScreenId }) {
  const api = useMemo(() => ({ s: seedFor(id), dispatch: noop, go: noop, readonly: true }), [id])
  return (
    <DemoCtx.Provider value={api}>
      <PhoneFrame>
        <div inert className="h-full w-full select-none">
          <ScreenView id={id} />
        </div>
      </PhoneFrame>
    </DemoCtx.Provider>
  )
}

export function ScaledStatic({ id, scale }: { id: ScreenId; scale: number }) {
  return (
    <div className="relative mx-auto overflow-hidden" style={{ width: FRAME_W * scale, height: FRAME_H * scale }} aria-hidden>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: FRAME_W, height: FRAME_H }}>
        <StaticScreen id={id} />
      </div>
    </div>
  )
}
