import { useCallback } from "react";

/**
 * 휴대폰 번호 자동 하이픈(-) 포맷터
 * 예: 01012345678 → 010-1234-5678
 */
export const usePhoneFormatter = () => {
  const formatPhoneNumber = useCallback((value) => {
    if (!value) return "";
    const onlyNums = value.replace(/[^0-9]/g, ""); // 숫자만 추출

    if (onlyNums.length < 4) {
      return onlyNums;
    } else if (onlyNums.length < 8) {
      return `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
    } else {
      return `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 7)}-${onlyNums.slice(7, 11)}`;
    }
  }, []);

  return { formatPhoneNumber };
};
