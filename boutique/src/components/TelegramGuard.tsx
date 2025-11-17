import { useEffect, useState, ReactNode } from "react";

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
  };
  version: string;
  platform: string;
  colorScheme: "light" | "dark";
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: () => void;
    hideProgress: () => void;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

interface TelegramGuardProps {
  children: ReactNode;
}

export function TelegramGuard({ children }: TelegramGuardProps) {
  const [isValid, setIsValid] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkTelegram = () => {
      // Check if Telegram WebApp is available
      if (!window.Telegram?.WebApp) {
        setIsValid(false);
        setIsChecking(false);
        return;
      }

      // Check if on mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

      if (!isMobile) {
        setIsValid(false);
        setIsChecking(false);
        return;
      }

      // Initialize Telegram WebApp
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();

      setIsValid(true);
      setIsChecking(false);
    };

    checkTelegram();
  }, []);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Accès restreint</h1>
          <p className="text-gray-600 mb-4">
            Cette boutique est accessible uniquement via Telegram Mini App sur mobile.
          </p>
          <p className="text-sm text-gray-500">
            Veuillez ouvrir cette application depuis Telegram sur votre appareil mobile.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

