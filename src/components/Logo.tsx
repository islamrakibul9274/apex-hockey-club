import React from "react";

/**
 * Club logo mark.
 *
 * An inline SVG rather than an image file: it inherits currentColor, stays
 * crisp at any size, costs no extra request and never shows a broken-image
 * placeholder. Previously the mark was the letters "AH" in a rounded square,
 * which read as a placeholder rather than an identity.
 */
export function LogoMark({
  className = "h-9 w-9",
  titleId,
}: {
  className?: string;
  titleId?: string;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      role={titleId ? "img" : "presentation"}
      aria-hidden={titleId ? undefined : true}
      aria-labelledby={titleId}
      fill="none"
    >
      {titleId && <title id={titleId}>Apex Hockey Club</title>}

      <defs>
        <linearGradient id="apex-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D32F2F" />
          <stop offset="100%" stopColor="#A01F1F" />
        </linearGradient>
      </defs>

      {/* Rounded shield */}
      <path
        d="M20 1.6 36.2 7v13.4c0 9.1-6.5 15.6-16.2 18C11.3 36 4.8 29.5 4.8 20.4V7L20 1.6Z"
        fill="url(#apex-mark)"
      />

      {/* Puck */}
      <circle cx="17.6" cy="15.6" r="6.1" fill="#fff" fillOpacity="0.95" />
      <path
        d="M11.5 15.6h12.2M17.6 9.5v12.2"
        stroke="#D32F2F"
        strokeWidth="1.15"
        strokeLinecap="round"
      />

      {/* Stick, angled across the lower right */}
      <path
        d="M21.5 31.5 32.4 16.6"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="m20.6 32.9 2.1-1.8-1-2.6-2.6 1 1.5 3.4Z"
        fill="#fff"
      />
    </svg>
  );
}

export default LogoMark;