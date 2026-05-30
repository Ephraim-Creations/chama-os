import { useEffect, useState } from "react";
import { Sprout } from "lucide-react";

export function Preloader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center z-50 transition-all duration-500 ${
        !isVisible ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <style>{`
        @keyframes spin-fast {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes pulse-subtle {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.08);
          }
        }

        .spinner-fast {
          animation: spin-fast 1.2s linear infinite;
        }

        .spinner-slow {
          animation: spin-slow 2s linear infinite;
        }

        .logo-pulse {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
      `}</style>

      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Outer ring - slow rotation */}
        <div
          className="spinner-slow absolute w-44 h-44 rounded-full border-2 border-transparent border-l-emerald-400 border-l-opacity-40"
          style={{ borderLeftColor: "rgba(52, 211, 153, 0.4)" }}
        />

        {/* Inner spinner - fast rotation */}
        <div
          className="spinner-fast absolute w-40 h-40 rounded-full border-4 border-transparent border-t-emerald-500 border-r-emerald-500"
          style={{
            borderTopColor: "#10b981",
            borderRightColor: "#10b981",
          }}
        />

        {/* Logo in center with pulse */}
        <div className="logo-pulse relative z-10 flex items-center justify-center w-32 h-32 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-full shadow-2xl">
          <Sprout className="w-16 h-16 text-white" strokeWidth={1.5} />
        </div>
      </div>

      {/* Optional: Loading text */}
      <div className="absolute bottom-24 text-center">
        <p className="text-emerald-400 text-sm font-medium tracking-wider">
          Initializing Chama-OS
        </p>
      </div>
    </div>
  );
}
