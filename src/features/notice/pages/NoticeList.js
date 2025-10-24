import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Clock } from "lucide-react";
import DOMPurify from "dompurify";

import { useNoticeList } from "../hooks/useNoticeList";
import { useDateFormatter } from "@/shared/hooks/formatter/useDateFormatter";
import NoticePagination from "../components/NoticePagination";

const NoticeList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 10;
  const navigate = useNavigate();

  const { notices, totalPages, isLoading, error, fetchNotices } = useNoticeList();
  const { formatDate } = useDateFormatter();

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const roleStatus = userInfo?.roleStatus || false;

  useEffect(() => {
    fetchNotices(currentPage, pageSize);
    // eslint 경고 무시
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setSearchParams({ page: newPage.toString() });
    }
  };

  const handleCreateNotice = () => navigate("/notice/create");
  const handleViewNotice = (idx) => navigate(`/notice/detail/${idx}`);

  // 수정된 날짜 또는 등록일 반환
  const getDisplayDate = (notice) => {
    const isModified =
      notice.noticeModify && notice.noticeDate !== notice.noticeModify;
    return {
      date: formatDate(isModified ? notice.noticeModify : notice.noticeDate, "YYYY.MM.DD"),
      isModified,
    };
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">공지사항</h1>
        <p className="text-muted-foreground">중요한 안내 및 업데이트 사항을 확인하세요</p>
      </div>

      <div className="flex justify-end mb-6">
        {roleStatus && (
          <Button
            onClick={handleCreateNotice}
            className="bg-primary hover:bg-primary/90 text-white font-medium"
          >
            공지사항 작성
          </Button>
        )}
      </div>

      <Card className="overflow-hidden border-0 shadow-md">
        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-muted-foreground">공지사항을 불러오는 중...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-60 p-6">
            <div className="text-center">
              <p className="text-red-500 text-lg mb-2">⚠️ 오류가 발생했습니다</p>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </div>
        ) : notices.length === 0 ? (
          <div className="flex justify-center items-center h-60 p-6">
            <div className="text-center">
              <p className="text-lg mb-2">📝 등록된 공지사항이 없습니다</p>
              <p className="text-muted-foreground">곧 새로운 공지사항이 등록될 예정입니다</p>
            </div>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {notices.map((notice) => {
                const displayDate = getDisplayDate(notice);
                return (
                  <div
                    key={notice.noticeIdx}
                    className="cursor-pointer p-6 transition-colors hover:bg-gray-50"
                    onClick={() => handleViewNotice(notice.noticeIdx)}
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-1">
                      {/* 제목 */}
                      <div className="mb-1 md:mb-0 md:flex-1 min-w-0">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700 ring-1 ring-inset ring-blue-700/10 mr-2">
                          No.{notice.noticeIdx}
                        </span>
                        <h3 className="text-lg font-semibold truncate">
                          {notice.noticeTitle}
                        </h3>
                      </div>

                      {/* 날짜 (항상 수평 정렬) */}
                      <time className="text-xs text-muted-foreground flex items-center justify-end">
                        {displayDate.isModified && <Clock className="mr-1 h-3 w-3" />}
                        {displayDate.date}
                        {displayDate.isModified && <span className="ml-1 text-xs">(수정됨)</span>}
                      </time>
                    </div>

                    <div className="flex items-center mt-2">
                      <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs text-indigo-700 font-medium">
                        {notice.writeName ? notice.writeName.charAt(0) : "?"}
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-600">
                        {notice.writeName || "알 수 없음"}
                      </span>
                    </div>

                    <div className="mt-3 relative">
                      <p
                        className="text-sm text-muted-foreground line-clamp-2 leading-relaxed pr-16"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(notice.noticeSub || ""),
                        }}
                      />
                      {notice.noticeSub && notice.noticeSub.length > 100 && (
                        <div className="absolute bottom-0 right-0 bg-gradient-to-l from-white via-white to-transparent w-20 h-full flex items-end justify-end">
                          <span className="text-xs text-blue-500 px-2 py-1">
                            더보기
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ✅ 페이지네이션 컴포넌트 사용 */}
            <NoticePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </Card>
    </div>
  );
};

export default NoticeList;
