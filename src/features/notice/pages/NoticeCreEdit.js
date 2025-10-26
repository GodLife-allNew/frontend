import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useNavigate, useParams } from "react-router-dom";
import { useNoticeEdit } from "../hooks/useNoticeEdit";
import NoticeHeader from "../components/NoticeHeader";
import NoticeForm from "../components/NoticeForm";
import NoticeLoading from "../components/NoticeLoading";

const NoticeCreateEdit = () => {
  const { noticeIdx } = useParams();
  const isEditMode = !!noticeIdx;
  const navigate = useNavigate();

  const isAdmin = JSON.parse(localStorage.getItem("userInfo"))?.roleStatus || false;

  const { notice, handleChange, handleSubmit, isLoading, isSubmitting } = useNoticeEdit(noticeIdx, navigate);

  if (isLoading) return <NoticeLoading />;

  return (
    <div className="container mx-auto py-8">
      <NoticeHeader onBack={() => navigate(-1)} />

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">공지사항 {isEditMode ? "수정" : "작성"}</CardTitle>
        </CardHeader>
        <CardContent>
          <NoticeForm
            isEditMode={isEditMode}
            notice={notice}
            handleChange={handleChange}
            handleSubmit={(mode, data) => handleSubmit(mode, data)}
            isSubmitting={isSubmitting}
            navigate={navigate}
            isAdminMode={isAdmin}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default NoticeCreateEdit;
