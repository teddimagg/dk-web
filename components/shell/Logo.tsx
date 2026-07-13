/** Green blob with a black four-point star — the reference mark. */
export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size * 1.5} height={size} viewBox="0 0 51 34" aria-label="dk Plus">
      <path
        d="M8 2 C20 -1 38 0 46 4 C52 8 51 22 45 28 C36 35 14 35 7 30 C0 24 -2 6 8 2 Z"
        fill="var(--color-accent)"
      />
      <path
        d="M26 6 C27.5 11.5 29.5 13.5 35 15 L37 17 C31.5 18.5 29.5 20.5 28 26 L26 28 C24.5 22.5 22.5 20.5 17 19 L15 17 C20.5 15.5 22.5 13.5 24 8 Z"
        fill="var(--color-ink)"
      />
    </svg>
  );
}
