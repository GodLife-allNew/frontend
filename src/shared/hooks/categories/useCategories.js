import { useState, useEffect } from "react";
import { useApi } from "@/shared/hooks/useApi";

/**
 * @param {string} type - API에서 사용할 카테고리 종류 [사용가능: `job`, `target`, `challenge`, `faq`]
 * @returns {object} { categories, loading, error }
 */
export const useCategories = (type = "job") => {
  const { get, loading, error } = useApi();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!type) return;

    const fetchCategories = async () => {
      try {
        const response = await get(`categories/${type}`);
        const data = response.data;

        // ✅ 응답 데이터 가공
        const formatted = data.map((category) => {
          const idx = category.idx ?? category.challCateIdx ?? category.faqCategoryIdx;
          const name = category.name ?? category.challName ?? category.faqCategoryName;

          const base = { idx, name };

          if (type === "faq") {
            return { ...base, iconKey: null, icon: null, color: null };
          }

          return {
            ...base,
            iconKey: category.iconKey ?? null,
            icon: category.icon ?? null,
            color: category.color ?? null,
          };
        });

        setCategories(formatted);
      } catch (err) {
        console.error(`❌ ${type} 카테고리 데이터 가져오기 실패:`, err);
      }
    };

    fetchCategories();
    
  }, [get, type]);

  console.log(categories);
  // ✅ 로딩, 에러, 데이터 반환
  return { categories, loading, error };
};
