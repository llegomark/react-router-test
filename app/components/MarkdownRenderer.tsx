// app/components/MarkdownRenderer.tsx
import React from 'react';

interface MarkdownRendererProps {
    children: string;
    className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ children, className }) => {
    const content = typeof children === 'string' ? children : String(children || '');

    // Process markdown text to render tables as HTML
    const processMarkdown = (text: string): string => {
        // Process tables
        if (text.includes('|')) {
            const lines = text.split('\n');
            const tableLines: string[] = [];
            let inTable = false;
            let tableHtml = '<div class="overflow-x-auto my-4"><table class="min-w-full divide-y divide-gray-200 border border-gray-200">';

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                // Check if line is part of a table
                const isTableLine = line.trim().startsWith('|') && line.trim().endsWith('|');
                const isHeaderSeparator = line.trim().startsWith('|') && line.includes('-') && !line.match(/[a-zA-Z]/);

                if (isTableLine || isHeaderSeparator) {
                    if (!inTable) {
                        inTable = true;
                    }

                    if (isHeaderSeparator) {
                        // Skip header separator, already handled
                        continue;
                    }

                    const cells = line.split('|').slice(1, -1);
                    const isHeader = i + 1 < lines.length && lines[i + 1]?.includes('-|-');

                    if (isHeader) {
                        tableHtml += '<thead class="bg-gray-50"><tr>';
                        cells.forEach(cell => {
                            tableHtml += `<th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${cell.trim()}</th>`;
                        });
                        tableHtml += '</tr></thead><tbody class="divide-y divide-gray-200 bg-white">';
                    } else {
                        tableHtml += '<tr class="hover:bg-gray-50">';
                        cells.forEach(cell => {
                            tableHtml += `<td class="px-3 py-2 text-sm">${cell.trim()}</td>`;
                        });
                        tableHtml += '</tr>';
                    }
                } else if (inTable) {
                    inTable = false;
                    tableHtml += '</tbody></table></div>';
                    tableLines.push(tableHtml);
                    tableHtml = '<div class="overflow-x-auto my-4"><table class="min-w-full divide-y divide-gray-200 border border-gray-200">';

                    // Process this non-table line
                    tableLines.push(line);
                } else {
                    tableLines.push(line);
                }
            }

            // Close table if we ended while still in one
            if (inTable) {
                tableHtml += '</tbody></table></div>';
                tableLines.push(tableHtml);
            }

            // Join all lines and apply other markdown formatting
            return formatNonTableMarkdown(tableLines.join('\n'));
        }

        // If no tables, just format the regular markdown
        return formatNonTableMarkdown(text);
    };

    // Handle basic markdown formatting
    const formatNonTableMarkdown = (text: string): string => {
        return text
            // Paragraphs
            .replace(/\n\n/g, '<br><br>')
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Lists (basic support)
            .replace(/^\s*[\-\*]\s+(.*)/gm, '<li>$1</li>')
            // Replace list items with proper lists
            .replace(/<li>.*?<\/li>(\n<li>.*?<\/li>)*/g, match =>
                `<ul class="list-disc ml-4 my-2">${match}</ul>`);
    };

    // Using dangerouslySetInnerHTML in a controlled manner for the tables
    // This is safe since the content comes from your own data source, not user input
    return (
        <div
            className={className}
            dangerouslySetInnerHTML={{ __html: processMarkdown(content) }}
        />
    );
};

export default MarkdownRenderer;