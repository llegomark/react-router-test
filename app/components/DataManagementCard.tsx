// Enhanced DataManagementCard.tsx that properly handles query invalidation

import { useState, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query"; // Import useQueryClient hook
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "./ui/card";
import { Button } from "./ui/button";
import {
    Download,
    Upload,
    Check,
    AlertTriangle,
    Info
} from "lucide-react";
import {
    exportProgress,
    importProgress
} from "../services/progressStorage";
import { dashboardKeys } from "../lib/dashboard-queries"; // Import dashboard query keys
import { toast } from "sonner";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip";

export function DataManagementCard() {
    const [isImporting, setIsImporting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorDetails, setErrorDetails] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient(); // Get query client from hook

    // Properly invalidate queries inside the component
    const invalidateQueries = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    }, [queryClient]);

    const handleExport = () => {
        setIsExporting(true);
        try {
            exportProgress();
            toast.success("Progress data exported successfully");
            console.log("Export initiated from UI");
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Failed to export progress data");
        } finally {
            setIsExporting(false);
        }
    };

    const handleImportClick = () => {
        // Reset status
        setImportStatus('idle');
        setErrorDetails(null);

        // Open file picker
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            console.log("No file selected");
            return;
        }

        setIsImporting(true);
        setImportStatus('idle');
        setErrorDetails(null);

        // Log file details
        console.log("Import - File selected:", {
            name: file.name,
            type: file.type,
            size: file.size
        });

        try {
            const success = await importProgress(file);

            if (success) {
                setImportStatus('success');
                // Invalidate queries to refresh data
                invalidateQueries(); // Use the callback with the hook
                toast.success("Progress data imported successfully");
            } else {
                setImportStatus('error');
                setErrorDetails("The file could not be imported. Check browser console for details.");
                toast.error("Failed to import progress data");
            }
        } catch (error) {
            console.error("Import failed:", error);
            setImportStatus('error');
            setErrorDetails(error instanceof Error ? error.message : "Unknown error occurred");
            toast.error("Failed to import progress data");
        } finally {
            setIsImporting(false);
            // Reset the file input
            event.target.value = '';
        }
    };

    return (
        <TooltipProvider>
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Data Management</CardTitle>
                    <CardDescription>Export or import your progress data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded-md text-xs text-blue-700">
                        <p className="mb-1 font-medium">Why export your data?</p>
                        <p>If you're changing browsers or devices, you can export your progress data and import it again later to keep your study history.</p>
                    </div>

                    {importStatus === 'success' && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-md text-xs text-green-700">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>Data imported successfully!</span>
                        </div>
                    )}

                    {importStatus === 'error' && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-md text-xs text-red-700">
                                <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                                <span>Failed to import data. Make sure the file format is correct.</span>
                            </div>
                            {errorDetails && (
                                <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-md text-xs text-gray-700">
                                    <Info className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-medium mb-1">Technical details:</div>
                                        <div className="text-gray-600 break-words">{errorDetails}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Hidden file input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept=".json"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </CardContent>
                <CardFooter className="flex gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={handleExport}
                                variant="outline"
                                size="sm"
                                className="gap-1.5 text-xs h-8"
                                disabled={isExporting}
                            >
                                <Download className="h-3.5 w-3.5" />
                                {isExporting ? "Exporting..." : "Export Data"}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs">Download your progress as a JSON file</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={handleImportClick}
                                variant="outline"
                                size="sm"
                                className="gap-1.5 text-xs h-8"
                                disabled={isImporting}
                            >
                                <Upload className="h-3.5 w-3.5" />
                                {isImporting ? "Importing..." : "Import Data"}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs">Upload a previously exported JSON file</p>
                        </TooltipContent>
                    </Tooltip>
                </CardFooter>
            </Card>
        </TooltipProvider>
    );
}