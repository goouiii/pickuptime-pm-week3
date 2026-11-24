import type { ReactNode } from 'react'
import { ChevronLeft, X, Home, ReceiptText, User } from 'lucide-react'
import { useDemo, type ScreenId } from '../demo/state'
import { fmtTime, NOW_MIN } from '../data/mock'

export const SCREEN_W = 360
export const SCREEN_H = 740

export function StatusBar({ dark }: { dark?: boolean }) {
  return (
    <div className={`flex h-7 shrink-0 items-center justify-between px-5 text-[11px] font-semibold ${dark ? 'text-white/80' : 'text-neutral-500'}`}>
      <span>{fmtTime(NOW_MIN)}</span>
      <span className="tracking-widest">▮▮▮</span>
    </div>
  )
}

export function Header({ title, back, close }: { title: string; back?: () => void; close?: () => void }) {
  return (
    <div className="flex h-12 shrink-0 items-center gap-2 border-b border-neutral-200 px-4">
      {back && (
        <button type="button" onClick={back} aria-label="뒤로" className="-ml-1 grid size-8 place-items-center rounded-lg hover:bg-neutral-100">
          <ChevronLeft size={20} />
        </button>
      )}
      <h1 className="flex-1 text-[16px] font-bold">{title}</h1>
      {close && (
        <button type="button" onClick={close} aria-label="닫기" className="grid size-8 place-items-center rounded-lg hover:bg-neutral-100">
          <X size={18} />
        </button>
      )}
    </div>
  )
}

export function Body({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`relative flex-1 overflow-y-auto px-4 py-3 ${className}`}>{children}</div>
}

export function Cta({ children, onClick, disabled, anno, className = '' }: { children: ReactNode; onClick?: () => void; disabled?: boolean; anno?: string; className?: string }) {
  return (
    <button
      type="button"
      data-anno={anno}
      disabled={disabled}
      onClick={onClick}
      className={`h-12 w-full rounded-xl bg-neutral-900 text-[15px] font-bold text-white transition active:scale-[0.99] disabled:bg-neutral-300 disabled:text-neutral-500 ${className}`}
    >
      {children}
    </button>
  )
}

export function Badge({ children, tone = 'line' }: { children: ReactNode; tone?: 'line' | 'fill' | 'warn' }) {
  const cls = tone === 'fill' ? 'bg-neutral-900 text-white border-neutral-900' : tone === 'warn' ? 'border-orange-500 text-orange-600' : 'border-neutral-400 text-neutral-600'
  return <span className={`ml-1.5 inline-flex h-[19px] items-center rounded-full border px-2 align-middle text-[10px] font-bold ${cls}`}>{children}</span>
}

export function Thumb({ size = 46 }: { size?: number }) {
  return (
    <div className="shrink-0 overflow-hidden rounded-md border border-neutral-300 bg-neutral-50" style={{ width: size, height: size }} aria-hidden>
      <svg width="100%" height="100%" viewBox="0 0 10 10" preserveAspectRatio="none">
        <line x1="0" y1="0" x2="10" y2="10" stroke="#d4d4d4" strokeWidth="0.3" />
        <line x1="10" y1="0" x2="0" y2="10" stroke="#d4d4d4" strokeWidth="0.3" />
      </svg>
    </div>
  )
}

export function Stepper({ value, onDec, onInc, min = 1, max = 10, label }: { value: number; onDec: () => void; onInc: () => void; min?: number; max?: number; label: string }) {
  return (
    <div className="flex h-8 items-center rounded-lg border border-neutral-300 text-[13px]" role="group" aria-label={label}>
      <button type="button" onClick={onDec} disabled={value <= min} aria-label="수량 줄이기" className="h-full w-8 disabled:text-neutral-300">−</button>
      <span className="w-6 text-center font-semibold tabular-nums">{value}</span>
      <button type="button" onClick={onInc} disabled={value >= max} aria-label="수량 늘리기" className="h-full w-8 disabled:text-neutral-300">+</button>
    </div>
  )
}

