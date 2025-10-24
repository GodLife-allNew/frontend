import { useState, useEffect } from "react";
import { useNoticeService } from "../services/noticeService";
import { useToast } from "@/shared/components/ui/use-toast";

export const useNoticeDetail = (noticeIdx) => {
  const { getNoticeById, deleteNotice, loading: apiLoading } = useNoticeService();
  const { toast } = useToast();
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);

  /** 공지 상세 조회 */
  const fetchNoticeDetail = async () => {
    try {
      const data = await getNoticeById(noticeIdx);
      setNotice(data);
      setError(null);
    } catch (err) {
      setError("공지사항을 불러오는데 실패했습니다.");

      toast({
        title: "오류 발생",
        description: err.message || error,
        variant: "destructive",
      });
    }
  };

  /** 공지 삭제 */
  const fetchDeleteNotice = async () => {
    if (!window.confirm("정말로 이 공지사항을 삭제하시겠습니까?")) return false;

    try {
      await deleteNotice(noticeIdx);
      toast ({title: "공지사항이 삭제되었습니다.", variant: "default", });
      return true;
    } catch (err) {
      console.error(err);
      toast({
        title: "공지사항 삭제 실패",
        description: err.response?.data?.message || "서버 오류가 발생했습니다.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (noticeIdx) fetchNoticeDetail();
    // eslint 경고 무시
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noticeIdx]);

  return { notice, error, apiLoading, fetchNoticeDetail, fetchDeleteNotice };
};