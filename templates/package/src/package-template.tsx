"use client";

import { ReactNode } from "react";

interface PackageTemplateProps {
  children: ReactNode;
  className?: string;
}

export const PackageTemplate = ({ children, className }: PackageTemplateProps) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};
