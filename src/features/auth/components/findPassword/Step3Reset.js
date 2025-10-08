import React from "react";
import { ArrowLeft, Key } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";

const Step3Reset = ({ changePassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword, setStep, loading, }) => (

  <form onSubmit={changePassword} className="space-y-4">
    <p className="text-sm text-gray-600 mb-2">
      새로운 비밀번호를 입력해주세요.
    </p>

    <div className="relative">
      <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      <Input
        type="password"
        placeholder="새 비밀번호"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="pl-10"
        disabled={loading}
      />
    </div>

    <div className="relative">
      <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      <Input
        type="password"
        placeholder="새 비밀번호 확인"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="pl-10"
        disabled={loading}
      />
    </div>

    <Button type="submit" className="w-full bg-blue-500" disabled={loading}>
      {loading ? "변경 중..." : "비밀번호 변경"}
    </Button>

    <Button
      type="button"
      onClick={() => {
        setStep(1);
        setNewPassword("");
        setConfirmPassword("");
      }}
      variant="outline"
      className="w-full"
      disabled={loading}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      처음으로
    </Button>
  </form>

);

export default Step3Reset;
