const FlowIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="url(#flowGradient)" />
    <path
      d="M11 13.5C11 12.1193 12.1193 11 13.5 11H18.5C19.8807 11 21 12.1193 21 13.5V18.5C21 19.8807 19.8807 21 18.5 21H13.5C12.1193 21 11 19.8807 11 18.5V13.5Z"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M15 15L17 17M17 15L15 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path
      d="M8 24L24 8M8 8L24 24"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="2 4"
    />
    <defs>
      <linearGradient id="flowGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00EF8B" />
        <stop offset="1" stopColor="#00B8D9" />
      </linearGradient>
    </defs>
  </svg>
);

export default FlowIcon;
