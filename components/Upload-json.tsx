'use client';

import React, { useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Upload } from 'lucide-react';
import { useJsonParserStore } from '@/lib/store';

/**
 * UploadJson component enables users to upload a JSON file from their local filesystem.
 * It reads the file content using FileReader and updates the global JSON input state.
 */
export const UploadJson = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setJsonInput, setJsonError } = useJsonParserStore();

  /**
   * Handles the change event when a file is selected via the input.
   * Reads the selected JSON file and updates the store.
   * @param event The change event from the file input.
   */
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setJsonError('No file selected.');
      return;
    }

    // Basic client-side check for JSON file type
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setJsonError('Please upload a valid JSON file (.json).');
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear input to allow re-upload of same file
      }
      return;
    }

    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const fileContent = e.target?.result as string;
        setJsonInput(fileContent);
        setJsonError(null); // Clear any previous file-related errors
      } catch (error) {
        setJsonError(`Error reading file content: ${(error as Error).message}`);
      } finally {
        // Clear the file input value to allow the same file to be selected again
        // if user wants to re-process it (e.g., after external edits).
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.onerror = () => {
      setJsonError(`Failed to read file: ${reader.error?.message || 'Unknown error'}`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  /**
   * Triggers the hidden file input element when the upload button is clicked.
   */
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUploadClick}
            aria-label="Upload JSON file"
            className="flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload JSON
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Upload a JSON file from your computer (.json)
        </TooltipContent>
      </Tooltip>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,application/json" // Suggests .json files in the file dialog
        className="hidden" // Hide the actual file input element
      />
    </TooltipProvider>
  );
};