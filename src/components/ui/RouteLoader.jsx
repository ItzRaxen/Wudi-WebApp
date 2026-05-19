import { Suspense } from 'react';
import { Skeleton } from './Skeleton.jsx';

export function RouteLoader({ children }) {
  return (
    <Suspense
      fallback={
        <div className="grid gap-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-64" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
