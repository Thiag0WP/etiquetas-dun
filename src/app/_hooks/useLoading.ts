import { useState } from 'react';

export function useLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const startLoading = (message: string) => {
    setIsLoading(true);
    setLoadingMessage(message);
  };

  const stopLoading = () => {
    setIsLoading(false);
    setLoadingMessage('');
  };

  const withLoading = async <T>(
    operation: () => Promise<T>,
    message: string,
    delay: number = 300
  ): Promise<T> => {
    startLoading(message);
    try {
      // Adiciona um delay mínimo para melhor UX
      const [result] = await Promise.all([
        operation(),
        new Promise(resolve => setTimeout(resolve, delay))
      ]);
      return result;
    } finally {
      stopLoading();
    }
  };

  return {
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading,
    withLoading,
  };
}