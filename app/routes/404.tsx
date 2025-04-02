// app/routes/404.tsx
import { Link } from "react-router";
import type { Route } from "./+types/404";
import { Button } from "../components/ui/button";
import { FileQuestion, Home } from "lucide-react";

export const meta: Route.MetaFunction = ({ location }) => {
    const domain = "https://nqesh.com";
    const fullUrl = `${domain}${location.pathname}`;
    const title = "Page Not Found (404) - NQESH Reviewer";
    const description = "Sorry, the page you were looking for could not be found on the NQESH Reviewer site. Navigate back home or try a category link.";

    return [
        { title: title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: fullUrl },
        { property: "og:image", content: `${domain}/og-image-404.png` },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: `${domain}/twitter-image-404.png` },
    ];
};

export default function NotFound() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="flex flex-col items-center justify-center text-center">
                <div className="rounded-full bg-blue-100 p-6 mb-6">
                    <FileQuestion className="h-12 w-12 text-blue-600" />
                </div>

                <h1 className="text-3xl font-semibold text-blue-800 mb-2">Page Not Found</h1>

                <p className="text-gray-600 max-w-md mb-8">
                    The page you are looking for doesn't exist or has been moved.
                    Let's get you back on track!
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Button asChild className="gap-2">
                        <Link to="/">
                            <Home className="h-4 w-4" />
                            Back to Home
                        </Link>
                    </Button>

                    <Button asChild variant="outline" className="gap-2">
                        <Link to="/dashboard">
                            View Dashboard
                        </Link>
                    </Button>
                </div>

                <div className="mt-12 flex flex-col items-center text-sm text-gray-500">
                    <p>Need help? Try one of these categories:</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-2">
                        <Link to="/reviewer/leadership" className="text-blue-600 hover:underline">School Leadership</Link>
                        <span className="text-gray-400">•</span>
                        <Link to="/reviewer/management" className="text-blue-600 hover:underline">Educational Management</Link>
                        <span className="text-gray-400">•</span>
                        <Link to="/reviewer/instructional" className="text-blue-600 hover:underline">Instructional Leadership</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}