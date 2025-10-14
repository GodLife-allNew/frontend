import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { useNavigate } from "react-router-dom";

import { useFindId } from "@/features/auth/hooks/useFindId";
import Step1Form from "../components/findId/Step1Form";
import Step2Mask from "../components/findId/Step2Mask";
import Step3Verify from "../components/findId/Step3Verify";
import Step4Result from "../components/findId/Step4Result";

const FindId = () => {
  const hook = useFindId(); // 훅에서 상태와 함수 모두 가져오기
  const navigate = useNavigate();
  

  const renderCurrentStep = () => {
    switch (hook.step) {
      case 1:
        return <Step1Form {...hook} />;
      case 2:
        return <Step2Mask {...hook} />;
      case 3:
        return <Step3Verify {...hook} />;
      case 4:
        return <Step4Result {...hook} />;
      default:
        return <Step1Form {...hook} />;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-4">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              아이디 찾기
            </CardTitle>
            <CardDescription className="text-center">
              {hook.step === 1 && "이름과 이메일을 입력하여 아이디를 찾으세요"}
              {hook.step === 2 && "아이디 확인"}
              {hook.step === 3 && "인증 코드 입력"}
              {hook.step === 4 && "전체 아이디 확인"}
            </CardDescription>
          </CardHeader>
          <CardContent>{renderCurrentStep()}</CardContent>
          {hook.step === 1 && (
            <CardFooter className="flex flex-col">
              <div className="text-center w-full">
                <span className="text-sm text-gray-500">
                  로그인 페이지로 돌아가기
                </span>{" "}
                <Button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 hover:bg-transparent font-medium bg-transparent border-none focus:outline-none shadow-none"
                  // className="text-blue-600 bg-transparent border-none hover:bg-transparent p-0 text-sm font-medium"
                  onClick={() => navigate("/user/login")}
                >
                  로그인
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default FindId;
