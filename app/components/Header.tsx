// app/components/Header.tsx
import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useIsMobile } from "../hooks/use-mobile";
import { GraduationCap, Menu, BarChart, Home } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetClose,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

export function Header() {
    const location = useLocation();
    const isMobile = useIsMobile();
    const [isOpen, setIsOpen] = useState(false);

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    // Navigation items
    const navItems = [
        { name: "Home", path: "/", icon: <Home className="h-3.5 w-3.5" /> },
        { name: "Dashboard", path: "/dashboard", icon: <BarChart className="h-3.5 w-3.5" /> }
    ];

    return (
        <header className="w-full border-b bg-background">
            <div className="max-w-4xl mx-auto px-4 flex h-12 items-center justify-between">
                {/* Logo and title */}
                <div className="flex items-center gap-1.5">
                    <Link to="/" className="flex items-center gap-1.5">
                        <div className="rounded-full bg-blue-600 p-1 text-white">
                            <GraduationCap className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-xs sm:text-sm">NQESH Reviewer</span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                {!isMobile && (
                    <nav className="flex items-center gap-0.5">
                        {navItems.map((item) => (
                            <Button
                                key={item.path}
                                variant={isActive(item.path) ? "secondary" : "ghost"}
                                size="sm"
                                asChild
                                className="gap-1 h-7 text-xs"
                            >
                                <Link to={item.path}>
                                    {item.icon}
                                    {item.name}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                )}

                {/* Mobile Navigation Menu */}
                {isMobile && (
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="sm" aria-label="Menu" className="h-7 w-7 p-0">
                                <Menu className="h-4 w-4" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-64 sm:max-w-sm pr-0">
                            <div className="flex h-12 items-center px-2">
                                <div className="flex items-center gap-2">
                                    <div className="rounded-full bg-blue-600 p-1 text-white">
                                        <GraduationCap className="h-4 w-4" />
                                    </div>
                                    <span className="font-medium text-sm">NQESH Reviewer</span>
                                </div>
                            </div>
                            <Separator />
                            <nav className="flex flex-col gap-1 py-4">
                                {navItems.map((item) => (
                                    <SheetClose key={item.path} asChild>
                                        <Button
                                            variant={isActive(item.path) ? "secondary" : "ghost"}
                                            size="sm"
                                            className="w-full justify-start gap-2 pl-4 text-xs"
                                            asChild
                                        >
                                            <Link to={item.path}>
                                                {item.icon}
                                                {item.name}
                                            </Link>
                                        </Button>
                                    </SheetClose>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                )}
            </div>
        </header>
    );
}