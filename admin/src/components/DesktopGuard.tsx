import { useEffect, useState, ReactNode } from "react";

interface DesktopGuardProps {
  children: ReactNode;
}

export function DesktopGuard({ children }: DesktopGuardProps) {
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      // Check if on desktop device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

      if (isMobile) {
        setIsValid(false);
      } else {
        setIsValid(true);
      }
    };

    checkDesktop();
  }, []);

  if (!isValid) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Accès restreint</h1>
          <p className="text-gray-600 mb-4">
            Le panel admin est accessible uniquement depuis un ordinateur de bureau.
          </p>
          <p className="text-sm text-gray-500">
            Veuillez utiliser un ordinateur pour accéder à cette interface.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

