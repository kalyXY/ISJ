import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Loading = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div className="h-8 w-48 bg-muted rounded mb-2" />
        <div className="h-4 w-64 bg-muted rounded" />
      </div>
      <div className="h-10 w-40 bg-muted rounded" />
    </div>
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>
          <div className="h-6 w-40 bg-muted rounded" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-8 w-full bg-muted rounded" />
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default Loading; 