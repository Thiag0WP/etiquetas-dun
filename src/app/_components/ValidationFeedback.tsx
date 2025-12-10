"use client";

interface ValidationFeedbackProps {
  isValid: boolean;
  errors: string[];
  className?: string;
}

export function ValidationFeedback({
  isValid,
  errors,
  className = "",
}: ValidationFeedbackProps) {
  if (isValid) {
    return (
      <div
        className={`flex items-center gap-1 text-green-600 text-sm ${className}`}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <span>Válido</span>
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {errors.map((error, index) => (
        <div
          key={index}
          className="flex items-start gap-1 text-red-600 text-sm"
        >
          <svg
            className="w-4 h-4 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      ))}
    </div>
  );
}
