'use client';

import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Wand } from 'lucide-react';
import { useJsonToolStore } from '@/lib/store'; // Assuming 'useJsonToolStore' is defined in lib/store.ts
import { ParsedJsonData } from '@/lib/types';

export const PrettyFormatJson = () => {
  const {
    jsonInput,
    parsedData,
    formatSpacing,
    loading,
    setFormatSpacing,
    setParsedData,
    setLoading,
  } = useJsonToolStore();

  const handleFormat = useCallback(() => {
    setLoading(true);
    let newParsedData: ParsedJsonData;
    let currentParsedObject: any | null = null;
    let formattedJsonString: string | undefined = undefined;
    let jsonParseError: string | null = null;
    let parseTimeMs: number | null = null;

    try {
      const startTime = performance.now();
      // Always attempt to parse the current jsonInput to ensure we're working with the latest valid object.
      // This also handles cases where the input might have changed since the last auto-parse or validation.
      currentParsedObject = JSON.parse(jsonInput);
      parseTimeMs = performance.now() - startTime;
      formattedJsonString = JSON.stringify(currentParsedObject, null, formatSpacing);

      // Construct the new ParsedJsonData object
      newParsedData = {
        originalInput: jsonInput,
        parsedObject: currentParsedObject,
        isValid: true,
        error: null,
        sizeBytes: new TextEncoder().encode(jsonInput).length, // Size of the original input string
        parseTimeMs: parseTimeMs,
        formattedJson: formattedJsonString,
        // Preserve minifiedJson if it already exists from a previous valid parse,
        // as this component's primary role is formatting, not minifying.
        minifiedJson: parsedData?.minifiedJson,
      };

    } catch (error: any) {
      jsonParseError = error.message;

      // If parsing fails, the data is invalid, and we cannot format it.
      newParsedData = {
        originalInput: jsonInput,
        parsedObject: null,
        isValid: false,
        error: jsonParseError,
        sizeBytes: new TextEncoder().encode(jsonInput).length,
        parseTimeMs: parseTimeMs || 0, // Set to 0 if parsing failed immediately
        formattedJson: undefined,
        // Preserve minifiedJson even on error if it was previously set and relevant.
        // Or, reset it if the input is now fundamentally broken.
        // For this component's scope, we'll keep it as it's not its responsibility to change it.
        minifiedJson: parsedData?.minifiedJson,
      };
    } finally {
      setParsedData(newParsedData);
      setLoading(false);
    }
  }, [jsonInput, formatSpacing, parsedData?.minifiedJson, setParsedData, setLoading]);

  // Disable the format button if loading or if the input is empty/whitespace only
  const isFormatDisabled = loading || jsonInput.trim() === '';

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-2">
        <Label htmlFor="format-spacing" className="text-sm text-muted-foreground whitespace-nowrap">
          Spacing:
        </Label>
        <Select
          value={String(formatSpacing)}
          onValueChange={(value) => setFormatSpacing(Number(value))}
          disabled={loading}
        >
          <SelectTrigger className="w-[80px]">
            <SelectValue placeholder="Spaces" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 Spaces</SelectItem>
            <SelectItem value="4">4 Spaces</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleFormat}
              disabled={isFormatDisabled}
              variant="outline"
              size="sm"
              loading={loading}
            >
              <Wand className="mr-2 h-4 w-4" />
              Format
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Pretty format JSON input with selected spacing.</p>
            {jsonInput.trim() === '' && <p className="text-sm text-muted-foreground mt-1">Input is empty.</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};