import React from "react";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Step4Result = ({ foundUserId, navigate, setStep, setFoundUserId }) => (
  <div className="space-y-4">
    <div className="border p-4 rounded-md bg-gray-50 text-center">
      <p className="text-sm text-gray-500 mb-2">회원님의 전체 아이디</p>
      <div className="font-bold text-lg flex items-center justify-center">
        <span className="mr-2">{foundUserId}</span>
      </div>
    </div>

    <div className="flex space-x-2">
      <Button onClick={() => navigate("/user/login")} className="flex-1 bg-blue-500">로그인</Button>
      <Button onClick={() => navigate("/user/find-password")} className="flex-1" variant="outline">비밀번호 찾기</Button>
    </div>

    <Button
      onClick={() => {
        setStep(1);
        setFoundUserId("");
      }}
      variant="ghost"
      className="w-full mt-2"
    >
      <ArrowLeft className="h-4 w-4 mr-2" /> 다시 찾기
    </Button>
  </div>
);

export default Step4Result;
