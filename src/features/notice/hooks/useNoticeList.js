import { useState, useCallback } from "react";
import { useNoticeService } from "../services/noticeService";

export const useNoticeList = () => {
  const { getNoticeList, loading } = useNoticeService();
  const [notices, setNotices] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);

  const fetchNotices = useCallback(
    async (page = 1, size = 10) => {
      setError(null);
      try {
        const { data, currentPage: fetchedPage, totalPages: fetchedTotalPages } =
          await getNoticeList(page, size);

        setNotices(data || []);
        setCurrentPage(fetchedPage || page);
        setTotalPages(fetchedTotalPages || 1);
      } catch (err) {
        setError(err.message || "공지사항을 불러오는데 실패했습니다.");
        setNotices([]);
        setCurrentPage(1);
        setTotalPages(1);
      }
    },
    [getNoticeList]
  );

  return { notices, currentPage, totalPages, isLoading: loading, error, fetchNotices };
};
