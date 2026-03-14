'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Copy, Upload, X, Shrink, Check, Expand } from 'lucide-react';
import { useJsonParserStore } from '@/lib/store';
import { IndentStyle } from '@/lib/types';

/**
 * MinifyJson component for validating, formatting, and minifying JSON data.
 * It provides input/output text areas, file upload, and action buttons.
 */
export const MinifyJson = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  const {
    json,
    minification,
    formatting,
    setJsonInput,
    setJsonOutput,
    setJsonIsValid,
    setJsonError,
    setJsonParsed,
    setIsProcessing,
    setRemoveWhitespace,
    clearAll,
  } = useJsonParserStore((state) => ({
    json: state.json,
    minification: state.minification,
    formatting: state.formatting,
    setJsonInput: state.setJsonInput,
    setJsonOutput: state.setJsonOutput,
    setJsonIsValid: state.setJsonIsValid,
    setJsonError: state.setJsonError,
    setJsonParsed: state.setJsonParsed,
    setIsProcessing: state.setIsProcessing,
    setRemoveWhitespace: state.setRemoveWhitespace,
    clearAll: state.clearAll,
  }));

  /**
   * Handles changes to the JSON input textarea.
   * Updates the global JSON input state, which triggers validation and parsing in the store.
   */
  const handleJsonInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
  }, [setJsonInput]);

  /**
   * Handles uploading a JSON file from the local filesystem.
   * Reads the file content and sets it as the JSON input.
   */
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setJsonInput(content);
        // Clear file input value to allow re-uploading the same file
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      reader.onerror = () => {
        setJsonError("Failed to read file.");
        setJsonOutput("");
        setIsProcessing(false);
      };
      setIsProcessing(true); // Indicate processing while file is read
      setJsonError(null);
      reader.readAsText(file);
    }
  }, [setJsonInput, setJsonError, setJsonOutput, setIsProcessing]);

  /**
   * Clears all input, output, and resets validation/error states.
   */
  const handleClear = useCallback(() => {
    clearAll();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setCopied(false);
  }, [clearAll]);

  /**
   * Copies the current JSON output to the clipboard.
   * Provides temporary visual feedback upon successful copy.
   */
  const handleCopy = useCallback(() => {
    if (json.output) {
      navigator.clipboard.writeText(json.output)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    }
  }, [json.output]);

  /**
   * Toggles the 'Remove all unnecessary whitespace' minification option.
   */
  const handleRemoveWhitespaceChange = useCallback((checked: boolean) => {
    setRemoveWhitespace(checked);
  }, [setRemoveWhitespace]);

  /**
   * Triggers a click on the hidden file input element.
   */
  const triggerFileUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Executes the JSON minification process.
   * Uses the already parsed JSON object from the store.
   */
  const executeMinify = useCallback(() => {
    if (!json.input.trim()) {
      setJsonError("No JSON input provided.");
      setJsonOutput("");
      return;
    }
    if (!json.isValid || !json.parsed) {
      setJsonError("Input is not valid JSON. Please correct errors before minifying.");
      setJsonOutput("");
      return;
    }

    setIsProcessing(true);
    setJsonError(null);

    try {
      // JSON.stringify with no space argument minifies the JSON
      const minifiedOutput = JSON.stringify(json.parsed);
      setJsonOutput(minifiedOutput);
    } catch (e: any) {
      // This catch block is mostly for safeguard, as `json.parsed` implies it was already parsable.
      setJsonError(e.message || "An unexpected error occurred during minification.");
      setJsonOutput("");
    } finally {
      setIsProcessing(false);
    }
  }, [json.input, json.isValid, json.parsed, setIsProcessing, setJsonError, setJsonOutput]);

  /**
   * Executes the JSON pretty formatting process.
   * Uses the already parsed JSON object from the store and formatting options.
   */
  const executePrettyFormat = useCallback(() => {
    if (!json.input.trim()) {
      setJsonError("No JSON input provided.");
      setJsonOutput("");
      return;
    }
    if (!json.isValid || !json.parsed) {
      setJsonError("Input is not valid JSON. Please correct errors before formatting.");
      setJsonOutput("");
      return;
    }

    setIsProcessing(true);
    setJsonError(null);

    try {
      let indent: number | string = 2; // Default indent
      switch (formatting.indentStyle) {
        case '4Spaces':
          indent = 4;
          break;
        case 'Tabs':
          indent = '\t';
          break;
        case '2Spaces':
        default:
          indent = 2;
          break;
      }

      // Note: Sorting keys alphabetically requires a custom replacer function
      // for JSON.stringify, which is not implemented here for simplicity
      // but could be added if `formatting.sortKeys` is true.
      const prettyOutput = JSON.stringify(json.parsed, null, indent);
      setJsonOutput(prettyOutput);
    } catch (e: any) {
      setJsonError(e.message || "An unexpected error occurred during pretty formatting.");
      setJsonOutput("");
    } finally {
      setIsProcessing(false);
    }
  }, [json.input, json.isValid, json.parsed, formatting.indentStyle, setIsProcessing, setJsonError, setJsonOutput]);

  const hasInput = json.input.trim() !== "";
  const isActionDisabled = !json.isValid || !hasInput || json.isProcessing;

  return (
    <TooltipProvider>
      <Card className="flex flex-col h-full overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
          <CardTitle className="text-xl font-semibold">JSON Minifier</CardTitle>
          <div className="flex items-center space-x-2">
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={triggerFileUpload} disabled={json.isProcessing}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload .json
                </Button>
              </TooltipTrigger>
              <TooltipContent>Upload a JSON file from your computer</TooltipContent>
            </Tooltip>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".json"
            />
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleClear} disabled={json.isProcessing}>
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear input and output</TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
          {/* Input Section */}
          <div className="flex flex-col space-y-3">
            <Label htmlFor="json-input" className="text-base flex justify-between items-center">
              Input JSON
              <Badge
                variant={json.isValid ? "success" : hasInput ? "error" : "default"}
                className="ml-2"
                dot
              >
                {json.isValid ? "Valid" : hasInput ? "Invalid" : "Empty"}
              </Badge>
            </Label>
            <Textarea
              id="json-input"
              placeholder="Paste your JSON here..."
              value={json.input}
              onChange={handleJsonInputChange}
              rows={15}
              className="flex-1 font-mono text-sm resize-none"
              error={!json.isValid && hasInput ? json.error || "Invalid JSON" : undefined}
              hint={!json.isValid && hasInput ? json.error || "Invalid JSON" : undefined}
            />
          </div>

          {/* Output Section */}
          <div className="flex flex-col space-y-3">
            <Label htmlFor="json-output" className="text-base flex justify-between items-center">
              Output JSON
              <div className="flex items-center space-x-2">
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopy}
                      disabled={!json.output || copied || json.isProcessing}
                    >
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{copied ? "Copied!" : "Copy to clipboard"}</TooltipContent>
                </Tooltip>
              </div>
            </Label>
            <Textarea
              id="json-output"
              placeholder="Processed JSON will appear here..."
              value={json.output}
              readOnly
              rows={15}
              className="flex-1 font-mono text-sm bg-muted resize-none"
            />
          </div>
        </CardContent>

        <div className="flex flex-col md:flex-row items-center justify-between p-4 border-t gap-4">
          {/* Minification Options */}
          <div className="flex items-center space-x-2">
            <Switch
              id="remove-whitespace"
              checked={minification.removeWhitespace}
              onCheckedChange={handleRemoveWhitespaceChange}
              disabled={json.isProcessing}
            />
            <Label htmlFor="remove-whitespace">Remove all unnecessary whitespace</Label>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <Badge variant="info" className="ml-1 px-2 py-0.5 text-xs rounded-full cursor-help">i</Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-sm">
                When minifying, all unnecessary spaces, newlines, and tabs are removed to create the most compact representation.
                This option reflects the standard behavior of JSON minification.
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              onClick={executeMinify}
              disabled={isActionDisabled}
              className="min-w-[120px]"
            >
              {json.isProcessing ? (
                <span className="loading-spinner h-4 w-4 mr-2" />
              ) : (
                <Shrink className="h-4 w-4 mr-2" />
              )}
              Minify JSON
            </Button>
            <Button
              variant="outline"
              onClick={executePrettyFormat}
              disabled={isActionDisabled}
              className="min-w-[120px]"
            >
              {json.isProcessing ? (
                <span className="loading-spinner h-4 w-4 mr-2" />
              ) : (
                <Expand className="h-4 w-4 mr-2" />
              )}
              Pretty Format
            </Button>
          </div>
        </div>
      </Card>
      {/* Inline loading spinner style */}
      <style jsx>{`
        .loading-spinner {
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: currentColor; /* Use current text color for spinner */
          animation: spin 1s ease-in-out infinite;
          -webkit-animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
          to { -webkit-transform: rotate(360deg); }
        }
        @-webkit-keyframes spin {
          to { -webkit-transform: rotate(360deg); }
        }
      `}</style>
    </TooltipProvider>
  );
};