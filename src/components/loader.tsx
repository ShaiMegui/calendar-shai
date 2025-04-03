interface LoaderProps {
  size?: "sm" | "lg";
  color?: "white" | "black" | "blue";
  className?: string;
}

export const Loader = ({ size = "sm", color = "white", className = "" }: LoaderProps) => {
  const dotSize = size === "sm" ? "w-1 h-1" : "w-2 h-2";
  const gap = size === "sm" ? "gap-1" : "gap-2";
  const dotColor = color === "white" ? "bg-white" : color === "black" ? "bg-black" : "bg-blue-500";

  return (
    <div className={`flex items-center justify-center ${gap} ${className}`}>
      <div className={`${dotSize} ${dotColor} rounded-full animate-zoom-1`} />
      <div className={`${dotSize} ${dotColor} rounded-full animate-zoom-2`} />
      <div className={`${dotSize} ${dotColor} rounded-full animate-zoom-3`} />
    </div>
  );
};