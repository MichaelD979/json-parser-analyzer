'use client';

import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { Editor, useMonaco } from '@monaco-editor/react';
import { ClipboardCopy, Upload, XCircle, Indent, Braces, Files, Eraser, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useJsonParserStore } from '@/lib/store';
import { IndentStyle } from '@/lib/types';

// Define an interface for the Monaco Editor instance
interface MonacoEditorInstance {
  setValue: (value: string) => void;
  getValue: () => string;
  focus: () => void;
  // Add other methods if needed
}

export const PrettyFormat = () => {
  const monaco = useMonaco();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Access relevant state and actions from the Zustand store
  const {
    json,
    formatting,
    setJsonInput,
    setJsonOutput,
    setJsonIsValid,
    setJsonError,
    setJsonParsed,
    setIsProcessing,
    clearAll,
    setIndentStyle,
    setSortKeys,
  } = useJsonParserStore((state) => ({
    json: state.json,
    formatting: state.formatting,
    setJsonInput: state.setJsonInput,
    setJsonOutput: state.setJsonOutput,
    setJsonIsValid: state.setJsonIsValid,
    setJsonError: state.setJsonError,
    setJsonParsed: state.setJsonParsed,
    setIsProcessing: state.setIsProcessing,
    clearAll: state.clearAll,
    setIndentStyle: state.setIndentStyle,
    setSortKeys: state.setSortKeys,
  }));

  const inputEditorRef = useRef<MonacoEditorInstance | null>(null);
  const outputEditorRef = useRef<MonacoEditorInstance | null>(null);

  // Helper function to recursively sort object keys
  const sortObjectKeys = useCallback((obj: unknown): unknown => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(sortObjectKeys);
    }
    const sortedKeys = Object.keys(obj).sort();
    const newObj: { [key: string]: unknown } = {};
    for (const key of sortedKeys) {
      newObj[key] = sortObjectKeys((obj as { [key: string]: unknown })[key]);
    }
    return newObj;
  }, []);

  const handlePrettyFormat = useCallback(() => {
    setIsProcessing(true);
    setJsonError(null);
    setJsonIsValid(false);
    setJsonOutput('');

    const rawInput = json.input;

    if (!rawInput.trim()) {
      setJsonError('Input is empty.');
      setIsProcessing(false);
      return;
    }

    try {
      let parsedJson: unknown = JSON.parse(rawInput);

      if (formatting.sortKeys) {
        parsedJson = sortObjectKeys(parsedJson);
      }

      let space: string | number;
      switch (formatting.indentStyle) {
        case '2Spaces':
          space = 2;
          break;
        case '4Spaces':
          space = 4;
          break;
        case 'Tabs':
          space = '\t';
          break;
        default:
          space = 2; // Default to 2 spaces if somehow unset
      }

      const formattedJson = JSON.stringify(parsedJson, null, space);
      setJsonOutput(formattedJson);
      setJsonParsed(parsedJson);
      setJsonIsValid(true);
      setJsonError(null);
    } catch (e: any) {
      setJsonError(`Invalid JSON: ${e.message}`);
      setJsonOutput('');
      setJsonParsed(null);
      setJsonIsValid(false);
    } finally {
      setIsProcessing(false);
    }
  }, [json.input, formatting.indentStyle, formatting.sortKeys, setIsProcessing, setJsonOutput, setJsonParsed, setJsonIsValid, setJsonError, sortObjectKeys]);

  // Effect to automatically run pretty format when input or options change
  useEffect(() => {
    // Debounce formatting to prevent excessive calls while typing
    const timer = setTimeout(() => {
      if (json.input.trim()) {
        handlePrettyFormat();
      } else {
        // Clear output and errors if input becomes empty
        setJsonOutput('');
        setJsonError(null);
        setJsonIsValid(false);
        setJsonParsed(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [json.input, formatting.indentStyle, formatting.sortKeys, handlePrettyFormat, setJsonOutput, setJsonError, setJsonIsValid, setJsonParsed]);


  const handleEditorDidMount = useCallback((editor: any, monacoInstance: any, isInputEditor: boolean) => {
    if (isInputEditor) {
      inputEditorRef.current = editor;
      // Initialize with store's input, but only if the editor is newly mounted and empty
      if (editor.getValue() !== json.input) {
         editor.setValue(json.input);
      }
    } else {
      outputEditorRef.current = editor;
      // Initialize with store's output, but only if the editor is newly mounted and empty
      if (editor.getValue() !== json.output) {
        editor.setValue(json.output);
      }
    }
  }, [json.input, json.output]);

  const handleInputChange = useCallback((value: string | undefined) => {
    setJsonInput(value || ''); // Update store's input
  }, [setJsonInput]);

  const handleClearAll = useCallback(() => {
    clearAll();
    inputEditorRef.current?.setValue('');
    outputEditorRef.current?.setValue('');
  }, [clearAll]);

  const handleCopyOutput = useCallback(() => {
    if (outputEditorRef.current?.getValue()) {
      navigator.clipboard.writeText(outputEditorRef.current.getValue());
      // A toast notification could be added here for user feedback
    }
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setJsonInput(content);
        if (inputEditorRef.current) {
          inputEditorRef.current.setValue(content);
        }
      };
      reader.readAsText(file);
    }
    // Reset file input value to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [setJsonInput]);

  // Keep output editor in sync with store's output
  useEffect(() => {
    if (outputEditorRef.current && outputEditorRef.current.getValue() !== json.output) {
      outputEditorRef.current.setValue(json.output);
    }
  }, [json.output]);

  // Keep input editor in sync with store's input if it changes externally
  useEffect(() => {
    if (inputEditorRef.current && inputEditorRef.current.getValue() !== json.input) {
      inputEditorRef.current.setValue(json.input);
    }
  }, [json.input]);

  const indentOptions: { value: IndentStyle; label: string }[] = useMemo(() => [
    { value: '2Spaces', label: '2 Spaces' },
    { value: '4Spaces', label: '4 Spaces' },
    { value: 'Tabs', label: 'Tabs' },
  ], []);

  // Monaco editor options
  const editorOptions = useMemo(() => ({
    minimap: { enabled: false },
    wordWrap: 'on' as 'on' | 'off' | 'wordWrapColumn' | 'bounded',
    showUnused: false,
    folding: true,
    lineNumbersMinChars: 3,
    scrollBeyondLastLine: false,
    fontSize: 14,
    automaticLayout: true, // Crucial for responsive resizing within flex containers
  }), []);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full space-y-4 p-4">
        {/* Top Controls */}
        <Card className="flex-shrink-0">
          <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => inputEditorRef.current?.focus()}
                variant="outline"
                size="sm"
                className="gap-1"
              >
                <Braces className="h-4 w-4" />
                Paste JSON
              </Button>

              <Input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
                id="upload-json-file"
              />
              <Label htmlFor="upload-json-file" className="cursor-pointer">
                <Button asChild variant="outline" size="sm" className="gap-1">
                  <div>
                    <FileJson className="h-4 w-4" />
                    Upload File
                  </div>
                </Button>
              </Label>

              <Separator orientation="vertical" className="h-8" />

              <Button
                onClick={handleClearAll}
                variant="outline"
                size="sm"
                className="gap-1 text-red-600 dark:text-red-400"
              >
                <Eraser className="h-4 w-4" />
                Clear All
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="indent-style-select" className="text-xs text-muted-foreground">Indent:</Label>
                <Select
                  value={formatting.indentStyle}
                  onValueChange={(value: IndentStyle) => setIndentStyle(value)}
                >
                  <SelectTrigger id="indent-style-select" className="w-[120px] h-9">
                    <SelectValue placeholder="Indent Style" />
                  </SelectTrigger>
                  <SelectContent>
                    {indentOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Label htmlFor="sort-keys-switch" className="text-xs text-muted-foreground cursor-pointer">
                      Sort Keys
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    Alphabetically sort object keys
                  </TooltipContent>
                </Tooltip>
                <Switch
                  id="sort-keys-switch"
                  checked={formatting.sortKeys}
                  onCheckedChange={setSortKeys}
                />
              </div>

              <Separator orientation="vertical" className="h-8" />

              <Button
                onClick={handlePrettyFormat}
                disabled={!json.input.trim() || json.isProcessing}
                className="gap-1"
                isLoading={json.isProcessing}
              >
                <Indent className="h-4 w-4" />
                Pretty Format
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Editor Area */}
        <div className="flex flex-col lg:flex-row flex-grow gap-4">
          {/* Input Editor */}
          <Card className="flex-1 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Files className="h-5 w-5 text-gray-500" />
                JSON Input
              </CardTitle>
              <Badge variant={json.isValid ? 'success' : 'error'} dot={true}>
                {json.isValid ? 'Valid JSON' : (json.error ? 'Invalid JSON' : 'No Input')}
              </Badge>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col">
              <div className="relative flex-1">
                <Editor
                  height="100%"
                  language="json"
                  value={json.input} // Controlled by store
                  options={editorOptions}
                  onMount={(editor, monaco) => handleEditorDidMount(editor, monaco, true)}
                  onChange={handleInputChange}
                  theme="vs-dark" // Consider dynamic theme based on app's theme
                />
              </div>
              {json.error && (
                <div className="bg-red-500/10 text-red-400 p-2 text-sm border-t border-red-500 rounded-b-lg">
                  <span className="font-semibold">Error:</span> {json.error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Output Editor */}
          <Card className="flex-1 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Braces className="h-5 w-5 text-gray-500" />
                Formatted Output
              </CardTitle>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyOutput}
                    disabled={!json.output.trim()}
                  >
                    <ClipboardCopy className="h-4 w-4" />
                    <span className="sr-only">Copy formatted JSON</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Copy to clipboard
                </TooltipContent>
              </Tooltip>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <Editor
                height="100%"
                language="json"
                value={json.output} // Controlled by store
                options={{ ...editorOptions, readOnly: true }}
                onMount={(editor, monaco) => handleEditorDidMount(editor, monaco, false)}
                theme="vs-dark"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};