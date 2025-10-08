import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";


import { useFindPassword } from "../hooks/useFindPassword";
import Step1Form from "../components/findPassword/Step1Form";
import Step2Verify from "../components/findPassword/Step2Verify";
import Step3Reset from "../components/findPassword/Step3Reset";

const FindPassword = () => {
  const hook = useFindPassword();
  const navigate = useNavigate();

  const renderCurrentStep = () => {
    switch (hook.step) {
      case 1:
        return <Step1Form {...hook} />;
      case 2:
        return <Step2Verify {...hook} />;
      case 3:
        return <Step3Reset {...hook} />;
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
              비밀번호 찾기
            </CardTitle>
            <CardDescription className="text-center">
              {hook.step === 1 && "이메일을 입력하여 비밀번호를 찾으세요"}
              {hook.step === 2 && "인증 코드 입력"}
              {hook.step === 3 && "새 비밀번호 설정"}
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

export default FindPassword;