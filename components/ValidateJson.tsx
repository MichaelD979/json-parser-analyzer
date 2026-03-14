'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { CheckCircle2, XCircle, UploadCloud, FileJson, Plus, Minus } from 'lucide-react'; // Plus for format, Minus for minify (or 0 spaces)
import { cn } from '@/lib/utils';
import { useJsonToolStore } from '@/lib/store';
import { ParsedJsonData } from '@/lib/types';

// Extend ParsedJsonData locally to include specific error line/column for internal use,
// as the main store handles these separately.
interface LocalParseResult extends ParsedJsonData {
  jsonErrorLine: number | null;
  jsonErrorColumn: number | null;
}

/**
 * Attempts to parse a JSON string and extract error line/column if parsing fails.
 * Provides formatted and minified versions if successful.
 * @param jsonString The JSON string to parse.
 * @param formatSpacing The number of spaces to use for pretty printing.
 * @returns A LocalParseResult object containing parsing details.
 */
const parseJsonWithDetailedError = (jsonString: string, formatSpacing: number): LocalParseResult => {
  const startTime = performance.now();
  let parsedObject: any | null = null;
  let isValid = false;
  let error: string | null = null;
  let jsonErrorLine: number | null = null;
  let jsonErrorColumn: number | null = null;
  let formattedJson: string | undefined = undefined;
  let minifiedJson: string | undefined = undefined;

  try {
    parsedObject = JSON.parse(jsonString);
    isValid = true;
    formattedJson = JSON.stringify(parsedObject, null, formatSpacing);
    minifiedJson = JSON.stringify(parsedObject);
  } catch (e: any) {
    isValid = false;
    error = e.message;

    // Simplified error location parsing for basic JSON.parse errors.
    // This heuristic attempts to find "at position X" in the error message.
    const errorMatch = e.message.match(/at position (\d+)/);
    if (errorMatch && jsonString.length > 0) {
      const errorPos = parseInt(errorMatch[1], 10);
      let currentLine = 1;
      let currentColumn = 0; // 0-indexed column internally
      for (let i = 0; i < jsonString.length; i++) {
        if (i === errorPos) {
          jsonErrorLine = currentLine;
          jsonErrorColumn = currentColumn + 1; // Convert to 1-indexed for display
          break;
        }
        if (jsonString[i] === '\n') {
          currentLine++;
          currentColumn = 0;
        } else {
          currentColumn++;
        }
      }
      // Handle cases where the error position is at or beyond the last character
      if (jsonErrorLine === null) {
        // If errorPos is precisely at string.length, it means end of file
        jsonErrorLine = currentLine;
        jsonErrorColumn = currentColumn + 1;
      }
    }
  }

  const parseTimeMs = performance.now() - startTime;
  const sizeBytes = new TextEncoder().encode(jsonString).length;

  return {
    originalInput: jsonString,
    parsedObject,
    isValid,
    error,
    sizeBytes,
    parseTimeMs,
    formattedJson,
    minifiedJson,
    jsonErrorLine,
    jsonErrorColumn,
  };
};

