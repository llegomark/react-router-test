// app/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

// Create a client for the browser
let browserClient: QueryClient | undefined = undefined;

// Function to get the Query client that ensures we don't create multiple instances
// on the server, but reuse the same instance for each request on the client
export function getQueryClient() {
    // For browser, we want to ensure we use a singleton
    if (typeof window !== 'undefined') {
        if (!browserClient) {
            browserClient = new QueryClient({
                defaultOptions: {
                    queries: {
                        // Keep cached data for 5 minutes by default
                        gcTime: 1000 * 60 * 5,
                        // Background refetch after 30 seconds
                        staleTime: 1000 * 30,
                        // Don't retry on error by default (React Router will handle this)
                        retry: false,
                    },
                },
            });
        }
        return browserClient;
    }

    // For server, create a new client for each request
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Disable retries on server
                retry: false,
                // Don't cache on server
                gcTime: 0,
                staleTime: 0,
            },
        },
    });
}