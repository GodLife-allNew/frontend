import { useMemo } from "react";
import { getAuthorityIdx } from "@/shared/utils/jwtUtils";

/**
 * 페이지별 접근 가능한 authorityIdx Set
 *
 * 권한 레벨:
 *   1 = 일반유저, 2 = 인턴, 3 = 매니저, 4 = 고객서비스,
 *   5 = DB관리자, 6 = 중간관리자, 7 = 책임관리자
 */
const PAGE_PERMISSIONS = {
  "추천 루틴관리": new Set([3, 6, 7]),
  "챌린지 관리":   new Set([3, 6, 7]),
  "컴포넌트 관리": new Set([5, 6, 7]),
  "유저 관리":     new Set([2, 3, 6, 7]),
  "신고처리":      new Set([2, 3, 6, 7]),
  "권한관리":      new Set([7]),
  "FAQ 관리":      new Set([3, 4, 6, 7]),
  "공지사항 관리": new Set([3, 4, 6, 7]),
  "1:1 문의":      new Set([3, 4, 6, 7]),
};

/**
 * 관리자 페이지 권한 체크 훅
 * @returns {{ authorityIdx: number, hasPermission: (pageName: string) => boolean, firstAllowedPage: string|null }}
 */
const useAdminPermission = () => {
  const authorityIdx = useMemo(() => getAuthorityIdx(), []);

  const hasPermission = (pageName) => {
    const allowed = PAGE_PERMISSIONS[pageName];
    if (!allowed) return false;
    return allowed.has(authorityIdx);
  };

  const firstAllowedPage = useMemo(() => {
    const pageOrder = [
      "추천 루틴관리",
      "챌린지 관리",
      "컴포넌트 관리",
      "유저 관리",
      "신고처리",
      "권한관리",
      "FAQ 관리",
      "공지사항 관리",
      "1:1 문의",
    ];
    return pageOrder.find((p) => PAGE_PERMISSIONS[p].has(authorityIdx)) || null;
  }, [authorityIdx]);

  return { authorityIdx, hasPermission, firstAllowedPage };
};

export default useAdminPermission;
