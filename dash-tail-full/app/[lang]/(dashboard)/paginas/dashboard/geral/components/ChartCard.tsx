'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  description?: string;
}

export function ChartCard({ title, children, actions, description }: ChartCardProps) {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="border-none pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-default-900 dark:text-default-200">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-default-600 dark:text-default-400 mt-1">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex-none">
              {actions}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
}
