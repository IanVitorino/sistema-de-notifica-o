'use client';

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: "default" | "green" | "blue" | "purple" | "orange" | "indigo" | "cyan" | "teal";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const variantClasses = {
  default: "bg-default-50 dark:bg-default-950 border-default-200 dark:border-default-800",
  green: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
  blue: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
  purple: "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800",
  orange: "bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800",
  indigo: "bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800",
  cyan: "bg-cyan-50 dark:bg-cyan-950 border-cyan-200 dark:border-cyan-800",
  teal: "bg-teal-50 dark:bg-teal-950 border-teal-200 dark:border-teal-800",
};

const textClasses = {
  default: "text-default-900 dark:text-default-200",
  green: "text-green-900 dark:text-green-200",
  blue: "text-blue-900 dark:text-blue-200",
  purple: "text-purple-900 dark:text-purple-200",
  orange: "text-orange-900 dark:text-orange-200",
  indigo: "text-indigo-900 dark:text-indigo-200",
  cyan: "text-cyan-900 dark:text-cyan-200",
  teal: "text-teal-900 dark:text-teal-200",
};

const valueClasses = {
  default: "text-default-700 dark:text-default-400",
  green: "text-green-700 dark:text-green-400",
  blue: "text-blue-700 dark:text-blue-400",
  purple: "text-purple-700 dark:text-purple-400",
  orange: "text-orange-700 dark:text-orange-400",
  indigo: "text-indigo-700 dark:text-indigo-400",
  cyan: "text-cyan-700 dark:text-cyan-400",
  teal: "text-teal-700 dark:text-teal-400",
};

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  trend,
}: KpiCardProps) {
  return (
    <Card className={cn("border shadow-sm", variantClasses[variant])}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className={cn("text-sm font-medium mb-1", textClasses[variant])}>
              {title}
            </p>
          </div>
          {Icon && (
            <div className={cn("p-2 rounded-md", variantClasses[variant])}>
              <Icon className={cn("h-5 w-5", textClasses[variant])} />
            </div>
          )}
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className={cn("text-3xl font-bold", valueClasses[variant])}>
              {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
            </p>
            {subtitle && (
              <p className={cn("text-xs mt-1", textClasses[variant])}>
                {subtitle}
              </p>
            )}
          </div>
          {trend && (
            <div className={cn(
              "text-xs font-medium px-2 py-1 rounded",
              trend.isPositive ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
            )}>
              {trend.isPositive ? "+" : ""}{trend.value}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
