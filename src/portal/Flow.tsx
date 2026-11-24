import { Link } from 'react-router-dom'
import { ArrowRight, FileText, Play } from 'lucide-react'
import { CORE_FLOW, SPEC, screenById } from '../data/spec'
import { ScaledStatic } from './Static'

export function FlowPage() {
  return (
    <div className="mx-auto max-w-[1500px] space-y-6 px-4 py-6 sm:px-8">
      <section className="rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="text-[22px] font-extrabold">전체 흐름 보기</h2>
        <p className="mt-1 text-[14px] text-neutral-600">화면 {SPEC.screens.length}개 · 기능 {SPEC.features.length}개. 카드에서 문서와 시연에 각각 들어갈 수 있어요.</p>
        <div className="mt-5">
          <p className="mb-2 text-[12px] font-bold text-neutral-500">핵심 흐름 · 예상 픽업 시간 확인 후 사전 주문 <span className="font-normal text-neutral-400">(출처: 2주차 User Flow)</span></p>
          <ol className="flex flex-wrap items-stretch gap-2">
            {CORE_FLOW.map((c, i) => {
              const s = screenById(c.id)!
              return (
                <li key={c.id} className="flex items-center gap-2">
                  <div className={`rounded-xl border px-3 py-2 ${s.wireframe.startsWith('WF') ? 'border-emerald-300 bg-emerald-50' : 'border-neutral-200 bg-neutral-50'}`}>
                    <p className="font-mono text-[10.5px] text-neutral-500">{s.id}</p>
                    <p className="text-[13px] font-bold">{s.name}</p>
                    {c.note && <p className="text-[11px] text-neutral-500">{c.note}</p>}
                  </div>
                  {i < CORE_FLOW.length - 1 && <ArrowRight size={16} className="shrink-0 text-neutral-400" />}
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {SPEC.screens.map((s) => (
          <li key={s.id} className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-4">
            <p className="flex items-center gap-2 text-[11px] text-neutral-500"><span className="font-mono font-semibold text-neutral-700">{s.id}</span>· {s.type}</p>
            <h3 className="mt-0.5 text-[17px] font-bold">{s.name}</h3>
            <div className="my-3 rounded-xl bg-[#eef0f2] py-3">
              <ScaledStatic id={s.id} scale={0.42} />
            </div>
            <p className="text-[13px] text-neutral-700">{s.purpose}</p>
            <p className="mb-1 mt-3 text-[11px] font-bold text-neutral-500">다음 이동 경로</p>
            <ul className="mb-4 space-y-0.5 text-[12px] text-neutral-600">
              {s.exit.map((e) => <li key={e}>· {e}</li>)}
            </ul>
            <div className="mt-auto grid grid-cols-2 gap-2">
              <Link to={`/docs/${s.id}`} className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-neutral-300 text-[13px] font-semibold hover:bg-neutral-50"><FileText size={15} /> 문서 보기</Link>
              <Link to={`/demo/${s.id}`} className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-[13px] font-semibold text-white hover:bg-emerald-700"><Play size={15} /> 시연하기</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
