import React from "react";
import { Loader2 } from "lucide-react";

/** ⏳ 공지사항 로딩 시 표시되는 컴포넌트 */
const NoticeLoading = () => (
  <div className="flex justify-center items-center h-60">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <p className="ml-3 text-muted-foreground">공지사항을 불러오는 중...</p>
  </div>
);

export default NoticeLoading;
