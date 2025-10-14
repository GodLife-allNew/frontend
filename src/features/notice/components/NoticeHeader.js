import React from "react";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft } from "lucide-react";

/** 🔙 페이지 상단 헤더 (뒤로가기 버튼 + 제목) */
const NoticeHeader = ({ onBack }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <Button variant="ghost" className="pl-2" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        뒤로 가기
      </Button>
    </div>
  );
};

export default NoticeHeader;
