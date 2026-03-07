import { useCallback, useState } from "react";

type UsePaginationOptions = {
  pageSize?: number;
};

export function usePagination({ pageSize = 20 }: UsePaginationOptions = {}) {
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const skip = page * pageSize;
  const limit = pageSize;

  const nextPage = useCallback(() => {
    if (hasMore) setPage((p) => p + 1);
  }, [hasMore]);

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(0, p - 1));
  }, []);

  const reset = useCallback(() => {
    setPage(0);
    setHasMore(true);
  }, []);

  const updateHasMore = useCallback(
    (resultCount: number) => {
      setHasMore(resultCount >= pageSize);
    },
    [pageSize]
  );

  return { page, skip, limit, hasMore, nextPage, prevPage, reset, updateHasMore };
}
