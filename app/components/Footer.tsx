// app/components/Footer.tsx
import { Link } from "react-router";
import { GraduationCap, BookOpen, School, ClipboardList, Heart } from "lucide-react";
import { Separator } from "./ui/separator";

export function Footer() {
    const currentYear = new Date().getFullYear();

    // Category links for footer - compact version with fewer items
    const categories = [
        { id: "leadership", name: "School Leadership", icon: <School className="h-3 w-3" /> },
        { id: "management", name: "Educational Management", icon: <ClipboardList className="h-3 w-3" /> },
        { id: "instructional", name: "Instructional Leadership", icon: <BookOpen className="h-3 w-3" /> },
    ];

    return (
        <footer className="bg-gray-50 border-t mt-8">
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    {/* App info */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                            <div className="rounded-full bg-blue-600 p-1 text-white">
                                <GraduationCap className="h-3 w-3" />
                            </div>
                            <span className="font-medium text-xs">NQESH Reviewer</span>
                        </div>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                            A study tool for the National Qualifying Examination for School Heads.
                        </p>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="font-medium mb-2 text-xs">Exam Categories</h3>
                        <ul className="space-y-1.5">
                            {categories.map((category) => (
                                <li key={category.id}>
                                    <Link
                                        to={`/reviewer/${category.id}`}
                                        className="text-muted-foreground hover:text-foreground text-xs flex items-center gap-1.5"
                                    >
                                        {category.icon}
                                        {category.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-medium mb-2 text-xs">Links</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                            <Link
                                to="/"
                                className="text-muted-foreground hover:text-foreground text-xs"
                            >
                                Home
                            </Link>
                            <Link
                                to="/dashboard"
                                className="text-muted-foreground hover:text-foreground text-xs"
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/reviewer/administrative"
                                className="text-muted-foreground hover:text-foreground text-xs"
                            >
                                Administrative
                            </Link>
                            <Link
                                to="/reviewer/legal"
                                className="text-muted-foreground hover:text-foreground text-xs"
                            >
                                Legal Aspects
                            </Link>
                        </div>
                    </div>
                </div>

                <Separator className="my-4" />

                <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                    <p className="text-[10px] text-muted-foreground">
                        &copy; {currentYear} NQESH Reviewer
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <span>Made with</span>
                        <Heart className="h-2.5 w-2.5 text-red-500 fill-red-500" />
                        <span>for Philippine educators</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}