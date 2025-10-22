import React, { useRef } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Switch } from "@/shared/components/ui/switch";
import { Loader2 } from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import DateSelector from "./DateSelector";

/** 📝 공지사항 작성/수정 폼 */
const NoticeForm = ({
  isEditMode,
  notice,
  handleChange,
  handleSubmit,
  isSubmitting,
  navigate,
}) => {
  const { noticeTitle, noticeSub, isPopup, popupStartDate, popupEndDate } = notice;

  const quillRef = useRef(null);

  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit(isEditMode, notice);
  };

  // React-Quill 설정
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["link", "image"],
      ["blockquote", "code-block"],
      [{ align: [] }],
      [{ color: [] }, { background: [] }],
      ["clean"],
    ],
  };

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "blockquote",
    "code-block",
    "align",
    "color",
    "background",
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* 제목 */}
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium"> 제목 </label>
      
        <Input
          id="title"
          value={noticeTitle}
          onChange={(e) => handleChange("noticeTitle", e.target.value)}
          placeholder="공지사항 제목을 입력하세요"
        />
      </div>
      {/* 내용 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">내용</label>
        <div className="min-h-[400px] border rounded-md">
        <ReactQuill
          value={noticeSub}
          onChange={(v) => handleChange("noticeSub", v)}
          modules={quillModules}
          formats={quillFormats}
          placeholder="공지사항 내용을 입력하세요"
          style={{ height: "400px", marginBottom: "42px" }}
          ref={quillRef}
        />
        </div>
      </div>

      {/* 팝업 설정 */}
      <div className="space-y-4 border rounded-md p-4 bg-slate-50">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">팝업으로 표시</label>
            <p className="text-sm text-muted-foreground">이 공지사항을 팝업창으로 표시합니다.</p>
          </div>
          <Switch checked={isPopup} onCheckedChange={(val) => handleChange("isPopup", val)} />
        </div>

        {isPopup && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateSelector
              label="팝업 시작일"
              date={popupStartDate}
              onSelect={(d) => handleChange("popupStartDate", d)}
            />
            <DateSelector
              label="팝업 종료일"
              date={popupEndDate}
              onSelect={(d) => handleChange("popupEndDate", d)}
              minDate={popupStartDate}
            />

            <p className="text-xs text-muted-foreground">
              설정된 기간 동안 사용자에게 공지사항 팝업이 표시됩니다.
            </p>
          </div>
        )}
      </div>

      {/* 버튼 */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditMode ? "수정 중..." : "등록 중..."}
            </>
          ) : isEditMode ? (
            "수정하기"
          ) : (
            "등록하기"
          )}
        </Button>
      </div>
    </form>
  );
};

export default NoticeForm;