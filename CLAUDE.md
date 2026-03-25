# GodLifeLog Frontend - Claude Code 가이드

## 프로젝트 개요

React 기반 프론트엔드 프로젝트로, 도메인 기반 feature 모듈 구조로 리팩토링 진행 중이다.
- **빌드 도구:** CRACO (Create React App Configuration Override)
- **스타일링:** Tailwind CSS + shadcn/ui
- **HTTP:** axios (공통 인스턴스 `shared/api/axiosInstance.js`)
- **폼:** react-hook-form + zod
- **라우팅:** React Router v6
- **상태 관리:** Context API (AuthContext)

## 기술 스택 주요 경로

| 역할 | 경로 |
|------|------|
| Axios 인스턴스 | `src/shared/api/axiosInstance.js` |
| 토큰 재발급 | `src/shared/api/reissueToken.js` |
| 인증 Context | `src/shared/context/AuthContext.js` |
| API 공통 Hook | `src/shared/hooks/useApi.js` |
| 관리자 권한 Hook | `src/shared/hooks/useAdminPermission.js` |
| shadcn/ui 컴포넌트 | `src/shared/components/ui/` |
| 공통 레이아웃 | `src/shared/components/common/layout/` |
| 유틸리티 (cn) | `src/shared/lib/utils.js` |
| JWT 유틸 | `src/shared/utils/jwtUtils.js` |
| 전역 스타일 | `src/assets/styles/globals.css` |

## 목표 폴더 구조

```
src/
├── app/
│   ├── router/
│   │   ├── AppRouter.js              # 모든 라우트 통합
│   │   ├── routes.js                 # 라우트 Map
│   │   └── featureRouters/           # 도메인별 라우트
│   │       └── {feature}Routes.js
│   ├── store/                        # 전역 상태 (현재 미사용)
│   ├── App.js
│   └── index.js
│
├── features/                         # 도메인별 모듈 (핵심)
│   └── {feature}/
│       ├── components/               # 해당 도메인 전용 컴포넌트
│       ├── pages/                    # 페이지 컴포넌트 (라우트 대상)
│       ├── hooks/                    # 해당 도메인 커스텀 훅
│       ├── services/                 # API 호출 함수 모음
│       └── index.js                  # 외부 공개 API
│
├── shared/                           # 도메인 무관 공통 리소스
│   ├── api/
│   ├── components/
│   │   ├── common/                   # 레이아웃, 네비게이션
│   │   └── ui/                       # shadcn/ui 컴포넌트
│   ├── context/
│   ├── hooks/
│   ├── lib/
│   └── utils/
│
├── assets/
│   └── styles/
└── tests/
```

## 리팩토링 현황

### 완료
- `features/auth/` - 로그인, 회원가입, ID/PW 찾기
- `features/notice/` - 공지사항 목록/상세/작성
- `shared/` - API, UI 컴포넌트, hooks, context

### 진행 필요 (레거시 → features/ 이전 대상)

| 도메인 | 레거시 위치 | 이전 대상 |
|--------|-----------|---------|
| challenge | `components/challenge*/`, `pages/Challenge/` | `features/challenge/` |
| faq | `components/` (없음), `pages/FAQ/` | `features/faq/` |
| home | `pages/Home/` | `features/home/` |
| mypage | `components/mypage/`, `pages/MyPage/` | `features/mypage/` |
| qna | `components/QnA/`, `pages/QnA/` | `features/qna/` |
| routine | `components/routine/`, `pages/Routine/` | `features/routine/` |
| serviceAdmin | `components/ServiceAdmin/`, `pages/ServiceAdmin/` | `features/serviceAdmin/` |

## 리팩토링 규칙

### 1. features 모듈 구성 원칙

- **pages/**: 라우트에 직접 매핑되는 페이지 컴포넌트. 레이아웃 조합 담당, 로직 최소화
- **components/**: 해당 도메인에서만 쓰는 UI 컴포넌트
- **hooks/**: 비즈니스 로직, API 호출 상태 관리. `use{기능명}.js` 네이밍
- **services/**: axios 호출 순수 함수. `{domain}Service.js` 네이밍
- **index.js**: pages만 외부로 export (내부 구현 은닉)

### 2. services 작성 방식

```js
// features/{domain}/services/{domain}Service.js
import axiosInstance from '@/shared/api/axiosInstance';

export const fetchXxxList = async (params) => {
  const response = await axiosInstance.get('/api/xxx', { params });
  return response.data;
};
```

### 3. hooks 작성 방식

```js
// features/{domain}/hooks/use{기능}.js
import { useState, useEffect } from 'react';
import { fetchXxxList } from '../services/xxxService';

export const useXxxList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  // ...
  return { data, loading };
};
```

### 4. index.js 작성 방식

```js
// features/{domain}/index.js
export { default as XxxListPage } from './pages/XxxList';
export { default as XxxDetailPage } from './pages/XxxDetail';
// hooks, services는 내부 사용 → 외부 export 하지 않음
```

### 5. import 경로

- `@/` alias는 `src/`를 가리킴 (jsconfig.json 설정)
- shared 리소스: `@/shared/...`
- feature 내부 참조: 상대경로 `../services/...`
- feature 간 참조 금지 (필요시 shared로 이동)

## 코딩 컨벤션

- **컴포넌트 파일명:** PascalCase (`NoticeList.js`)
- **hook 파일명:** camelCase, `use` 접두사 (`useNoticeList.js`)
- **service 파일명:** camelCase, `Service` 접미사 (`noticeService.js`)
- **CSS:** Tailwind 유틸리티 클래스 사용, `cn()` 함수로 조합
- **UI 컴포넌트:** `@/shared/components/ui/`의 shadcn 컴포넌트 우선 사용
- **폼:** react-hook-form + zod 스키마 검증 사용

## 레거시 코드 처리 원칙

1. 레거시 코드는 **이전 완료 후** 삭제 (점진적 마이그레이션)
2. 라우트는 `featureRouters/{domain}Routes.js` 파일을 업데이트하여 새 pages를 가리키도록 변경
3. 레거시 `components/`, `pages/`, `utils/` 는 모두 이전 대상이며 신규 코드 작성 금지

## 주의사항

- `src/app/store/`는 현재 비어있음. 상태 관리가 필요하면 Context 또는 Zustand 도입 전 먼저 논의
- `components/common/badge-selector/index copy.js`는 임시 파일 → 리팩토링 시 삭제
- `services/` 파일은 axios 호출만 담당, 에러 처리는 호출하는 hook에서 담당
- shadcn/ui 신규 컴포넌트 추가 시 `src/shared/components/ui/`에 배치
