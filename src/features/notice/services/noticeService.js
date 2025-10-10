import { useApi } from "@/shared/hooks/useApi";

/**
 * 공지사항 관련 API 요청 서비스
 */
export const useNoticeService = () => {
  const { get, post, patch, loading } = useApi();

  /** 공지사항 상세 조회 */
  const getNoticeById = async (noticeIdx) => {
    const res = await get(`/notice/${noticeIdx}`);
    return res.data?.message ?? res.data;
  };

  /** 공지사항 등록 */
  const createNotice = async (noticeData) => {
    await post("/notice/admin/create", noticeData);
  };

  /** 공지사항 수정 */
  const updateNotice = async (noticeIdx, noticeData) => {
    await patch(`/notice/admin/${noticeIdx}`, noticeData);
  };

  return { getNoticeById, createNotice, updateNotice, loading };
};
