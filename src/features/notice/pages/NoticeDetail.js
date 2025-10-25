import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, Calendar, Edit2, Clock, Trash2, RefreshCcw } from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import { useNoticeDetail } from "../hooks/useNoticeDetail";
import NoticeLoading from "../components/NoticeLoading";
import { useDateFormatter } from "@/shared/hooks/formatter/useDateFormatter";

const NoticeDetail = () => {
  const { noticeIdx } = useParams();
  const navigate = useNavigate();
  const isAdmin = JSON.parse(localStorage.getItem("userInfo"))?.roleStatus;
  const { notice, error, apiLoading, fetchNoticeDetail, fetchDeleteNotice } = useNoticeDetail(noticeIdx);
  const { formatDate } = useDateFormatter(); // ✅ 공통 훅 사용

  const handleGoBack = () => navigate("/notice/list");
  const handleEdit = () => navigate(`/notice/edit/${notice.noticeIdx}`);
  const handleDelete = async () => {
    const success = await fetchDeleteNotice();
    if (success) navigate("/notice/list");
  };

  if (apiLoading) return <NoticeLoading />;

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-red-500 mb-2">⚠️ {error}</p>
        <Button variant="outline" onClick={fetchNoticeDetail}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          다시 시도
        </Button>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="mb-2">공지사항을 찾을 수 없습니다</p>
        <Button variant="outline" onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          목록으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" className="mb-6 pl-2" onClick={handleGoBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        목록으로 돌아가기
      </Button>

      <Card className="overflow-hidden border shadow-sm">
        <CardHeader className="pb-4 pt-6 px-6">
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between flex-wrap">
              <div className="flex items-center">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700 ring-1 ring-inset ring-blue-700/10 mr-2">
                  No.{notice.noticeIdx}
                </span>
              </div>

              {/* ✅ 날짜 표시 영역 */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center text-sm text-muted-foreground mt-2 sm:mt-0">
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  <span>{formatDate(notice.noticeDate)}</span>
                </div>

                {notice.noticeModify && notice.noticeDate !== notice.noticeModify && (
                  <div className="flex items-center sm:ml-4 mt-1 sm:mt-0">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>{formatDate(notice.noticeModify)} (수정됨)</span>
                  </div>
                )}
              </div>
            </div>

            <CardTitle className="text-2xl font-bold mt-2">{notice.noticeTitle}</CardTitle>

            <div className="flex items-center mt-3">
              <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs text-indigo-700 font-medium">
                {notice.writeName ? notice.writeName.charAt(0) : "?"}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-600">{notice.writeName || "알 수 없음"}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 py-4 border-t border-b">
          <ReactQuill
            value={notice.noticeSub || ""}
            readOnly
            theme="snow"
            modules={{ toolbar: false }}
            style={{ border: "none", padding: 0 }}
          />
        </CardContent>

        {isAdmin && (
          <CardFooter className="flex justify-end gap-2 py-6 px-6">
            <Button variant="outline" onClick={handleEdit}>
              <Edit2 className="mr-2 h-4 w-4" />
              수정
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              삭제
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default NoticeDetail;
