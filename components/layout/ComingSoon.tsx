"use client";

import type { Icon } from "@phosphor-icons/react";

interface ComingSoonProps {
  icon: Icon;
  title: string;
  description?: string;
}

export default function ComingSoon({
  icon: IconComponent,
  title,
  description = "This feature is coming soon",
}: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-16 h-16 rounded-2xl bg-bg-hover flex items-center justify-center mb-4">
        <IconComponent size={28} className="text-text-muted" />
      </div>
      <h1 className="text-lg font-semibold text-text-primary tracking-tight">
        {title}
      </h1>
      <p className="text-sm text-text-muted mt-1.5">{description}</p>
    </div>
  );
}
