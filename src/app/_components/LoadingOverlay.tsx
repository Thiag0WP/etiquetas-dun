"use client";

type Props = {
  isLoading: boolean;
  message: string;
};

export function LoadingOverlay({ isLoading, message }: Props) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="text-gray-700 font-medium">{message}</span>
      </div>
    </div>
  );
}
