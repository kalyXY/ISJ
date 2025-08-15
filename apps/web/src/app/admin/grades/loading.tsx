import { Loader2 } from "lucide-react";

export default function GradesLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Redirection vers le module des bulletins...</span>
      </div>
    </div>
  );
}
