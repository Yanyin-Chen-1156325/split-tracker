"use client";

const COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-indigo-500",
];

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

interface MemberAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
}

export function MemberAvatar({ name, size = "md", showName = false }: MemberAvatarProps) {
  const color = getColor(name);
  const initial = name.charAt(0).toUpperCase();

  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizeClasses[size]} ${color} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}
      >
        {initial}
      </div>
      {showName && <span className="text-sm font-medium">{name}</span>}
    </div>
  );
}
