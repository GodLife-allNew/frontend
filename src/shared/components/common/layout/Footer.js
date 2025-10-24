import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";

const Footer = () => {
  return (
    <Card className="rounded-none border-t border-b-0 border-x-0 bg-gray-100">
      <CardContent className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* 상단 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* 회사 정보 섹션 */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                팀 갓생로그
              </h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                백엔드와 프론트엔드 개발자가 되기 위해
                <br />
                포트폴리오용으로 만든 프로젝트입니다.
              </p>
              <div className="flex space-x-4">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                  <Button
                    key={idx}
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 p-0"
                  >
                    <Icon className="h-4 w-4 text-gray-600 hover:text-blue-600 transition-colors" />
                  </Button>
                ))}
              </div>
            </div>

            {/* 연락처 섹션 */}
            <div className="md:col-span-2 lg:col-span-3">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                연락처
              </h3>

              {/* 반응형 카드 그리드 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    name: "김희만",
                    role: "Backend, 팀장",
                    phone: "010-4065-4059",
                    email: "gmlaksgmlaks@naver.com",
                  },
                  {
                    name: "이용기",
                    role: "Backend",
                    phone: "010-3152-2881",
                    email: "dysrl3020@naver.com",
                  },
                  {
                    name: "임채림",
                    role: "Frontend",
                    phone: "010-0000-0000",
                    email: "limcl1224@naver.com",
                  },
                  {
                    name: "신해지",
                    role: "Frontend",
                    phone: "010-0000-0000",
                    email: "haeji1124@naver.com",
                  },
                ].map((member, index) => (
                  <div
                    key={index}
                    className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition"
                  >
                    <p className="font-semibold text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-600 mb-1">
                      담당: {member.role}
                    </p>
                    <p className="text-sm text-gray-600">📞 {member.phone}</p>
                    <p className="text-sm text-gray-600 truncate">
                      ✉️ {member.email}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          {/* 저작권 정보 */}
          <div className="text-center text-sm text-gray-500">
            © 2025 <span className="font-semibold">GodLife</span>. All rights reserved.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Footer;
