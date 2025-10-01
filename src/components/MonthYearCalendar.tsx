"use client";

import { useState, useRef, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaRegCalendar } from "react-icons/fa";

interface MonthYearPickerProps {
  onChange?: (value: { month: number; year: number }) => void;
}

export function MonthYearPicker({ onChange }: MonthYearPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const pickerRef = useRef<HTMLDivElement>(null);

  const months = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
  ];

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (month: number) => {
    setSelectedMonth(month);
    onChange?.({ month, year: selectedYear });
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={pickerRef}>
      {/* Input */}
      <button
        type="button"   // 👈 e aqui
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between border rounded-md border-gray-300 px-4 py-2 text-left bg-white transition focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span>
          {selectedMonth
            ? `${months[selectedMonth - 1]} / ${selectedYear}`
            : "Selecione mês e ano"}
        </span>
        <FaRegCalendar className="w-5 h-5 text-gray-500" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute mt-2 w-full border rounded-xl shadow-lg bg-white z-50 p-4 animate-fade-in">
          {/* Cabeçalho com ano */}
          <div className="flex justify-between items-center mb-4">
            <button
              type="button"   // 👈 e aqui
              className="p-2 rounded-full hover:bg-gray-100 transition"
              onClick={() => setSelectedYear((y) => y - 1)}
            >
              <FaChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <span className="text-lg font-semibold">{selectedYear}</span>
            <button
              type="button"   // 👈 e aqui
              className="p-2 rounded-full hover:bg-gray-100 transition"
              onClick={() => setSelectedYear((y) => y + 1)}
            >
              <FaChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Grade de meses */}
          <div className="grid grid-cols-3 gap-2">
            {months.map((m, i) => (
              <button
                key={i}
                type="button"   // 👈 e aqui
                onClick={() => handleSelect(i + 1)}
                className={`rounded-lg py-2 text-sm font-medium transition-all
                  ${selectedMonth === i + 1
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-blue-100"
                  }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
