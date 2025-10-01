import { FiCheckCircle } from "react-icons/fi";

interface ProgressBarProps {
  total: number;
  completed: number;
}

export default function ProgressBar({ total, completed }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = percentage >= 100;

  return (
    <div className="w-full mt-4">
      {/* Barra + porcentagem */}
      <div className="flex items-center gap-2">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 transition-all duration-500 ${isComplete ? "bg-green-500" : "bg-blue-500"
              }`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        {/* Texto porcentagem ou ícone */}
        {isComplete ? (
          <FiCheckCircle className="text-green-600 h-5 w-5" />
        ) : (
          <span className="text-sm font-medium text-gray-700">
            {percentage}%
          </span>
        )}
      </div>

      {/* Info extra */}
      <p className="text-xs text-gray-500 mt-1">
        {completed} de {total} itens comprados
      </p>
    </div>
  );
}
