import { useState, useEffect } from "react";
import { useApi } from "@/shared/hooks/useApi";

export const useTopCategories = () => {
  const { get, loading, error } = useApi();
  const [topCategories, setTopCategories] = useState([]);

  useEffect(() => {
    const fetchTopCategories = async () => {
      try {
        const response = await get("categories/topMenu");
        const data = response.data;

        // ✅ 응답 데이터 가공
        const formatted = data.map((category) => ({
          topIdx: category.topIdx,
          name: category.name,
          addr: category.addr,
          ordCol: category.ordCol,
          children: category.children
            ? category.children.map((child) => ({
                topIdx: child.topIdx,
                name: child.name,
                addr: child.addr,
                ordCol: child.ordCol,
              }))
            : [],
        }));

        setTopCategories(formatted);
      } catch (err) {
        console.error("상위 카테고리 데이터 가져오기 실패:", err);
      }
    };

    fetchTopCategories();
  }, [get]);

  // ✅ 로딩, 에러, 데이터 반환
  return { topCategories, loading, error };
};
