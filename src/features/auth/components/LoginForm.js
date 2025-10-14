import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { useToast } from "@/shared/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useLogin } from "../hooks/useLogin";

const loginFormSchema = z.object({
  userId: z.string().min(1, { message: "아이디를 입력해주세요." }),
  userPw: z.string().min(4, { message: "비밀번호는 최소 4자 이상이어야 합니다." }),
});

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast().toast;
  const navigate = useNavigate();
  const errorShown = useRef(false);
  const { isAuthenticated } = useAuth();

  const form = useForm({ resolver: zodResolver(loginFormSchema), defaultValues: { userId: "", userPw: "" } });

  const { handleLogin, loading } = useLogin();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true }); // 이미 로그인된 경우 메인페이지로  이동
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (formData) => {
    errorShown.current = false;
    try {
      const data = await handleLogin(formData);

      if (data && !errorShown.current) {
        toast({ title: "로그인 성공", description: "환영합니다!" });
        navigate("/");
        errorShown.current = true;
      }
    } catch {
      toast({ title: "로그인 실패", description: "아이디나 비밀번호를 확인해주세요" });
    }
  };

  const togglePasswordVisibility = () => setShowPassword(prev => !prev);


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-4">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              로그인
            </CardTitle>
            <CardDescription className="text-center">
              계정에 로그인하여 시작하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                  onSubmit={(e) => {
                    e.preventDefault();        // 브라우저 기본 새로고침 방지
                    form.handleSubmit(onSubmit)(e);
                  }}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>아이디</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="your ID"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="userPw"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>비밀번호</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            className="pl-10 pr-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-10 w-10 text-gray-400"
                            onClick={togglePasswordVisibility}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-blue-500"
                  disabled={loading}
                >
                  {loading ? "로그인 중..." : "로그인"}
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm">
              <Button
                type="button"
                variant="ghost"
                className="text-blue-600 hover:text-blue-800 hover:bg-transparent font-medium bg-transparent border-none focus:outline-none shadow-none"
                onClick={() => navigate("/user/find_password")}
              >
                비밀번호를 잊으셨나요?
              </Button>
            </div>
            <div className="mt-0 text-center text-sm">
              <Button
                type="button"
                variant="ghost"
                className="text-blue-600 hover:text-blue-800 hover:bg-transparent font-medium bg-transparent border-none focus:outline-none shadow-none"
                onClick={() => navigate("/user/find_id")}
              >
                아이디를 잊으셨나요?
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-center w-full">
              <span className="text-sm text-gray-500">계정이 없으신가요?</span>{" "}
              <Button
                type="button"
                variant="ghost"
                className="text-blue-600 hover:text-blue-800 hover:bg-transparent font-medium bg-transparent border-none focus:outline-none shadow-none"
                onClick={() => navigate("/user/signup")}
              >
                회원가입
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;