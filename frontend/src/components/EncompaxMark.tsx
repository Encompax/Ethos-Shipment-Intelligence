import React from "react";

interface Props {
  size?: number;
  opacity?: number;
}

/**
 * Encompax Seed of Life mark — the circular petal pattern from the Encompax logo.
 * Used as the small brand identifier in "Powered by Encompax" branding.
 * Replace the favicon.svg in /public with the official file when available.
 */
const EncompaxMark: React.FC<Props> = ({ size = 20, opacity = 1 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="-24 -24 48 48"
    width={size}
    height={size}
    style={{ opacity, flexShrink: 0 }}
    aria-hidden="true"
  >
    {/* Outer dark ring */}
    <circle r="23" fill="#1A1A1A" />

    <defs>
      <clipPath id="em-clip">
        <circle r="21.5" />
      </clipPath>
    </defs>

    <g clipPath="url(#em-clip)">
      {/* Fill pass 1 */}
      <g fill="#B91C1C" fillOpacity="0.2" stroke="none">
        <circle cx="0"   cy="0"      r="8" />
        <circle cx="8"   cy="0"      r="8" />
        <circle cx="4"   cy="6.928"  r="8" />
        <circle cx="-4"  cy="6.928"  r="8" />
        <circle cx="-8"  cy="0"      r="8" />
        <circle cx="-4"  cy="-6.928" r="8" />
        <circle cx="4"   cy="-6.928" r="8" />
      </g>
      {/* Fill pass 2 — intersections accumulate darker */}
      <g fill="#DC2626" fillOpacity="0.22" stroke="none">
        <circle cx="0"   cy="0"      r="8" />
        <circle cx="8"   cy="0"      r="8" />
        <circle cx="4"   cy="6.928"  r="8" />
        <circle cx="-4"  cy="6.928"  r="8" />
        <circle cx="-8"  cy="0"      r="8" />
        <circle cx="-4"  cy="-6.928" r="8" />
        <circle cx="4"   cy="-6.928" r="8" />
      </g>
      {/* Stroke pass — circle outlines */}
      <g fill="none" stroke="#EF4444" strokeWidth="0.75" strokeOpacity="0.85">
        <circle cx="0"   cy="0"      r="8" />
        <circle cx="8"   cy="0"      r="8" />
        <circle cx="4"   cy="6.928"  r="8" />
        <circle cx="-4"  cy="6.928"  r="8" />
        <circle cx="-8"  cy="0"      r="8" />
        <circle cx="-4"  cy="-6.928" r="8" />
        <circle cx="4"   cy="-6.928" r="8" />
      </g>
    </g>

    {/* Outer ring border */}
    <circle r="21.5" fill="none" stroke="#B91C1C" strokeWidth="1.4" />
  </svg>
);

export default EncompaxMark;
