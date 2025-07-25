import Spinner from '@/components/ui/spinner';

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-50">
      <div className="bg-card border rounded-lg shadow-lg p-6 flex flex-col items-center space-y-4 max-w-[250px] text-center animate-fadeIn">
        <Spinner size="xl" color="primary" thickness="regular" />
        <p className="text-sm font-medium text-muted-foreground">Chargement en cours...</p>
      </div>
    </div>
  );
} 