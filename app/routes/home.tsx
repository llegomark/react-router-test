// app/routes/home.tsx
import { Link } from "react-router";
import type { Route } from "./+types/home";
import { getCategories, prefetchCategories, useCategories } from "../data/quizApi";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { GraduationCap, BookOpen, School, ClipboardList } from "lucide-react";
import { getQueryClient } from "../lib/query-client";

export async function loader() {
  // First, fetch categories normally for React Router (initial load)
  const categories = await getCategories();

  // Then prefetch the same data for TanStack Query's cache
  const queryClient = getQueryClient();
  await prefetchCategories(queryClient);

  // Return the data for the initial render
  return { categories };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  // Get data from React Router's loader for initial render
  const initialCategories = loaderData?.categories;

  // Use TanStack Query for potential background updates and cache management
  const { data: categories, isLoading, error } = useCategories();

  // Fallback to loader data if query hasn't loaded yet
  const displayCategories = categories || initialCategories;

  // Helper to get an icon for each category
  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'leadership': return <School className="h-5 w-5" />;
      case 'instructional': return <BookOpen className="h-5 w-5" />;
      case 'management':
      case 'administrative': return <ClipboardList className="h-5 w-5" />;
      default: return <GraduationCap className="h-5 w-5" />;
    }
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="p-4 bg-red-50 rounded-md">
          <h2 className="text-red-700 font-medium">Error loading categories</h2>
          <p className="text-sm mt-2">Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!displayCategories) {
    return <div className="p-4 text-center">Loading categories...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <header className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-blue-800">NQESH Reviewer</h1>
        <p className="text-sm text-gray-600 mt-2">
          Prepare for the National Qualifying Examination for School Heads
        </p>
        <div className="mt-4">
          <Button
            asChild
            variant="outline"
            className="text-sm"
          >
            <Link to="/dashboard">View Your Progress Dashboard</Link>
          </Button>
        </div>
      </header>

      <Card className="mb-6 bg-blue-50 border-none">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-blue-600 p-2 text-white">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-medium mb-1">About NQESH</h2>
              <p className="text-xs text-gray-700">
                The National Qualifying Examination for School Heads is administered by the Department of Education
                to ensure that candidates for school head positions meet the required competencies and standards.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-sm font-medium mb-3 px-1">Review by Domain</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {displayCategories.map((category) => (
          <Card key={category.id} className="border border-gray-200 shadow-sm hover:shadow transition">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center gap-2">
                <div className="text-blue-600">
                  {getCategoryIcon(category.id)}
                </div>
                <CardTitle className="text-base">{category.name}</CardTitle>
              </div>
              <CardDescription className="text-xs mt-1">
                {category.description}
              </CardDescription>
            </CardHeader>
            <CardFooter className="p-4 pt-2">
              <Button
                asChild
                variant="outline"
                className="w-full text-xs h-8 border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <Link to={`/quiz/${category.id}`}>Start Practice</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <footer className="mt-8 text-center text-xs text-gray-600">
        <p>DepEd NQESH Reviewer © 2025</p>
        <p className="mt-1">This is a practice tool and is not affiliated with the Department of Education</p>
      </footer>
    </div>
  );
}