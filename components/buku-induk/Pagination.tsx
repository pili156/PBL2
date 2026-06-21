"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalData: number;
  perPage: number;
  onPageChange: (page: number) => void;
  accentColor?: "blue" | "purple" | "green";
}

export default function Pagination({
  currentPage,
  totalPages,
  totalData,
  perPage,
  onPageChange,
  accentColor = "blue",
}: PaginationProps) {
  const start = (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, totalData);

  const accentActive: Record<string, string> = {
    blue: "bg-blue-500 border-blue-500 text-white",
    purple: "bg-violet-600 border-violet-600 text-white",
    green: "bg-emerald-600 border-emerald-600 text-white",
  };

  const getPages = (): (number | "...")[] => {
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, "...", totalPages];
    if (currentPage >= totalPages - 3) return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
      <span className="text-sm text-gray-500">
        Menampilkan {totalData > 0 ? start : 0} - {end} dari {totalData} data
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-blue-400 hover:text-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
        >
          ‹
        </button>
        {getPages().map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                currentPage === p
                  ? accentActive[accentColor]
                  : "border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-500"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-blue-400 hover:text-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
        >
          ›
        </button>
      </div>
    </div>
  );
}
