import React from "react";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, Eye } from "lucide-react";

const Step2Mask = ({ foundUserId, requestVerificationCode, loading, navigate, setStep, setFoundUserId, setVerificationCode }) => (
  <div className="space-y-4">
    <div className="border p-4 rounded-md bg-gray-50 text-center">
      <p className="text-sm text-gray-500 mb-2">회원님의 아이디</p>
      <div className="font-bold text-lg flex items-center justify-center">
        <span className="mr-2">{foundUserId}</span>
      </div>
    </div>

    <p className="text-sm text-gray-600 text-center">
      아이디의 일부는 보안을 위해 가려져 있습니다.
    </p>

    <Button onClick={requestVerificationCode} className="w-full bg-blue-500" disabled={loading}>
      <Eye className="h-4 w-4 mr-2" /> 아이디 상세 찾기
    </Button>

    <div className="flex space-x-2 mt-4">
      <Button onClick={() => navigate("/user/login")} className="flex-1 bg-blue-500">로그인</Button>
      <Button onClick={() => navigate("/user/find_password")} className="flex-1" variant="outline">비밀번호 찾기</Button>
    </div>

    <Button
      type="button"
      onClick={() => {
        setStep(1);
        setFoundUserId("");
        setVerificationCode("");
      }}
      variant="ghost"
      className="w-full mt-2"
    >
      <ArrowLeft className="h-4 w-4 mr-2" /> 다시 찾기
    </Button>
  </div>
);

export default Step2Mask;
