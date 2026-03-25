# Feature 리팩토링 스킬

주어진 도메인의 레거시 코드를 `features/{domain}/` 구조로 리팩토링한다.

## 사용법
```
/refactor-feature {도메인명}
예: /refactor-feature challenge
```

## 실행 절차

### 1단계: 현황 파악
다음 레거시 경로에서 해당 도메인의 코드를 전부 파악한다:
- `src/pages/{Domain}/` — 페이지 컴포넌트
- `src/components/{domain}/` — 도메인 컴포넌트
- `src/utils/` — 관련 유틸리티

현재 라우트 설정도 확인한다:
- `src/app/router/featureRouters/{domain}Routes.js`

### 2단계: 분류
파악한 파일들을 다음 기준으로 분류한다:

| 분류 | 이전 위치 |
|------|---------|
| **pages/**: 라우트 대상 페이지 컴포넌트 | `src/pages/{Domain}/*.js` |
| **components/**: 도메인 전용 UI 컴포넌트 | `src/components/{domain}/*.js` |
| **hooks/**: 비즈니스 로직, 상태 관리 | 컴포넌트 내 인라인 로직 → 분리 |
| **services/**: axios API 호출 함수 | 컴포넌트/hook 내 axios 호출 → 분리 |

**shared로 이동할 것:**
- 2개 이상의 도메인에서 공통으로 쓰는 컴포넌트나 hook → `src/shared/`로 이동

### 3단계: 파일 작성 순서
1. `services/{domain}Service.js` — API 호출 함수 먼저 분리
2. `hooks/use{기능}.js` — 비즈니스 로직 hook 작성 (service 함수 사용)
3. `components/*.js` — UI 컴포넌트 이전/정리
4. `pages/*.js` — 페이지 컴포넌트 작성 (hook + component 조합)
5. `index.js` — pages만 export

### 4단계: 라우트 업데이트
`src/app/router/featureRouters/{domain}Routes.js`에서
import 경로를 새 `features/{domain}` 모듈로 변경한다.

### 5단계: 동작 확인 체크리스트
- [ ] 기존 라우트 경로가 그대로 동작하는가
- [ ] API 호출이 정상적으로 동작하는가 (`axiosInstance` 사용 여부)
- [ ] 인증이 필요한 페이지에 AuthContext 연동 여부
- [ ] 레거시 파일 import가 남아있지 않은가

### 6단계: 레거시 정리
리팩토링 완료 후 레거시 파일 삭제 여부를 사용자에게 확인한다.
삭제 대상:
- `src/pages/{Domain}/`
- `src/components/{domain}/`

---

## 코드 패턴 참고

### services 패턴
```js
import axiosInstance from '@/shared/api/axiosInstance';

export const fetch{Domain}List = async (params) => {
  const response = await axiosInstance.get('/api/{domain}', { params });
  return response.data;
};

export const create{Domain} = async (data) => {
  const response = await axiosInstance.post('/api/{domain}', data);
  return response.data;
};
```

### hooks 패턴
```js
import { useState, useEffect, useCallback } from 'react';
import { fetch{Domain}List } from '../services/{domain}Service';
import { useToast } from '@/shared/components/ui/use-toast';

export const use{Domain}List = () => {
  const { toast } = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetch{Domain}List();
      setData(result);
    } catch (err) {
      toast({ variant: 'destructive', description: '불러오기 실패' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, reload: load };
};
```

### index.js 패턴
```js
export { default as {Domain}ListPage } from './pages/{Domain}List';
export { default as {Domain}DetailPage } from './pages/{Domain}Detail';
```
