import { useState, useEffect } from "react";
import { useNoticeService } from "../services/noticeService";
import { useToast } from "@/shared/components/ui/use-toast";
import { format } from "date-fns";

/**
 * 공지사항 작성/수정 로직 전용 커스텀 훅
 */
export const useNoticeEdit = (noticeIdx, navigate) => {
  const { getNoticeById, createNotice, updateNotice, loading: apiLoading } = useNoticeService();
  const { toast } = useToast();

  const [notice, setNotice] = useState({
    noticeTitle: "",
    noticeSub: "",
    isPopup: false,
    popupStartDate: null,
    popupEndDate: null,
  });

  const [isInitialLoading, setIsInitialLoading] = useState(!!noticeIdx);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 공지사항 수정 모드일 경우 데이터 로드
  useEffect(() => {
    if (!noticeIdx) return;

    const fetchNotice = async () => {
      try {
        const data = await getNoticeById(noticeIdx);
        setNotice({
          noticeTitle: data.noticeTitle || "",
          noticeSub: data.noticeSub || "",
          isPopup: data.isPopup === "Y",
          popupStartDate: data.popupStartDate ? new Date(data.popupStartDate) : null,
          popupEndDate: data.popupEndDate ? new Date(data.popupEndDate) : null,
        });
      } catch (err) {
        toast({
          title: "공지사항 불러오기 실패",
          description: err.message || "서버 오류가 발생했습니다.",
          variant: "destructive",
        });
        navigate("/notice/list");
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchNotice();
    // eslint 의존성 배열 경고 무시
    // eslint-disable-next-line
  }, [noticeIdx]);

  const isLoading = isInitialLoading || apiLoading;

  /** 필드 변경 핸들러 */
  const handleChange = (key, value) => {
    setNotice((prev) => ({ ...prev, [key]: value }));
  };

  /** 등록 / 수정 공통 처리 */
  const handleSubmit = async (isEditMode, noticeData) => {
    setIsSubmitting(true);
    try {
      // ✅ LocalDateTime 포맷으로 변환
      const payload = {
        ...noticeData,
        isPopup: noticeData.isPopup ? "Y" : "N",
        popupStartDate: noticeData.popupStartDate ? format(noticeData.popupStartDate, "yyyy-MM-dd HH:mm:ss") : null,
        popupEndDate: noticeData.popupEndDate ? format(noticeData.popupEndDate, "yyyy-MM-dd HH:mm:ss") : null,
      };

      console.log("전송 데이터:", payload);

      if (isEditMode) {
        await updateNotice(noticeIdx, payload);
        toast({ title: "공지사항이 수정되었습니다." });
      } else {
        await createNotice(payload);
        toast({ title: "공지사항이 등록되었습니다." });
      }

      const isAdmin = JSON.parse(localStorage.getItem("userInfo"))?.roleStatus;

      if (isAdmin) {
        // 관리자용 공지사항 관리 페이지로 이동
        navigate("/adminBoard?tab=공지사항 관리");
      } else {
        // 일반 사용자는 공지사항 목록으로
        navigate("/notice/list");
      }
    } catch (err) {
      toast({
        title: `공지사항 ${isEditMode ? "수정" : "등록"} 실패`,
        description: err.message || "서버 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    notice,
    handleChange,
    handleSubmit,
    isLoading,
    isSubmitting,
  };
};
