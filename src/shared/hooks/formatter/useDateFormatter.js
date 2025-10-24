import { useCallback } from "react";

/**
 * 날짜를 다양한 형식으로 변환하는 훅
 * @returns {Object} formatDate 함수
 */
export const useDateFormatter = () => {
  /**
   * 날짜 문자열을 지정된 포맷으로 변환
   * @param {string|Date|number} dateInput - 날짜 문자열, Date 객체, 또는 timestamp
   * @param {string} format - 출력 형식
   * @returns {string} 포맷된 날짜 문자열
   */
  const formatDate = useCallback((dateInput, format = "YYYY.MM.DD HH:mm:ss") => {
    if (!dateInput) return "";

    try {
      const date = new Date(dateInput);
      if (isNaN(date)) return String(dateInput);

      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      const h = String(date.getHours()).padStart(2, "0");
      const min = String(date.getMinutes()).padStart(2, "0");
      const s = String(date.getSeconds()).padStart(2, "0");

      switch (format) {
        // 🔹 날짜만
        case "YYYY-MM-DD":
          return `${y}-${m}-${d}`;
        case "YYYY.MM.DD":
          return `${y}.${m}.${d}`;
        case "YYYY/MM/DD":
          return `${y}/${m}/${d}`;
        case "MM-DD":
          return `${m}-${d}`;
        case "MM.DD":
          return `${m}.${d}`;
        case "YYYY년 MM월 DD일":
          return `${y}년 ${m}월 ${d}일`;

        // 🔹 시간만
        case "HH:mm":
          return `${h}:${min}`;
        case "HH:mm:ss":
          return `${h}:${min}:${s}`;
        case "HH시 mm분":
          return `${h}시 ${min}분`;

        // 🔹 날짜 + 시간
        case "YYYY-MM-DD HH:mm":
          return `${y}-${m}-${d} ${h}:${min}`;
        case "YYYY-MM-DD HH:mm:ss":
          return `${y}-${m}-${d} ${h}:${min}:${s}`;
        case "YYYY.MM.DD HH:mm":
          return `${y}.${m}.${d} ${h}:${min}`;
        case "YYYY.MM.DD HH:mm:ss":
          return `${y}.${m}.${d} ${h}:${min}:${s}`;
        case "YYYY/MM/DD HH:mm":
          return `${y}/${m}/${d} ${h}:${min}`;
        case "YYYY/MM/DD HH:mm:ss":
          return `${y}/${m}/${d} ${h}:${min}:${s}`;
        case "YYYY년 MM월 DD일 HH시 mm분":
          return `${y}년 ${m}월 ${d}일 ${h}시 ${min}분`;

        // 🔹 요일까지 포함
        case "YYYY.MM.DD (ddd)":
          return `${y}.${m}.${d} (${["일", "월", "화", "수", "목", "금", "토"][date.getDay()]})`;
        case "YYYY.MM.DD (ddd) HH:mm":
          return `${y}.${m}.${d} (${["일", "월", "화", "수", "목", "금", "토"][date.getDay()]}) ${h}:${min}`;

        // 기본값
        default:
          return `${y}.${m}.${d} ${h}:${min}:${s}`;
      }
    } catch {
      return String(dateInput);
    }
  }, []);

  return { formatDate };
};
