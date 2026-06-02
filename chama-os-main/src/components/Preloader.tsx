import { useEffect, useState } from "react";
import logoImage from "@/assets/chama-OS-logo.png";

export function Preloader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isRendered, setIsRendered] = useState(true);

  useEffect(() => {
    // Start fading out after 2 seconds (2000ms)
    const fadeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 800);

    // Completely remove from DOM after the fade transition completes (2500ms)
    const removeTimer = setTimeout(() => {
      setIsRendered(false);
    }, 1500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isRendered) return null;

  return (
    <div
      id="preloader"
      className={`fixed inset-0 bg-[#0b1a10] flex flex-col items-center justify-center z-[9999] transition-all duration-500 ${
        !isVisible ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <style>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.04);
          }
        }

        .loader-spinner {
          animation: spin 1.2s linear infinite;
        }

        .loader-spinner-outer {
          animation: spin 2s linear infinite reverse;
        }

        .loader-logo {
          animation: pulse 2s infinite ease-in-out;
        }
      `}</style>

      <div className="relative w-[180px] h-[180px] flex items-center justify-center">
        {/* Secondary slower tracking ring for visual depth */}
        <div
          className="loader-spinner-outer absolute w-[176px] h-[176px] rounded-full border-2 border-transparent"
          style={{
            borderColor: "rgba(46, 204, 113, 0.1)",
            borderLeftColor: "rgba(255, 255, 255, 0.4)",
          }}
        />

        {/* The spinner */}
        <div
          className="loader-spinner absolute w-[160px] h-[160px] rounded-full border-4 border-transparent"
          style={{
            borderTopColor: "#2ecc71",
            borderRightColor: "#2ecc71",
          }}
        />

        {/* The logo */}
        <img
          src={logoImage}
          alt="Chama OS Logo"
          className="loader-logo w-[120px] h-[120px] rounded-full object-cover z-[2]"
        />
      </div>

      {/* Premium Loading message */}
      <div className="absolute bottom-24 text-center">
        <p className="text-[#2ecc71] text-sm font-medium tracking-wider animate-pulse">
          Initializing Chama OS...
        </p>
      </div>
    </div>
  );
}
