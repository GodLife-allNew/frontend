import { useState, useCallback } from "react";
import axiosInstance from "@/shared/api/axiosInstance";

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (method, url, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      let response;

      if (method === "get" || method === "delete") {
        // GET / DELETE → (url, config)
        response = await axiosInstance[method](url, options);
      } else {
        // POST / PUT / PATCH → (url, data, config)
        const { data, ...config } = options;
        response = await axiosInstance[method](url, data, config);
      }

      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);


  const get = useCallback((url, options = {}) => request("get", url, options), [request]);
  const post = useCallback((url, data = {}, options = {}) => request("post", url, { ...options, data }), [request]);
  const put = useCallback((url, data = {}, options = {}) => request("put", url, { ...options, data }), [request]);
  const patch = useCallback((url, data = {}, options = {}) => request("patch", url, { ...options, data }), [request]);
  const del = useCallback((url, options = {}) => request("delete", url, options), [request]);

  return { loading, error, get, post, put, patch, delete: del };
};
