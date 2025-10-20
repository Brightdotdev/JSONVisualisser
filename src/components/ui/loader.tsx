// components/ui/loader.tsx
import { cn } from "@/lib/utils";

export const Loader = ({ 
  className,
  size = "default",
  text = "Loading..."
}: {
  className?: string;
  size?: "sm" | "default" | "lg";
  text?: string;
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-current border-t-transparent",
          sizeClasses[size]
        )}
      />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
};