export const ValidateJson = () => {
  const {
    jsonInput,
    parsedData,
    loading,
    jsonErrorLine,
    jsonErrorColumn,
    formatSpacing,
    setJsonInput,
    setParsedData,
    setLoading,
    setFormatSpacing,
    setActiveTab,
  } = useJsonToolStore();

  const [isDragging, setIsDragging] = useState(false);

  // Debounce parsing the JSON input whenever jsonInput or formatSpacing changes
  useEffect(() => {
    setLoading(true);
    const handler = setTimeout(() => {
      if (jsonInput.trim() === '') {
        setParsedData(null);
        useJsonToolStore.setState({ jsonErrorLine: null, jsonErrorColumn: null });
        setLoading(false);
        return;
      }

      const result = parseJsonWithDetailedError(jsonInput, formatSpacing);
      const { jsonErrorLine: detectedLine, jsonErrorColumn: detectedColumn, ...restParsedData } = result;

      setParsedData(restParsedData);
      useJsonToolStore.setState({ jsonErrorLine: detectedLine, jsonErrorColumn: detectedColumn });
      setLoading(false);
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [jsonInput, formatSpacing, setParsedData, setLoading]);


  /** Handles changes in the JSON input textarea. */
  const handleJsonInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
    setActiveTab('editor'); // Ensure the editor tab is active when user types
  }, [setJsonInput, setActiveTab]);

  /** Handles changes in the format spacing select. */
  const handleFormatSpacingChange = useCallback((value: string) => {
    const newSpacing = parseInt(value, 10);
    setFormatSpacing(newSpacing);
    // If there's valid parsed data, immediately re-format it with new spacing
    if (parsedData?.parsedObject) {
      const formatted = JSON.stringify(parsedData.parsedObject, null, newSpacing);
      setParsedData({ ...parsedData, formattedJson: formatted });
    }
  }, [setFormatSpacing, parsedData, setParsedData]);

  /** Handles the formatting of JSON input based on current `formatSpacing`. */
  const handleFormatJson = useCallback(() => {
    if (parsedData?.parsedObject) {
      try {
        setLoading(true);
        const formatted = JSON.stringify(parsedData.parsedObject, null, formatSpacing);
        setJsonInput(formatted); // Update the primary input, triggering re-parse via debounce
        setLoading(false);
      } catch (e: any) {
        setLoading(false);
        // This catch should ideally not be hit if parsedData.parsedObject is valid
        const errorData: ParsedJsonData = {
          originalInput: jsonInput,
          parsedObject: null,
          isValid: false,
          error: `Error during formatting: ${e.message}`,
          sizeBytes: jsonInput ? new TextEncoder().encode(jsonInput).length : 0,
          parseTimeMs: 0,
        };
        setParsedData(errorData);
        useJsonToolStore.setState({ jsonErrorLine: null, jsonErrorColumn: null });
      }
    }
  }, [parsedData, formatSpacing, setJsonInput, setLoading, jsonInput, setParsedData]);

  /** Handles file upload from a File object. */
  const handleFileUpload = useCallback((file: File) => {
    setLoading(true);
    setActiveTab('editor');
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonInput(content); // Update input, debounce will handle parsing
      setLoading(false);
    };
    reader.onerror = () => {
      setLoading(false);
      const errorData: ParsedJsonData = {
        originalInput: '', parsedObject: null, isValid: false,
        error: 'Error reading file. Please try again.', sizeBytes: 0, parseTimeMs: 0,
      };
      setParsedData(errorData);
      useJsonToolStore.setState({ jsonErrorLine: null, jsonErrorColumn: null });
    };
    reader.readAsText(file);
  }, [setJsonInput, setLoading, setParsedData, setActiveTab]);

  /** Handles drag over event for file drop zone. */
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  /** Handles drag leave event for file drop zone. */
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  /** Handles drop event for file drop zone. */
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        handleFileUpload(file);
      } else {
        const errorData: ParsedJsonData = {
          originalInput: '', parsedObject: null, isValid: false,
          error: 'Only JSON files are supported. Please upload a .json file.', sizeBytes: 0, parseTimeMs: 0,
        };
        setParsedData(errorData);
        useJsonToolStore.setState({ jsonErrorLine: null, jsonErrorColumn: null });
      }
      e.dataTransfer.clearData();
    }
  }, [handleFileUpload, setParsedData]);

  /** Handles file selection via the hidden file input. */
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
      e.target.value = ''; // Clear the input to allow uploading the same file again
    }
  }, [handleFileUpload]);

  // Determine validation status badge variant and icon
  const validationBadgeVariant = parsedData?.isValid ? 'success' : parsedData?.error ? 'error' : 'default';
  const validationIcon = parsedData?.isValid ? <CheckCircle2 className="h-4 w-4 mr-1" /> : <XCircle className="h-4 w-4 mr-1" />;
  const validationMessage = parsedData?.isValid ? 'Valid JSON' : parsedData?.error ? 'Invalid JSON' : 'Enter or upload JSON';

  const showInputActions = jsonInput.trim() !== '';

  return (
    <div className="flex flex-col h-full space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">JSON Input & Validation</h2>
        <div className="flex items-center space-x-2">
          {parsedData && (
            <Badge variant={validationBadgeVariant} dot className="px-3 py-1 text-sm">
              {validationIcon}
              {validationMessage}
            </Badge>
          )}
          {loading && (
            <Badge variant="info" className="animate-pulse px-3 py-1 text-sm">
              Processing...
            </Badge>
          )}
        </div>
      </div>

      <div
        className={cn(
          "flex-grow relative border-2 border-dashed rounded-md p-2 flex flex-col transition-colors min-h-[200px]",
          isDragging ? "border-brand-500 bg-brand-50 dark:bg-brand-950" : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600",
          parsedData?.error ? 'border-red-500 dark:border-red-700' : ''
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* File upload overlay for drag and drop */}
        {isDragging && (
          <div className="absolute inset-0 bg-brand-500/10 dark:bg-brand-700/10 flex items-center justify-center text-brand-700 dark:text-brand-300 z-10 rounded-md">
            <UploadCloud className="h-16 w-16 opacity-75" />
            <span className="ml-4 text-2xl font-medium">Drop JSON file here</span>
          </div>
        )}

        <div className="flex justify-between items-center mb-2 z-20"> {/* Z-index to keep buttons clickable */}
          <Label htmlFor="json-input" className="sr-only">JSON Input</Label>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => document.getElementById('file-upload-input')?.click()} disabled={loading}>
                    <FileJson className="h-4 w-4 mr-2" /> Upload JSON
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Upload a JSON file from your computer (.json)
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Input
              id="file-upload-input"
              type="file"
              accept=".json"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={loading}
            />
            {showInputActions && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleFormatJson}
                        disabled={!parsedData?.isValid || loading}
                      >
                        {formatSpacing === 0 ? <Minus className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                        {formatSpacing === 0 ? 'Minify' : 'Format'}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {formatSpacing === 0 ? 'Minify the JSON input' : 'Pretty format the JSON input'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Select onValueChange={handleFormatSpacingChange} value={String(formatSpacing)}>
                  <SelectTrigger className="w-[100px] h-9">
                    <SelectValue placeholder="Spaces" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Minify</SelectItem>
                    <SelectItem value="2">2 Spaces</SelectItem>
                    <SelectItem value="4">4 Spaces</SelectItem>
                    <SelectItem value="8">8 Spaces</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </div>

        <Textarea
          id="json-input"
          value={jsonInput}
          onChange={handleJsonInputChange}
          placeholder="Paste or drop JSON here, or click 'Upload JSON'..."
          className={cn(
            "flex-grow font-mono text-sm leading-relaxed resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent bg-transparent",
            parsedData?.error ? 'text-red-500 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'
          )}
          rows={15} // Provides a minimum height, flex-grow stretches it
          disabled={loading}
          spellCheck="false"
          autoCorrect="off"
          autoCapitalize="off"
        />

        {parsedData?.error && (
          <div className="mt-2 text-sm text-red-500 dark:text-red-400 font-medium">
            <p className="font-semibold flex items-center"><XCircle className="h-4 w-4 mr-1 inline-block" /> Syntax Error:</p>
            <p className="ml-5">{parsedData.error}</p>
            {jsonErrorLine !== null && jsonErrorColumn !== null && (
              <p className="ml-5">at Line {jsonErrorLine}, Column {jsonErrorColumn}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};