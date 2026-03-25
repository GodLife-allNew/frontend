import { useNavigate } from "react-router-dom";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { MdOutlineMode, MdOutlineDelete } from "react-icons/md";
import { cn } from "@/shared/lib/utils";
import { useFaqList } from "../hooks/useFaqList";

export default function FaqListContent({ isAdminMode = false }) {
  const navigate = useNavigate();
  const {
    categories,
    categoryLoading,
    loading,
    detailLoading,
    error,
    search,
    category,
    openId,
    page,
    paginated,
    totalPages,
    isAdmin,
    handleFaqClick,
    handleCategoryChange,
    handleSearchChange,
    handleDeleteFaq,
    setPage,
    getFaqAnswer,
    getCategoryName,
  } = useFaqList();

  return (
    <div className={cn(isAdminMode && "bg-white rounded-lg shadow-sm border p-4")}>
      {/* 검색바 */}
      <div className="flex items-center gap-2 mb-4">
        <Input
          placeholder="궁금한 내용을 검색해보세요"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* 카테고리 필터 + 버튼 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-wrap gap-2">
          {categoryLoading ? (
            <p className="text-sm text-gray-400">카테고리 로딩 중...</p>
          ) : (
            categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => handleCategoryChange(cat.key)}
                className={cn(
                  "px-4 py-2 rounded text-sm border",
                  category === cat.key
                    ? isAdminMode
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-black text-white border-black"
                    : "bg-transparent text-gray-700 border-gray-300"
                )}
              >
                {cat.label}
              </button>
            ))
          )}
        </div>

        {isAdminMode && isAdmin && (
          <Button
            className="ml-auto px-4 py-2 rounded text-sm"
            onClick={() => navigate("/FAQ/write")}
          >
            FAQ 추가
          </Button>
        )}
        {!isAdminMode && isAdmin && (
          <Button
            className="ml-auto px-4 py-2 rounded text-sm"
            onClick={() => navigate("/FAQ/write")}
          >
            작성하기
          </Button>
        )}
      </div>

      {/* 목록 */}
      {loading ? (
        <p className="text-center text-gray-400 py-12">로딩 중...</p>
      ) : error ? (
        <p className="text-center text-red-500 py-12">{error}</p>
      ) : paginated.length === 0 ? (
        <p className="text-center text-gray-400 py-12">검색 결과가 없습니다.</p>
      ) : (
        <div className="divide-y divide-gray-200">
          {paginated.map((faq) => (
            <div
              key={faq.faqIdx}
              className="py-4 cursor-pointer"
              onClick={() => handleFaqClick(faq.faqIdx)}
            >
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {getCategoryName(faq)}
                </span>
                {isAdmin && (
                  <div
                    className="flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MdOutlineMode
                      className="cursor-pointer hover:text-blue-500"
                      onClick={() => navigate(`/FAQ/modify/${faq.faqIdx}`)}
                    />
                    <MdOutlineDelete
                      className="cursor-pointer hover:text-red-500"
                      onClick={() => handleDeleteFaq(faq.faqIdx)}
                    />
                  </div>
                )}
              </div>
              <div className="font-semibold text-base flex justify-between items-center">
                {faq.faqTitle}
                <span className="text-gray-400 text-xl">
                  {openId === faq.faqIdx ? "−" : "+"}
                </span>
              </div>
              {openId === faq.faqIdx && (
                <div className="text-sm text-gray-600 mt-3 pl-1">
                  {detailLoading ? (
                    <p className="text-gray-400">답변을 불러오는 중...</p>
                  ) : (
                    <p>{getFaqAnswer(faq.faqIdx)}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 1:1 문의 링크 (사용자용만) */}
      {!isAdminMode && (
        <div className="flex justify-end mt-6 mb-4">
          <button
            onClick={() => navigate("/qna/create")}
            className="text-black text-sm font-medium"
          >
            더 궁금한 것이 있으신가요?{" "}
            <span className="font-bold hover:underline">1:1 문의</span>
          </button>
        </div>
      )}

      {/* 페이지네이션 */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-30"
          >
            이전
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-30"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
