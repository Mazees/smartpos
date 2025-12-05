import React from "react";

const Loading = ({ message = "Memuat...", size = 48 }) => {
  return (
    <div className="w-full h-full flex items-center justify-center p-6">
      <div className="flex items-center gap-4 bg-base-200/60 backdrop-blur-sm border border-base-300 rounded-xl px-6 py-4 shadow-lg">
        <div
          className="relative"
          style={{ width: size, height: size }}
          aria-hidden
        >
          {/* Animated circular spinner made with CSS */}
          <svg
            className="animate-spin w-full h-full text-primary"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="opacity-20"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-90"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>

        <div className="flex flex-col leading-tight">
          <div className="text-lg poppins-semibold">{message}</div>
          <div className="text-xs opacity-60 mt-1">
            Tunggu sebentar, kami sedang menyiapkan sesi Anda
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
