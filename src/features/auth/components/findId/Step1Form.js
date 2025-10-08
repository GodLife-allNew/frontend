import React from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { User, Mail } from "lucide-react";

const Step1Form = ({ userName, setUserName, userEmail, setUserEmail, findUserId, loading, navigate }) => (
  <form onSubmit={(e) => { e.preventDefault(); findUserId(); }} className="space-y-4">
    <div className="relative">
      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      <Input
        placeholder="이름"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        className="pl-10"
        disabled={loading}
      />
    </div>

    <div className="relative">
      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      <Input
        placeholder="이메일"
        value={userEmail}
        onChange={(e) => setUserEmail(e.target.value)}
        className="pl-10"
        disabled={loading}
        type="email"
      />
    </div>

    <Button type="submit" className="w-full bg-blue-500" disabled={loading}>
      {loading ? "찾는 중..." : "아이디 찾기"}
    </Button>

    <div className="mt-4 text-center text-sm">
      <button
        type="button"
        className="text-blue-600 hover:text-blue-800 font-medium bg-transparent border-none p-0"
        onClick={() => navigate("/user/find_password")}
      >
        비밀번호를 잊으셨나요?
      </button>
    </div>
  </form>
);

export default Step1Form;
