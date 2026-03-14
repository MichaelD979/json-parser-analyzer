'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Upload, Clipboard, Check, X, FileJson, Indent, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useJsonParserStore } from '@/lib/store';
import { IndentStyle } from '@/lib/types';

// Helper function to determine JSON indentation
const getIndent = (indentStyle: IndentStyle): string | number => {
  switch (indentStyle) {
    case '2Spaces': return 2;
    case '4Spaces': return 4;
    case 'Tabs': return '\t';
    default: return 2; // Default to 2 spaces
  }
};

// Helper function for sorting object keys
const sortKeysReplacer = (key: string, value: any): any => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const sortedKeys = Object.keys(value).sort();
    return sortedKeys.reduce((sorted: Record<string, any>, k) => {
      // Recursively apply replacer for nested objects
      sorted[k] = sortKeysReplacer(k, value[k]);
      return sorted;
    }, {});
  }
  return value;
};

// Helper function to pretty print JSON
const prettyPrintJson = (
  data: unknown,
  indentStyle: IndentStyle,
  sortKeys: boolean
): string => {
  const indent = getIndent(indentStyle);
  const replacer = sortKeys ? sortKeysReplacer : null;
  return JSON.stringify(data, replacer, indent);
};

export const ValidateJson = () => {
  const {
    json: { input, isValid, error, isProcessing },
    formatting: { indentStyle, sortKeys },
    setJsonInput,
    setJsonIsValid,
    setJsonError,
    setJsonParsed,
    setJsonOutput,
    setIsProcessing,
    clearAll,
  } = useJsonParserStore((state) => ({
    json: state.json,
    formatting: state.formatting,
    setJsonInput: state.setJsonInput,
    setJsonIsValid: state.setJsonIsValid,
    setJsonError: state.setJsonError,
    setJsonParsed: state.setJsonParsed,
    setJsonOutput: state.setJsonOutput,
    setIsProcessing: state.setIsProcessing,
    clearAll: state.clearAll,
  }));

  // Debounce input changes for validation
  useEffect(() => {
    setIsProcessing(true);
    const handler = setTimeout(() => {
      if (!input.trim()) {
        setJsonIsValid(false);
        setJsonError(null);
        setJsonParsed(null);
        setJsonOutput('');
        setIsProcessing(false);
        return;
      }

      try {
        const parsedData = JSON.parse(input);
        setJsonIsValid(true);
        setJsonError(null);
        setJsonParsed(parsedData);
        // Automatically pretty print valid JSON to output
        setJsonOutput(prettyPrintJson(parsedData, indentStyle, sortKeys));
      } catch (e: any) {
        setJsonIsValid(false);
        setJsonError(e.message);
        setJsonParsed(null);
        setJsonOutput('');
      } finally {
        setIsProcessing(false);
      }
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
      setIsProcessing(false); // Ensure processing flag is reset on unmount or re-render
    };
  }, [input, indentStyle, sortKeys, setJsonIsValid, setJsonError, setJsonParsed, setJsonOutput, setIsProcessing]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setJsonInput(content);
      };
      reader.readAsText(file);
      // Reset the input value to allow uploading the same file again if needed
      if (event.target) {
        event.target.value = '';
      }
    }
  }, [setJsonInput]);

  const handlePrettyPrint = useCallback(() => {
    if (isValid && useJsonParserStore.getState().json.parsed) {
      const parsedData = useJsonParserStore.getState().json.parsed;
      const formattedJson = prettyPrintJson(parsedData, indentStyle, sortKeys);
      setJsonOutput(formattedJson);
      setJsonInput(formattedJson); // Also update input with formatted version for consistency
    }
  }, [isValid, indentStyle, sortKeys, setJsonInput, setJsonOutput]);

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJsonInput(text);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      // Optionally show a transient error notification to the user
    }
  }, [setJsonInput]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="h-6 w-6 text-brand-500" /> JSON Input & Validation
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow p-4 pt-0">
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <Input
            id="json-file-upload"
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden" // Hide the default input
            ref={fileInputRef}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 min-w-0"
            disabled={isProcessing}
          >
            <Upload className="mr-2 h-4 w-4" /> Upload JSON File
          </Button>
          <Button
            variant="outline"
            onClick={handlePasteFromClipboard}
            className="flex-1 min-w-0"
            disabled={isProcessing}
          >
            <Clipboard className="mr-2 h-4 w-4" /> Paste from Clipboard
          </Button>
          <Button
            variant="outline"
            onClick={handlePrettyPrint}
            disabled={!isValid || isProcessing}
            className="flex-1 min-w-0"
          >
            <Indent className="mr-2 h-4 w-4" /> Pretty Print
          </Button>
          <Button
            variant="outline"
            onClick={clearAll}
            disabled={isProcessing || !input.trim()}
            className="flex-1 min-w-0"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Clear Input
          </Button>
        </div>

        <Separator label="Input Editor" className="mb-4" />

        <div className="relative flex-grow min-h-[200px]">
          <Textarea
            id="json-input"
            label="JSON Input"
            value={input}
            onChange={(e) => setJsonInput(e.target.value)}
            error={!!error}
            hint={error || (isProcessing ? 'Validating...' : 'Paste or type JSON here')}
            placeholder='Enter or paste your JSON here, e.g., {"key": "value"}'
            className={cn("min-h-[200px] font-mono text-sm", {
              'border-red-500 focus-visible:ring-red-500': !!error,
            })}
            disabled={isProcessing}
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          {isProcessing ? (
            <Badge variant="info" dot>Processing...</Badge>
          ) : isValid ? (
            <Badge variant="success" dot>
              <Check className="h-3 w-3 mr-1" /> Valid JSON
            </Badge>
          ) : (
            <Badge variant="error" dot>
              <X className="h-3 w-3 mr-1" /> Invalid JSON
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};