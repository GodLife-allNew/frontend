// src/shared/hooks/formatter/useDateFormatter.js
import { useCallback } from "react";

/**
 * 날짜를 다양한 형식으로 변환하는 훅
 * @returns {Object} formatDate 함수
 */
export const useDateFormatter = () => {
  /**
   * 날짜 문자열을 지정된 포맷으로 변환
   * @param {string|Date|number} dateInput - 날짜 문자열, Date 객체, 또는 timestamp
   * @param {string} format - 출력 형식 ("YYYY.MM.DD HH:mm" | "YYYY-MM-DD" | "YYYY.MM.DD")
   * @returns {string} 포맷된 날짜 문자열
   */
  const formatDate = useCallback((dateInput, format = "YYYY.MM.DD HH:mm") => {
    if (!dateInput) return "";

    try {
      const date = new Date(dateInput);
      if (isNaN(date)) return String(dateInput);

      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      const h = String(date.getHours()).padStart(2, "0");
      const min = String(date.getMinutes()).padStart(2, "0");

      switch (format) {
        case "YYYY-MM-DD":
          return `${y}-${m}-${d}`;
        case "YYYY.MM.DD":
          return `${y}.${m}.${d}`;
        case "YYYY.MM.DD HH:mm":
        default:
          return `${y}.${m}.${d} ${h}:${min}`;
      }
    } catch {
      return String(dateInput);
    }
  }, []);

  return { formatDate };
};
