const MonadIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="url(#monadGradient)" />
    <path
      d="M8 12L16 8L24 12V20L16 24L8 20V12Z"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 8V24M8 12L24 20M24 12L8 20"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="monadGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF6B6B" />
        <stop offset="1" stopColor="#FF8E53" />
      </linearGradient>
    </defs>
  </svg>
);

export default MonadIcon;
