import raw from './spec.json'
import type { ScreenId } from '../demo/state'

export interface Comp { no: string; label: string; desc: string }
export interface ScreenSpec {
  id: ScreenId; name: string; type: string; route: string; wireframe: string; purpose: string
  entry: string[]; exit: string[]; components: Comp[]; actions: string[]; states: string[]; features: string[]
}
export interface FeatureSpec {
  id: string; name: string; screens: string[]; type: string; priority: string
  desc: string; condition: string; logic: string; success: string; exception: string
}

export const SPEC = raw as unknown as {
  service: string; tagline: string; version: string; project: string
  screens: ScreenSpec[]; features: FeatureSpec[]
}

export const screenById = (id: string) => SPEC.screens.find((s) => s.id === id)
export const featureById = (id: string) => SPEC.features.find((f) => f.id === id)

const N = 'https://app.notion.com/p/'
/** Notion 원문 (화면 정의서 · 기능명세서 데이터베이스 행) */
export const NOTION_PAGE = `${N}4224aecd0f9b81128a7dd6fd50c01d45`
export const NOTION: Record<string, string> = {
  'SC-AUTH-01': '4224aecd0f9b812d8715cfa7cc3d15ea',
  'SC-AUTH-02': '4224aecd0f9b81f69508e67fec1234b6',
  'SC-HOME-01': '4224aecd0f9b8142a2a5c8549b80a630',
  'SC-MENU-01': '4224aecd0f9b81d0a5f3e0407e0ed73a',
  'SC-MENU-02': '4224aecd0f9b8156a489c491d00ddd7c',
  'SC-ORDER-01': '4224aecd0f9b81c3b0a4e915834f69e8',
  'SC-ORDER-02': '4224aecd0f9b8127bda5dffdcead6160',
  'SC-ORDER-03': '4224aecd0f9b81ad850bd073747ebe9e',
  'SC-STATUS-01': '4224aecd0f9b81fd984bceffd48e42df',
  'SC-HIST-01': '4224aecd0f9b81eeb97bc1aa06ca6dc0',
  'SC-MY-01': '4224aecd0f9b811298adf31d8e088e10',
  'F-AUTH-01': '4224aecd0f9b8134be09f35c56a2ba1e',
  'F-AUTH-02': '4224aecd0f9b812d809dee7d5e6af166',
  'F-STORE-01': '4224aecd0f9b81ff92bed9f94f2a8321',
  'F-STORE-02': '4224aecd0f9b814d93edeccbc8c62719',
  'F-MENU-01': '4224aecd0f9b81d39d36db3fb5aff67c',
  'F-MENU-02': '4224aecd0f9b818cbf2ed39d0a772840',
  'F-MENU-03': '4224aecd0f9b81ad915cedacaf1d4e5d',
  'F-CART-01': '4224aecd0f9b815a8ac9db1d970de6e8',
  'F-CART-02': '4224aecd0f9b81e18ee2c9cdcb60be86',
  'F-ORDER-01': '4224aecd0f9b810c87d7e2c8a430a924',
  'F-ORDER-02': '4224aecd0f9b81e1a16ec1a45d5e79de',
  'F-ORDER-03': '4224aecd0f9b8176a3faf9609dfcffb6',
  'F-STATUS-01': '4224aecd0f9b8105af5ce49755c80706',
  'F-STATUS-02': '4224aecd0f9b81b1994ccbb56beea864',
  'F-STATUS-03': '4224aecd0f9b8129a437c5bc33965dac',
  'F-HIST-01': '4224aecd0f9b8102af99f9625b0f67df',
  'F-MY-01': '4224aecd0f9b81668f12e0206f7dba47',
}
export const notionUrl = (id: string) => (NOTION[id] ? `${N}${NOTION[id]}` : undefined)

export type Impl = 'done' | 'mock' | 'partial'
/** 현재 데모 구현 상태 — 기획된 동작(명세)과 구분해서 표시 */
export const IMPL: Record<string, { state: Impl; note: string }> = {
  'F-AUTH-01': { state: 'mock', note: '카카오 인증 없이 로그인 상태만 전환. 로그인 실패는 시연 패널에서 재현.' },
  'F-AUTH-02': { state: 'mock', note: 'OS 권한 팝업을 화면 안 대화상자로 재현. 실제 권한은 요청하지 않음.' },
  'F-STORE-01': { state: 'partial', note: '고정 Mock 대기 건수로 계산. 30초 자동 갱신·조회 실패 상태는 미구현.' },
  'F-STORE-02': { state: 'done', note: '다른 매장 메뉴가 담겨 있으면 비우기 확인까지 동작.' },
  'F-MENU-01': { state: 'done', note: '빈 카테고리(디저트) 문구 포함.' },
  'F-MENU-02': { state: 'done', note: '티 메뉴는 온도만 노출.' },
  'F-MENU-03': { state: 'done', note: '1~10 경계에서 버튼 비활성.' },
  'F-CART-01': { state: 'done', note: '같은 메뉴·옵션 합산, 20잔 제한. 담는 사이 품절은 미재현.' },
  'F-CART-02': { state: 'done', note: '0개가 되면 삭제, 금액·예상 시각 재계산.' },
  'F-ORDER-01': { state: 'partial', note: '선택·비활성 규칙 동작. 데모 시각이 고정이라 지정 시각 경과 처리는 미재현.' },
  'F-ORDER-02': { state: 'partial', note: '선택은 동작. 최근 결제 수단 기억은 세션 안에서만 유지.' },
  'F-ORDER-03': { state: 'mock', note: 'PG 화면을 모의로 재현(승인·실패·취소). 실제 결제 없음.' },
  'F-STATUS-01': { state: 'mock', note: '매장 상태 변경을 시연 패널 버튼으로 재현. 실시간 연결 없음.' },
  'F-STATUS-02': { state: 'mock', note: '실제 푸시 대신 화면 상단 알림 배너로 재현.' },
  'F-STATUS-03': { state: 'done', note: '접수 단계에서만 노출, 확인 후 취소·환불 안내. 동시 변경 실패는 미재현.' },
  'F-HIST-01': { state: 'done', note: '품절 메뉴 제외·영업 종료 매장 안내 포함.' },
  'F-MY-01': { state: 'partial', note: '토글은 세션 안에서만 유지(새로고침 시 초기화).' },
}

/** 2주차 User Flow 원문의 핵심 흐름 (문서 탐색 순서와 별개) */
export const CORE_FLOW: { id: ScreenId; note?: string }[] = [
  { id: 'SC-HOME-01', note: '쉬는 시간 안에 받을 수 있나? → 아니오면 종료' },
  { id: 'SC-MENU-01' },
  { id: 'SC-MENU-02', note: '더 담을 메뉴가 있으면 메뉴 목록으로' },
  { id: 'SC-ORDER-01' },
  { id: 'SC-ORDER-02', note: '시간 지정 시에만' },
  { id: 'SC-ORDER-03', note: '실패하면 주문서로' },
  { id: 'SC-STATUS-01', note: '준비 완료 알림 → 픽업' },
]
