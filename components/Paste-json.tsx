'use client';

import React, { useRef, ChangeEvent, useCallback } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Wand2 } from 'lucide-react';
import { useJsonParserStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { IndentStyle } from '@/lib/types';

/**
 * Helper function to format JSON with indentation and optional key sorting.
 * This function processes a JavaScript object and returns a formatted JSON string.
 */
function formatJsonString(data: unknown, indentStyle: IndentStyle, sortKeys: boolean): string {
  if (data === null || typeof data === 'undefined') {
    return '';
  }

  const space = indentStyle === '2Spaces' ? 2 : indentStyle === '4Spaces' ? 4 : '\t';

  // Custom replacer for sorting object keys alphabetically
  const replacer = sortKeys
    ? (key: string, value: unknown) => {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          // Create a new object with sorted keys
          return Object.keys(value)
            .sort()
            .reduce((sorted: { [k: string]: unknown }, k) => {
              sorted[k] = (value as { [k: string]: unknown })[k];
              return sorted;
            }, {});
        }
        return value;
      }
    : undefined; // No custom replacer if sorting is not needed

  try {
    return JSON.stringify(data, replacer, space);
  } catch (e) {
    // Fallback to basic stringify in case of an unexpected error during formatting
    console.error('Failed to format JSON string:', e);
    return JSON.stringify(data);
  }
}

/**
 * PasteJson component provides an interface for users to input JSON data,
 * either by pasting into a textarea or uploading a file. It includes
 * actions for formatting and clearing the input, along with real-time
 * validation feedback.
 */
export const PasteJson = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Retrieve necessary state and actions from the Zustand store
  const {
    json: { input, isValid, error, isProcessing, parsed },
    formatting: { indentStyle, sortKeys },
    setJsonInput,
    clearAll,
  } = useJsonParserStore((state) => ({
    json: state.json,
    formatting: state.formatting,
    setJsonInput: state.setJsonInput,
    clearAll: state.clearAll,
  }));

  /**
   * Handles changes in the textarea, updating the JSON input in the store.
   */
  const handleTextareaChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setJsonInput(e.target.value);
    },
    [setJsonInput]
  );

  /**
   * Triggers a click on the hidden file input element, opening the file selection dialog.
   */
  const handleUploadButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Handles the file selection event. Reads the content of the selected JSON file
   * and sets it as the JSON input in the store.
   */
  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setJsonInput(content);
        };
        reader.onerror = (event) => {
          console.error('File reading error:', event.target?.error);
          setJsonInput('Error reading file.'); // Inform the user about the file reading error
        };
        reader.readAsText(file);

        // Clear the file input value to allow re-uploading the same file multiple times
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [setJsonInput]
  );

  /**
   * Clears all JSON input, output, and related states in the store.
   */
  const handleClearClick = useCallback(() => {
    clearAll();
  }, [clearAll]);

  /**
   * Formats the currently parsed JSON data using the selected formatting options
   * and updates the input textarea with the formatted string.
   */
  const handleFormatClick = useCallback(() => {
    // Only format if there's valid parsed JSON available
    if (parsed) {
      const formattedString = formatJsonString(parsed, indentStyle, sortKeys);
      setJsonInput(formattedString); // Replace current input with its formatted version
    }
  }, [parsed, indentStyle, sortKeys, setJsonInput]);

  // Determine the appropriate icon for validation status
  const validationIcon = isValid ? (
    <CheckCircle className="h-4 w-4 text-green-500" />
  ) : error ? (
    <AlertCircle className="h-4 w-4 text-red-500" />
  ) : null;

  // Determine the appropriate badge for validation status
  const validationStatusBadge = isValid ? (
    <Badge variant="success" dot={true}>
      Valid JSON
    </Badge>
  ) : error ? (
    <Badge variant="error" dot={true}>
      Invalid JSON
    </Badge>
  ) : (
    <Badge variant="info" dot={true}>
      Waiting for input
    </Badge>
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full overflow-hidden border-r border-gray-200 dark:border-gray-800">
        <div className="flex flex-wrap items-center justify-between p-2 gap-2 bg-gray-50 dark:bg-gray-900">
          <Label htmlFor="json-input" className="text-sm font-semibold flex items-center gap-2">
            JSON Input
            {validationIcon && (
              <Tooltip>
                <TooltipTrigger asChild>{validationIcon}</TooltipTrigger>
                <TooltipContent>{error || (isValid ? 'JSON is valid' : 'No input')}</TooltipContent>
              </Tooltip>
            )}
            {validationStatusBadge}
          </Label>
          <div className="flex flex-wrap gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUploadButtonClick}
                  disabled={isProcessing}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              </TooltipTrigger>
              <TooltipContent>Upload a JSON file from your computer.</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFormatClick}
                  disabled={!isValid || isProcessing || !parsed}
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Pretty Format
                </Button>
              </TooltipTrigger>
              <TooltipContent>Format the JSON in the editor using current settings.</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleClearClick}
                  disabled={isProcessing || !input}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear all input and reset the tool.</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <Separator className="my-0" />
        <div className="flex-1 overflow-auto relative p-2">
          <Textarea
            id="json-input"
            value={input}
            onChange={handleTextareaChange}
            placeholder="Paste your JSON here or upload a file..."
            className={cn(
              'font-mono text-sm resize-none border-none focus-visible:ring-0 p-0 h-full w-full',
              'bg-transparent dark:bg-transparent', // Ensure transparent background
              error && 'focus-visible:ring-red-500' // Apply red ring on error focus
            )}
            error={!!error}
            // Display the error message below the textarea if present
            hint={error ? <span className="text-sm text-red-500">{error}</span> : undefined}
          />
          {/* Hidden file input element */}
          <Input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden" // Keep the input hidden, triggered by the button
          />
        </div>
      </div>
    </TooltipProvider>
  );
};