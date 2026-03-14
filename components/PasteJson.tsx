'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { useJsonToolStore } from '@/lib/store';
import { ParsedJsonData } from '@/lib/types';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Upload, ClipboardPaste, Wand2 } from 'lucide-react';
import { cn, formatBytes } from '@/lib/utils';

// --- Local JSON utility functions ---
// In a production app, these would typically be in a dedicated utility file (e.g., lib/json-parser.ts)
// For this component, they are defined here to satisfy the requirement without creating new files.

/**
 * Safely parses a JSON string and returns structured data including validity and potential errors.
 * This function also calculates size and parse time.
 */
const parseJsonSafely = (jsonString: string): ParsedJsonData => {
  const startTime = performance.now();
  try {
    const parsedObject = JSON.parse(jsonString);
    const endTime = performance.now();
    return {
      originalInput: jsonString,
      parsedObject,
      isValid: true,
      error: null,
      sizeBytes: new TextEncoder().encode(jsonString).length,
      parseTimeMs: endTime - startTime,
    };
  } catch (e: any) {
    const endTime = performance.now();
    const errorString = e.message || 'Unknown JSON parsing error';
    return {
      originalInput: jsonString,
      parsedObject: null,
      isValid: false,
      error: errorString,
      sizeBytes: new TextEncoder().encode(jsonString).length,
      parseTimeMs: endTime - startTime,
    };
  }
};

/**
 * Safely formats a JSON string with a specified number of spaces.
 * Returns the original string if parsing/formatting fails.
 */
const formatJsonSafely = (jsonString: string, spacing: number): string => {
  try {
    const obj = JSON.parse(jsonString);
    return JSON.stringify(obj, null, spacing);
  } catch (e) {
    console.error('Error formatting JSON:', e);
    return jsonString; // Return original if formatting fails
  }
};
// --- End Local JSON utility functions ---


export const PasteJson = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Destructure state and actions from the Zustand store
  const {
    jsonInput,
    parsedData,
    loading,
    formatSpacing,
    jsonErrorLine,
    jsonErrorColumn,
    setJsonInput,
    setParsedData,
    setLoading,
    setFormatSpacing,
  } = useJsonToolStore((state) => ({
    jsonInput: state.jsonInput,
    parsedData: state.parsedData,
    loading: state.loading,
    formatSpacing: state.formatSpacing,
    jsonErrorLine: state.jsonErrorLine,
    jsonErrorColumn: state.jsonErrorColumn,
    setJsonInput: state.setJsonInput,
    setParsedData: state.setParsedData,
    setLoading: state.setLoading,
    setFormatSpacing: state.setFormatSpacing,
  }));

  // Effect to parse and validate JSON whenever the input string changes
  useEffect(() => {
    if (jsonInput.trim() === '') {
      setParsedData(null); // Clear parsed data if input is empty
      // Assuming the store will also clear jsonErrorLine/Column when parsedData is null
      return;
    }

    setLoading(true);
    // Debounce the parsing operation to avoid excessive computations during typing
    const handler = setTimeout(() => {
      const result: ParsedJsonData = parseJsonSafely(jsonInput);
      setParsedData(result); // Update store with parsing results
      setLoading(false);
    }, 300); // 300ms debounce

    // Cleanup function for the effect
    return () => clearTimeout(handler);
  }, [jsonInput, setParsedData, setLoading]); // Dependencies

  /**
   * Handles changes in the textarea, updating the raw JSON input in the store.
   */
  const handleTextAreaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
  };

  /**
   * Handles file uploads, reading the file content and updating the JSON input.
   */
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setJsonInput(content); // Update JSON input with file content
        setLoading(false);
      };
      reader.onerror = () => {
        console.error('File reading error:', reader.error);
        setLoading(false);
        // TODO: Optionally, set an error message in the store for UI feedback
      };
      reader.readAsText(file);
    }
    // Reset file input value to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Formats the current JSON input based on the selected spacing and updates the input.
   */
  const handleFormatJson = () => {
    if (jsonInput.trim() === '') return; // Do nothing if input is empty

    setLoading(true);
    const formatted = formatJsonSafely(jsonInput, formatSpacing);
    setJsonInput(formatted); // Update the input with the formatted string
    setLoading(false);
  };

  /**
   * Handles changes in the format spacing select, updating the store.
   */
  const handleSpacingChange = (value: string) => {
    setFormatSpacing(Number(value));
  };

  /**
   * Pastes content from the clipboard into the JSON input.
   */
  const handlePasteFromClipboard = async () => {
    try {
      setLoading(true);
      const text = await navigator.clipboard.readText();
      setJsonInput(text);
      setLoading(false);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      // TODO: Optionally, show a user-friendly error message
      setLoading(false);
    }
  };

  // Construct error message for the Textarea based on parsing results and store's error line/column
  const errorMessage = parsedData && !parsedData.isValid && parsedData.error
    ? `Error (Line ${jsonErrorLine || '?'}, Col ${jsonErrorColumn || '?'}): ${parsedData.error}`
    : '';

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardPaste className="h-5 w-5 text-brand" /> Paste / Upload JSON
          {parsedData && (
            <Badge
              variant={parsedData.isValid ? 'success' : 'error'}
              dot={true}
              className="ml-2"
            >
              {parsedData.isValid ? 'Valid JSON' : 'Invalid JSON'}
            </Badge>
          )}
          {parsedData?.sizeBytes !== null && (
            <Badge variant="info" className="ml-2">
              Size: {formatBytes(parsedData.sizeBytes || 0)}
            </Badge>
          )}
          {parsedData?.parseTimeMs !== null && (
            <Badge variant="info" className="ml-2">
              Parse Time: {parsedData.parseTimeMs?.toFixed(2) || 0} ms
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex h-full flex-col gap-3 p-4 pt-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="sm"
            loading={loading}
          >
            <Upload className="mr-2 h-4 w-4" /> Upload File
          </Button>
          <Input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileUpload}
            disabled={loading}
          />

          <Button
            onClick={handlePasteFromClipboard}
            variant="outline"
            size="sm"
            loading={loading}
          >
            <ClipboardPaste className="mr-2 h-4 w-4" /> Paste from Clipboard
          </Button>

          <Separator orientation="vertical" className="mx-2 h-6" />

          <Button
            onClick={handleFormatJson}
            variant="outline"
            size="sm"
            loading={loading}
            disabled={jsonInput.trim() === '' || loading}
          >
            <Wand2 className="mr-2 h-4 w-4" /> Format
          </Button>

          <Select onValueChange={handleSpacingChange} value={String(formatSpacing)}>
            <SelectTrigger className="w-[100px]" disabled={jsonInput.trim() === '' || loading}>
              <SelectValue placeholder="Spacing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 Spaces</SelectItem>
              <SelectItem value="4">4 Spaces</SelectItem>
              <SelectItem value="0">Minify</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Textarea
          value={jsonInput}
          onChange={handleTextAreaChange}
          placeholder='Paste JSON here, or upload a .json file. Example: {"key": "value"}'
          className={cn(
            'flex-1 font-mono text-sm resize-none',
            parsedData && !parsedData.isValid && 'border-red-500 ring-red-500 focus-visible:ring-red-500' // Highlight border on error
          )}
          rows={10} // Provides an initial size, flex-1 ensures it fills available space
          error={errorMessage}
          disabled={loading}
        />
      </CardContent>
    </Card>
  );
};