/**
 * localStorage의 accessToken을 디코딩하여 payload 반환
 * 외부 라이브러리 없이 atob 사용
 */
export const decodeJwtPayload = () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;

    const base64Payload = token.split(".")[1];
    if (!base64Payload) return null;

    // base64url → base64 변환 후 디코딩
    const base64 = base64Payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

/**
 * JWT의 role claim에서 authorityIdx 추출
 * 실패 시 1(일반 유저) 반환
 */
export const getAuthorityIdx = () => {
  const payload = decodeJwtPayload();
  if (!payload) return 1;

  const role = payload.role;
  if (!role) return 1;

  const idx = parseInt(role, 10);
  return isNaN(idx) ? 1 : idx;
};
