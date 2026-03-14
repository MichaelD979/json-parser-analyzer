'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Loader2, Compress, Copy, Check } from 'lucide-react';
import { cn, formatBytes } from '@/lib/utils';
import { useJsonToolStore } from '@/lib/store';
import { ParsedJsonData } from '@/lib/types';

/**
 * MinifyJson component
 * Allows users to minify JSON data, removing unnecessary whitespace to reduce size.
 * Displays the minified output and provides copy-to-clipboard functionality.
 */
export const MinifyJson = () => {
  const { parsedData, setParsedData, setLoading, jsonInput } = useJsonToolStore();
  const [minifiedOutput, setMinifiedOutput] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isMinifying, setIsMinifying] = useState<boolean>(false);

  // Effect to update local minifiedOutput state when the store's parsedData.minifiedJson changes.
  useEffect(() => {
    if (parsedData?.minifiedJson !== undefined) {
      setMinifiedOutput(parsedData.minifiedJson);
    } else {
      setMinifiedOutput('');
    }
  }, [parsedData?.minifiedJson]);

  // Effect to automatically clear minified output if the input JSON becomes invalid or empty.
  useEffect(() => {
    if (!jsonInput || !parsedData?.isValid) {
      setMinifiedOutput('');
      if (parsedData?.minifiedJson !== undefined) {
        // Clear minifiedJson from store if input is invalid/empty
        setParsedData({ ...parsedData, minifiedJson: undefined });
      }
    }
  }, [jsonInput, parsedData?.isValid, parsedData?.minifiedJson, setParsedData]);


  /**
   * Handles the JSON minification process.
   * - Takes the `parsedObject` from the store (if valid).
   * - Uses `JSON.stringify` without indentation to minify.
   * - Updates the `parsedData.minifiedJson` field in the store.
   */
  const handleMinify = async () => {
    if (!parsedData?.parsedObject || !parsedData.isValid) {
      // If JSON is not valid or no parsed object, clear minified output and return.
      setMinifiedOutput('');
      if (parsedData) {
        setParsedData({ ...parsedData, minifiedJson: undefined });
      }
      return;
    }

    setIsMinifying(true);
    setLoading(true); // Activate global loading state for the tool

    try {
      // Perform minification using JSON.stringify with no spaces
      const minifiedString: string = JSON.stringify(parsedData.parsedObject);

      // Update the store with the new minified JSON
      const updatedParsedData: ParsedJsonData = {
        ...parsedData,
        minifiedJson: minifiedString,
      };
      setParsedData(updatedParsedData);
      // Local state is updated by the useEffect above reacting to store change
    } catch (error: any) {
      console.error('Error during JSON minification:', error);
      // In theory, if `parsedData.isValid` is true, `JSON.stringify` should not throw.
      // This catch is mostly for unexpected edge cases.
    } finally {
      setIsMinifying(false);
      setLoading(false); // Deactivate global loading state
    }
  };

  /**
   * Copies the minified JSON output to the clipboard.
   * Provides visual feedback to the user.
   */
  const handleCopy = async () => {
    if (minifiedOutput) {
      try {
        await navigator.clipboard.writeText(minifiedOutput);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset copy status after 2 seconds
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  // Calculate size metrics for display
  const currentJsonInputSize: number = jsonInput ? new TextEncoder().encode(jsonInput).length : 0;
  const minifiedOutputSize: number = minifiedOutput ? new TextEncoder().encode(minifiedOutput).length : 0;
  const sizeReduction: number = currentJsonInputSize > 0 ? (currentJsonInputSize - minifiedOutputSize) : 0;
  const reductionPercentage: number = currentJsonInputSize > 0 ? (sizeReduction / currentJsonInputSize) * 100 : 0;

  const inputSizeText: string = currentJsonInputSize > 0 ? `Original: ${formatBytes(currentJsonInputSize)}` : '';
  const outputSizeText: string = minifiedOutputSize > 0 ? `Minified: ${formatBytes(minifiedOutputSize)}` : '';
  const reductionText: string = reductionPercentage > 0 ? `Reduction: ${formatBytes(sizeReduction)} (${reductionPercentage.toFixed(2)}%)` : '';

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Compress className="h-5 w-5 text-brand" />
          Minify JSON
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow p-4 pt-0 space-y-4 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <Button
            onClick={handleMinify}
            disabled={!parsedData?.isValid || isMinifying}
            className="flex items-center gap-2"
          >
            {isMinifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Minify JSON
          </Button>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {inputSizeText && (
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">{inputSizeText}</span>
                  </TooltipTrigger>
                  <TooltipContent>Size of the original input JSON.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {outputSizeText && (
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">{outputSizeText}</span>
                  </TooltipTrigger>
                  <TooltipContent>Size of the minified JSON output.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {reductionText && (
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <span className="cursor-help text-green-600 dark:text-green-400">{reductionText}</span>
                  </TooltipTrigger>
                  <TooltipContent>The reduction in size after minification.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        <div className="relative flex-grow min-h-[100px]">
          <Label htmlFor="minified-json-output" className="sr-only">Minified JSON Output</Label>
          <Textarea
            id="minified-json-output"
            value={minifiedOutput}
            readOnly
            placeholder={
              !jsonInput
                ? "Paste or upload JSON to enable minification."
                : !parsedData?.isValid
                  ? "Invalid JSON, cannot minify."
                  : "Click 'Minify JSON' to see the minified output."
            }
            className="font-mono text-xs w-full h-full resize-none p-3 pr-10" // Added pr-10 for copy button
          />
          {minifiedOutput && (
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:bg-transparent"
                    aria-label="Copy minified JSON to clipboard"
                  >
                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isCopied ? 'Copied!' : 'Copy to clipboard'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardContent>
    </Card>
  );
};