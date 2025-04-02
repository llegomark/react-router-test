// app/components/MarkdownRenderer.tsx
import React from 'react';

interface MarkdownRendererProps {
    children: string;
    className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ children, className }) => {
    // Ensure content is always a string
    const content = typeof children === 'string' ? children : String(children || '');

    /**
     * Processes markdown text, specifically looking for table syntax
     * and converting it into an HTML table with Tailwind CSS classes.
     * @param text - The markdown string to process.
     * @returns An HTML string with tables rendered.
     */
    const processMarkdown = (text: string): string => {
        // Check if the text contains potential table syntax
        if (text.includes('|')) {
            const lines = text.split('\n');
            const processedLines: string[] = []; // Store processed lines (HTML tables or original lines)
            let currentTableHtml = ''; // Accumulates HTML for the current table being processed
            let inTable = false; // Flag to track if we are currently inside a table block

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();

                // Basic checks for table lines (must start and end with '|')
                const isTableLine = line.startsWith('|') && line.endsWith('|');
                // Check for the header separator line (e.g., |---|---|)
                const isHeaderSeparator = isTableLine && line.includes('-') && !line.match(/[a-zA-Z0-9]/); // Avoid matching lines with actual content

                if (isTableLine && !isHeaderSeparator) {
                    // Start of a new table or continuation of the current one
                    if (!inTable) {
                        inTable = true;
                        // Initialize table structure with Tailwind classes
                        currentTableHtml = '<div class="overflow-x-auto my-4 rounded-lg shadow"><table class="min-w-full divide-y divide-gray-200 border border-gray-300">';
                    }

                    // Split the line into cells (remove leading/trailing empty elements from split)
                    const cells = line.split('|').slice(1, -1);
                    // Check if the *next* line is the header separator to identify the current line as the header
                    const isHeaderRow = i + 1 < lines.length && lines[i + 1]?.trim().startsWith('|') && lines[i + 1].includes('-') && !lines[i + 1].match(/[a-zA-Z0-9]/);

                    if (isHeaderRow) {
                        // --- Apply enhanced header styling ---
                        currentTableHtml += '<thead class="bg-gray-800 sticky top-0 z-10">'; // Darker background, sticky
                        currentTableHtml += '<tr>';
                        cells.forEach(cell => {
                            // --- Style header cells ---
                            currentTableHtml += `<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">${cell.trim()}</th>`; // White text, padding, font style
                        });
                        currentTableHtml += '</tr></thead><tbody class="bg-white divide-y divide-gray-200">';
                        // Skip the next line as it's the separator
                        i++;
                    } else {
                        // Regular table row
                        currentTableHtml += '<tr class="hover:bg-gray-50">'; // Add hover effect
                        cells.forEach(cell => {
                            currentTableHtml += `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${cell.trim()}</td>`; // Standard cell styling
                        });
                        currentTableHtml += '</tr>';
                    }
                } else if (inTable && !isTableLine) {
                    // End of the current table block
                    inTable = false;
                    currentTableHtml += '</tbody></table></div>'; // Close table tags
                    processedLines.push(currentTableHtml); // Add the completed table HTML
                    currentTableHtml = ''; // Reset for potential next table
                    processedLines.push(formatNonTableMarkdown(lines[i])); // Process the current non-table line
                } else if (!inTable) {
                    // Line is not part of a table, process as regular markdown
                    processedLines.push(formatNonTableMarkdown(lines[i]));
                }
                // Ignore header separator lines if encountered outside the isTableLine logic
            }

            // If the text ends while still inside a table
            if (inTable) {
                currentTableHtml += '</tbody></table></div>';
                processedLines.push(currentTableHtml);
            }

            // Join all processed lines (HTML tables and formatted markdown lines)
            // Use <br> for single line breaks within paragraphs, handled by formatNonTableMarkdown
            return processedLines.join('\n').replace(/\n(?!\s*<[bhul])/g, '<br>'); // Add <br> for line breaks unless it's before specific tags

        }

        // If no tables are detected, format the entire text as non-table markdown
        return formatNonTableMarkdown(text).replace(/\n/g, '<br>'); // Add <br> for all line breaks if no tables
    };

    /**
     * Handles basic markdown formatting like bold, italic, and lists.
     * @param text - The markdown string (potentially a single line).
     * @returns HTML string with basic formatting applied.
     */
    const formatNonTableMarkdown = (text: string): string => {
        let html = text
            // Bold: **text** -> <strong>text</strong>
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic: *text* -> <em>text</em>
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Basic Unordered List Items: * item -> <li>item</li> or - item -> <li>item</li>
            .replace(/^\s*[-*]\s+(.*)$/gm, '<li>$1</li>');

        // Wrap consecutive <li> items in <ul> tags
        // This regex looks for one or more <li> elements, possibly separated by newlines
        html = html.replace(/(?:<li>.*?<\/li>\s*)+/g, (match) => {
            // Trim trailing whitespace/newlines from the match before wrapping
            return `<ul class="list-disc list-inside my-2 pl-4">${match.trim()}</ul>`;
        });

        return html;
    };

    // Render the processed content using dangerouslySetInnerHTML.
    // Ensure the source of `children` is trusted to prevent XSS vulnerabilities.
    return (
        <div
            className={className}
            dangerouslySetInnerHTML={{ __html: processMarkdown(content) }}
        />
    );
};

export default MarkdownRenderer;
