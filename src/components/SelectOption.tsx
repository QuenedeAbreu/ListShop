import { useState, useRef, useEffect } from "react";
import type { Category } from '@/lib/types';
import { FiChevronRight } from "react-icons/fi";

type SelectOptionProps = {
  categories: Category[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  className?: string;
}

const ColorSelect = ({ categories, value, onChange, placeholder = "Escolha uma Opção!", className }: SelectOptionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !(dropdownRef.current as Node).contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCategory = categories.find(cat => cat.id === value);

  return (
    <div className={`relative w-64 ${className}`} ref={dropdownRef}>
      {/* Botão principal */}
      <div
        className="border border-gray-300 rounded-md px-3 py-2 flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {selectedCategory ? (
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-sm"
                style={{ backgroundColor: selectedCategory.color ?? "#fff" }}
              ></div>
              <span>{selectedCategory.name}</span>
            </div>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <span>
          {/* icone roda quando dropdown está aberto */}
          <FiChevronRight className={`w-5 h-5 transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`} />
        </span>
      </div>

      {/* Lista de opções com animação de cima para baixo */}
      <div
        className={`
    absolute z-999 w-full mt-1 border border-gray-300 rounded-md bg-white shadow-lg transition-all duration-300
    ${isOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}
    overflow-y-auto
  `}
      >
        {/* Opção "Sem Categoria" */}
        <div className="px-3 py-2 cursor-not-allowed text-gray-400">
          {placeholder}
        </div>

        {categories.map((cat) => (
          <div
            key={cat.id}
            className="px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-100"
            onClick={() => {
              onChange(cat.id);
              setIsOpen(false);
            }}
          >
            <div
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: cat.color ?? "#cfc9fc" }}
            ></div>

            <div className="font-medium">{cat.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorSelect;
