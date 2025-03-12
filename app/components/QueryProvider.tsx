// app/components/QueryProvider.tsx
import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { getQueryClient } from '../lib/query-client';

export function QueryProvider({ children }: { children: React.ReactNode }) {
    // Use a state to ensure the QueryClient is only created once per component lifecycle
    const [queryClient] = useState(() => getQueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* Show React Query Devtools in non-production */}
            {process.env.NODE_ENV !== 'production' && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
    );
}