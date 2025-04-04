// app/root.tsx
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { QueryProvider } from "./components/QueryProvider";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen flex flex-col">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// Define the error fallback props interface
interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

// Custom error fallback UI component with proper typing
function QueryErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="p-4 m-4 bg-red-50 rounded-md">
      <h2 className="text-lg font-medium text-red-700">Something went wrong with data fetching</h2>
      <p className="text-sm text-red-500 mt-2">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try again
      </button>
    </div>
  );
}

export default function App() {
  return (
    <QueryProvider>
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ReactErrorBoundary
            onReset={reset}
            fallbackRender={QueryErrorFallback}
          >
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">
                <Outlet />
              </main>
              <Footer />
            </div>
          </ReactErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </QueryProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
            <h1 className="text-2xl font-semibold">{message}</h1>
            <p className="text-muted-foreground text-sm">{details}</p>
            {stack && (
              <pre className="w-full p-4 overflow-x-auto bg-gray-50 rounded-md text-xs">
                <code>{stack}</code>
              </pre>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}