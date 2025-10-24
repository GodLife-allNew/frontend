import { useApi } from "@/shared/hooks/useApi";

/**
 * 공지사항 관련 API 요청 서비스
 */
export const useNoticeService = () => {
  const { get, post, patch, del, loading } = useApi();

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

  /** 공지사항 삭제 */
  const deleteNotice = async (noticeIdx) => {
    await del(`/notice/admin/${noticeIdx}`);
  };

  /** 공지사항 리스트 */
  const getNoticeList = async (page, size) => {
    const { data: {data, currentPage, totalPages, }} = await get(`/notice?page=${page}&size=${size}`);
    return { data, currentPage, totalPages };
  };

  return { getNoticeById, createNotice, updateNotice, deleteNotice, getNoticeList, loading };
};
