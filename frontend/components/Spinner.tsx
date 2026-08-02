export default function Spinner({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizes = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-9 w-9" };
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-line border-t-accent ${sizes[size]} ${className}`}
      aria-label="Loading"
    />
  );
}
