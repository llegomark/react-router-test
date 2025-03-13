// app/components/QueryErrorBoundary.tsx
import React from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

interface ErrorFallbackProps {
    error: Error;
    resetErrorBoundary: () => void;
}

interface QueryErrorBoundaryProps {
    children: React.ReactNode;
    fallbackRender?: (props: ErrorFallbackProps) => React.ReactNode;
}

const DefaultFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => (
    <div className="p-4 bg-red-50 rounded-md">
        <h3 className="text-lg font-medium text-red-700">Something went wrong</h3>
        <p className="text-sm text-red-500 mt-2">{error.message}</p>
        <button
            onClick={resetErrorBoundary}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
            Try again
        </button>
    </div>
);

export function QueryErrorBoundary({
    children,
    fallbackRender = DefaultFallback
}: QueryErrorBoundaryProps) {
    return (
        <QueryErrorResetBoundary>
            {({ reset }) => (
                <ErrorBoundary
                    onReset={reset}
                    fallbackRender={fallbackRender}
                >
                    {children}
                </ErrorBoundary>
            )}
        </QueryErrorResetBoundary>
    );
}