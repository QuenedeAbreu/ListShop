"use client";

import React, { useState } from "react";

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  size?: string; // largura sugerida
  minSize?: string; // largura mínima
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  itemsPerPage?: number;
}

export default function Table<T extends { id: string | number }>({
  data,
  columns,
  itemsPerPage = 5,
}: TableProps<T>) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const paginatedData = data.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="min-h-[calc(100vh-12rem)] flex flex-col bg-white shadow-lg rounded-xl p-4">
      <div className="flex-1 overflow-x-auto">
        <table className="table-auto w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wide">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-6 py-3 text-left border-b border-gray-200 font-semibold whitespace-nowrap truncate 
                    ${col.className} ${col.minSize ? `min-w-[${col.minSize}]` : ""}`}
                  style={{ width: col.size }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm text-gray-600 divide-y divide-gray-200">
            {paginatedData.map((row, idx) => (
              <tr
                key={row.id}
                className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100 transition-colors`}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={`px-6 py-3 border-b border-gray-200 truncate whitespace-nowrap 
                      ${col.minSize ? `min-w-[${col.minSize}]` : ""}`}
                    style={{ width: col.size }}
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : (row[col.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          ◀ Anterior
        </button>
        <span className="text-gray-700 font-medium">
          Página {page} de {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Próxima ▶
        </button>
      </div>
    </div>
  );
}
