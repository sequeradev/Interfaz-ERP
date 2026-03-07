"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  page: number;
  hasMore: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export function Pagination({ page, hasMore, onPrev, onNext }: PaginationProps) {
  return (
    <div className="flex items-center justify-between pt-4">
      <Button
        type="button"
        variant="secondary"
        className="w-auto px-4"
        disabled={page === 0}
        onClick={onPrev}
      >
        <ChevronLeft size={16} />
        Anterior
      </Button>
      <span className="text-sm text-text-secondary">Pagina {page + 1}</span>
      <Button
        type="button"
        variant="secondary"
        className="w-auto px-4"
        disabled={!hasMore}
        onClick={onNext}
      >
        Siguiente
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}