export function Segment<T extends string>({ value, options, onChange, label }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex overflow-hidden rounded-lg border border-neutral-300">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          role="radio"
          aria-checked={value === o.v}
          onClick={() => onChange(o.v)}
          className={`flex-1 py-2 text-[12px] ${value === o.v ? 'bg-neutral-900 font-semibold text-white' : 'text-neutral-600'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Sheet({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end">
      <button type="button" aria-label="시트 닫기" onClick={onClose} className="absolute inset-0 bg-black/45" />
      <div role="dialog" className="relative flex max-h-[85%] flex-col gap-3 rounded-t-[20px] bg-white px-4 pb-5 pt-2.5">
        <div className="mx-auto h-1 w-10 rounded bg-neutral-300" />
        {children}
      </div>
    </div>
  )
}

export function Dialog({ title, body, cancel, ok, onCancel, onOk }: { title: string; body?: string; cancel: string; ok: string; onCancel: () => void; onOk: () => void }) {
  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-black/45 px-8">
      <div role="alertdialog" className="w-full rounded-2xl bg-white p-5 text-center">
        <p className="text-[15px] font-bold">{title}</p>
        {body && <p className="mt-1.5 text-[13px] text-neutral-500">{body}</p>}
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onCancel} className="h-10 flex-1 rounded-lg bg-neutral-100 text-[14px] font-semibold">{cancel}</button>
          <button type="button" onClick={onOk} className="h-10 flex-1 rounded-lg bg-neutral-900 text-[14px] font-semibold text-white">{ok}</button>
        </div>
      </div>
    </div>
  )
}

export function Tabs({ current, anno }: { current: 'home' | 'hist' | 'my'; anno: string }) {
  const { go } = useDemo()
  const items: { k: typeof current; label: string; to: ScreenId; Icon: typeof Home }[] = [
    { k: 'home', label: '홈', to: 'SC-HOME-01', Icon: Home },
    { k: 'hist', label: '주문 내역', to: 'SC-HIST-01', Icon: ReceiptText },
    { k: 'my', label: '마이', to: 'SC-MY-01', Icon: User },
  ]
  return (
    <nav data-anno={anno} className="flex h-[62px] shrink-0 items-center justify-around border-t border-neutral-200 bg-white" aria-label="하단 탭">
      {items.map(({ k, label, to, Icon }) => (
        <button
          key={k}
          type="button"
          aria-current={current === k ? 'page' : undefined}
          onClick={() => current !== k && go(to)}
          className={`flex w-20 flex-col items-center gap-1 text-[11px] ${current === k ? 'font-bold text-neutral-900' : 'text-neutral-400'}`}
        >
          <Icon size={20} strokeWidth={current === k ? 2.4 : 1.8} />
          {label}
        </button>
      ))}
    </nav>
  )
}

export function Toast() {
  const { s, dispatch } = useDemo()
  if (!s.toast) return null
  return (
    <button
      type="button"
      onClick={() => dispatch({ type: 'set', patch: { toast: null } })}
      className="absolute inset-x-4 bottom-24 z-50 rounded-xl bg-neutral-900/90 px-4 py-3 text-left text-[13px] text-white shadow-lg"
      role="status"
    >
      {s.toast}
    </button>
  )
}

export function Push() {
  const { s, dispatch, go } = useDemo()
  if (!s.push) return null
  return (
    <button
      type="button"
      onClick={() => { dispatch({ type: 'set', patch: { push: null } }); go('SC-STATUS-01') }}
      className="absolute inset-x-3 top-8 z-50 flex items-start gap-3 rounded-2xl bg-white/95 p-3 text-left shadow-xl ring-1 ring-black/5"
      role="alert"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-neutral-900 text-lg">☕</span>
      <span>
        <span className="block text-[12px] font-bold">픽업타임 · 지금</span>
        <span className="block text-[13px] text-neutral-700">{s.push}</span>
      </span>
    </button>
  )
}
