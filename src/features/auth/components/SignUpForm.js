import { useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/shared/components/ui/input";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/shared/components/ui/use-toast";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/shared/components/ui/form";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

// 카테고리 조회 훅
import { useCategories } from "@/shared/hooks/categories/useCategories";
// 회원가입 유효성 검증 훅
import { useSignUpValid } from "../hooks/useSignUpValid";
// 회원가입 요청 훅
import { useSignUp } from "../hooks/useSignUp";
// 휴대폰 번호 포맷팅 훅
import { usePhoneFormatter } from "@/shared/hooks/formatter/usePhoneFormatter";

//유효성 검사 스키마
const signupSchema = z
  .object({
    userId: z.string(),
    userPw: z.string(),
    userPwConfirm: z.string(),
    userName: z.string(),
    userNick: z.string(),
    userEmail: z.string().email(),
    userGender: z.enum(["1", "2", "3"]),
    jobIdx: z.string(),
    userPhone: z.string(),
    targetIdx: z.string(),
    verificationCode: z.string(),
  })
  .refine((data) => data.userPw === data.userPwConfirm, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["userPwConfirm"],
  });

const SignUpForm = () => {
  const userIdInputRef = useRef(null); // 아이디 입력란 Ref
  const userPwInputRef = useRef(null);
  const userPwConfirmInputRef = useRef(null);
  const userNameInputRef = useRef(null);
  const userNickInputRef = useRef(null);
  const userEmailInputRef = useRef(null);
  const jobIdxInputRef = useRef(null);
  const targetIdxInputRef = useRef(null);
  const userPhoneInputRef = useRef(null);
  const userGenderInputRef = useRef(null);
  const emailCheckInputRef = useRef(null);
  const navigate = useNavigate();

  // 직업 카테고리 조회
  const { categories: jobCategories } = useCategories("job");
  // console.log("회원가입 폼에서의 직업 카테고리",jobCategories);
  // 목표 카테고리 조회
  const { categories: targetCategories } = useCategories("target");
  // console.log("회원가입 폼에서의 목표 카테고리",targetCategories);

  // 휴대폰 번호 자동 포맷 객체
  const { formatPhoneNumber } = usePhoneFormatter();

  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      userId: "",
      userPw: "",
      userPwConfirm: "",
      userName: "",
      userNick: "",
      userEmail: "",
      userGender: "",
      jobIdx: "",
      targetIdx: "",
      userPhone: "",
      verificationCode: "",
    },
  });

  const { handleSubmit } = form;



  // 에러가 있는 필드 스타일 적용
  const getInputStyle = (fieldName) => {
    return form.formState.errors[fieldName]
      ? { borderColor: "#f87171", outline: "none" }
      : {};
  };

  // 폼 제출 시 에러가 있는 필드에 자동 포커스 - 수정
  useEffect(() => {
    const errors = form.formState.errors;
    if (Object.keys(errors).length > 0) {
      const firstError = Object.keys(errors)[0];

      switch (firstError) {
        case "userId":
          userIdInputRef.current?.focus();
          break;
        case "userPw":
          userPwInputRef.current?.focus();
          break;
        case "userPwConfirm":
          userPwConfirmInputRef.current?.focus();
          break;
        case "userName":
          userNameInputRef.current?.focus();
          break;
        case "userNick":
          userNickInputRef.current?.focus();
          break;
        case "userEmail":
          userEmailInputRef.current?.focus();
          break;
        case "userPhone":
          userPhoneInputRef.current?.focus();
          break;
        default:
          // Select나 Radio 같은 필드는 토스트 메시지로 표시
          if (errors[firstError].message) {
            // 하나의 오류 메시지만 표시
            toast({
              title: "입력 오류",
              description: errors[firstError].message,
              variant: "destructive",
            });
          }
      }
    }
    // eslint 경고 무시
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.formState.submitCount]); // 매번 렌더링마다 체크하지 않고 제출할 때만 체크

  /**
   * 비밀번호 일치 여부 검증
   * @returns void
   */
  const checkPassdMatch = () => {
    // form.getValues()로 현재 입력된 값을 가져옵니다.
    const password = form.getValues("userPw").trim();
    const confirmPassword = form.getValues("userPwConfirm").trim();

    if (!password || !confirmPassword) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
    } else {
      alert("비밀번호가 일치합니다.");
    }
  };

  /**
   * 아이디, 이메일 검증 요청 및 확인 커스텀 훅
   */
  const {
    checkDuplicateId,
    requestEmailVerification,
    verifyEmailCode,
    isIdValid,
    isEmailVerified,
    loading: validationLoading,
  } = useSignUpValid(form, { userIdInputRef, userEmailInputRef, emailCheckInputRef, });

  /**
   * 회원가입 요청 커스텀 훅
   */
  const { onSubmit: handleSignUpSubmit, loading: signUpLoading, serverError } = useSignUp({
    form, // ← 여기서 form 전달 필수
    refs: {
      userIdInputRef,
      userPwInputRef,
      userPwConfirmInputRef,
      userNameInputRef,
      userNickInputRef,
      userEmailInputRef,
      jobIdxInputRef,
      targetIdxInputRef,
      userPhoneInputRef,
      userGenderInputRef,
    },
    isEmailVerified: isEmailVerified,
    isIdValid: isIdValid,
  });


  return (
    <div className="h-screen bg-gray-200 flex items-center justify-center">
      <div className="bg-white p-6 rounded-3xl shadow-md w-full max-w-sm h-[500px]">
        <ScrollArea className="h-[450px] pr-2">
          <div className="flex justify-between">
            <span className="font-semibold">
              Welcome to <span className="text-blue-500">LOREM</span>
            </span>
            <div className="flex flex-col space-x-4 pt-2">
              <span className="text-gray-400 text-xs">계정이 있으신가요?</span>
              <Button
                type="button"
                className="text-xs bg-transparent border-none p-0 h-3 pt-3 text-gray-400 hover:text-blue-500 hover:bg-white focus:outline-none shadow-none ring-0"
                onClick={() => navigate("/user/login")}
              >
                로그인하러 가기
              </Button>
            </div>
          </div>

          <div className="pb-7 text-4xl font-bold">Sign up</div>

          <Form {...form}>
            <form onSubmit={handleSubmit(handleSignUpSubmit)} className="space-y-4">
              {/* 서버에서 반환된 오류 메시지 표시 */}
              {serverError && (
                <div className="text-red-500 text-sm p-2 bg-red-50 rounded-md">
                  {serverError}
                </div>
              )}

              <FormField
                control={form.control}
                name="userEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="email"
                          placeholder="Email"
                          {...field}
                          ref={emailCheckInputRef}
                          style={getInputStyle("userEmail")}
                        />
                        <Button
                          type="button"
                          className="min-w-[68px] bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 text-xs rounded"
                          onClick={requestEmailVerification}
                          disabled={validationLoading} // 로딩 중에는 클릭 방지
                        >
                          {validationLoading ? "요청 중..." : "인증 하기"}
                        </Button>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="verificationCode"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="인증번호 입력"
                          {...field}
                          ref={emailCheckInputRef}
                          style={getInputStyle("verificationCode")}
                        />
                        <Button
                          type="button"
                          className="min-w-[68px] bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 text-xs rounded"
                          onClick={verifyEmailCode}
                          disabled={validationLoading} // 로딩 중에는 클릭 방지
                        >
                          {validationLoading ? "검증 중..." : "확인"}
                        </Button>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>아이디</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="ID"
                          {...field}
                          ref={userIdInputRef}
                          style={getInputStyle("userId")}
                        />
                        <Button
                          type="button"
                          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 text-xs rounded"
                          onClick={checkDuplicateId}
                          disabled={validationLoading} // 로딩 중에는 클릭 방지
                        >
                          {validationLoading ? "검증 중..." : "중복 확인"}
                        </Button>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex space-x-4">
                <FormField
                  control={form.control}
                  name="userName"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>이름</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="User name"
                          {...field}
                          ref={userNameInputRef}
                          style={getInputStyle("userName")}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="userNick"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>닉네임</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nick name"
                          {...field}
                          ref={userNickInputRef}
                          style={getInputStyle("userNick")}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="userPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>휴대폰번호</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="자동으로 '-'가 입력됩니다"
                        value={field.value || ""}
                        onChange={(e) => {
                          const formatted = formatPhoneNumber(e.target.value);
                          field.onChange(formatted); // react-hook-form에 반영
                        }}
                        ref={userPhoneInputRef}
                        style={getInputStyle("userPhone")}
                        maxLength={13} // 010-0000-0000
                      />
                    </FormControl>
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
                      <Input
                        type="password"
                        placeholder="Password"
                        {...field}
                        ref={userPwInputRef}
                        style={getInputStyle("userPw")}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userPwConfirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호 확인</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="password"
                          placeholder="Password"
                          {...field}
                          ref={userPwConfirmInputRef}
                          style={getInputStyle("userPwConfirm")}
                        />
                        <Button
                          type="button"
                          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 text-xs rounded"
                          onClick={checkPassdMatch}
                        >
                          비밀번호 확인
                        </Button>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="userGender"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>성별</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex space-x-4"
                        ref={userGenderInputRef}
                      >
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem value="1" />
                          </FormControl>
                          <FormLabel>남성</FormLabel>
                        </FormItem>
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem value="2" />
                          </FormControl>
                          <FormLabel>여성</FormLabel>
                        </FormItem>
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem value="3" />
                          </FormControl>
                          <FormLabel>비밀</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex space-x-4">
              <FormField
                control={form.control}
                name="jobIdx"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>직업</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}          // 값 변경 시 react-hook-form에 반영
                          value={field.value?.toString() || ""}   // 값이 문자열인지 확인
                        >
                          <SelectTrigger
                            className="w-full"
                            style={getInputStyle("jobIdx")}
                            ref={field.ref}                      // 포커스 용도로 ref는 SelectTrigger에 전달
                          >
                            <SelectValue placeholder="선택" />
                          </SelectTrigger>

                          <SelectContent className="bg-white">
                            <SelectGroup>
                              {jobCategories.length > 0 ? (
                                jobCategories.map((job) => (
                                  <SelectItem
                                    key={job.idx}
                                    value={job.idx?.toString()}
                                  >
                                    {job.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <>
                                  <SelectItem value="1">개발자</SelectItem>
                                  <SelectItem value="2">디자이너</SelectItem>
                                  <SelectItem value="0">선택안함</SelectItem>
                                </>
                              )}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetIdx"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>관심사</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}               // 값 변경 시 react-hook-form에 반영
                          value={field.value?.toString() || ""}        // 값이 문자열인지 확인
                        >
                          <SelectTrigger
                            className="w-full"
                            style={getInputStyle("targetIdx")}
                            ref={field.ref}                             // 포커스 용도로 SelectTrigger에 전달
                          >
                            <SelectValue placeholder="선택" />
                          </SelectTrigger>

                          <SelectContent className="bg-white">
                            <SelectGroup>
                              {targetCategories.length > 0 ? (
                                targetCategories.map((target) => (
                                  <SelectItem
                                    key={target.idx}
                                    value={target.idx?.toString()}
                                  >
                                    {target.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <>
                                  <SelectItem value="1">미라클모닝</SelectItem>
                                  <SelectItem value="2">운동</SelectItem>
                                  <SelectItem value="0">선택안함</SelectItem>
                                </>
                              )}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-black text-white"
                disabled={signUpLoading}
              >
                {signUpLoading ? "회원가입 중..." : "회원가입"}
              </Button>
            </form>
          </Form>
        </ScrollArea>
      </div>
    </div>
  );
};

export default SignUpForm;