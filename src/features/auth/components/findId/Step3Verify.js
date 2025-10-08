import React from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { ArrowLeft, Key } from "lucide-react";

const Step3Verify = ({ verificationCode, setVerificationCode, verifyCode, loading, setStep }) => (
  <form
    onSubmit={(e) => { e.preventDefault(); verifyCode(); }}
    className="space-y-4"
  >
    <p className="text-sm text-gray-600 mb-2">
      이메일로 전송된 인증 코드를 입력해주세요.
    </p>

    <div className="relative">
      <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder="인증 코드"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value)}
        className="pl-10"
        disabled={loading}
      />
    </div>

    <Button type="submit" className="w-full bg-blue-500" disabled={loading}>
      {loading ? "확인 중..." : "인증 확인"}
    </Button>

    <Button
    type="button"
      onClick={() => setStep(2)}
      variant="outline"
      className="w-full"
      disabled={loading}
    >
      <ArrowLeft className="h-4 w-4 mr-2" /> 뒤로 가기
    </Button>
  </form>
);

export default Step3Verify;
