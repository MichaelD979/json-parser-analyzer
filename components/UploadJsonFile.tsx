'use client';

import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useJsonToolStore } from '@/lib/store';

/**
 * Renders a component for uploading JSON files.
 * Uses FileReader API to read file content and updates the global store.
 */
export const UploadJsonFile: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const setJsonInput = useJsonToolStore((state) => state.setJsonInput);
  const setLoading = useJsonToolStore((state) => state.setLoading);
  const loading = useJsonToolStore((state) => state.loading);

  /**
   * Handles the change event when a file is selected via the input.
   * Reads the file content using FileReader and updates the store.
   * @param event The change event from the file input.
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    setLocalError(null); // Clear previous errors

    if (files && files.length > 0) {
      const file = files[0];

      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        setLocalError('Please upload a valid JSON file.');
        // Optionally clear the input so the same invalid file can be selected again
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      setLoading(true);
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const fileContent = e.target?.result as string;
          // Attempt a quick parse to ensure it's somewhat valid before setting to store
          // This prevents large invalid JSON from blocking the UI for too long,
          // though full validation will happen in the editor.
          JSON.parse(fileContent);
          setJsonInput(fileContent);
          setLocalError(null);
        } catch (parseError) {
          setLocalError('Invalid JSON content detected in file.');
          setJsonInput(''); // Clear input if file content is not valid JSON
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = () => {
        setLocalError('Failed to read file.');
        setLoading(false);
        setJsonInput('');
      };

      reader.readAsText(file);
    } else {
      setJsonInput(''); // Clear input if no file is selected (e.g., user cancels)
    }

    // Reset the input value to allow selecting the same file again after an error or successful upload
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Triggers the hidden file input when the button is clicked.
   */
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center space-x-2">
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUploadClick}
              disabled={loading}
              loading={loading}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload JSON
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Upload a JSON file from your computer.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {localError && (
        <Badge variant="error" className="py-1 px-2">
          {localError}
        </Badge>
      )}
    </div>
  );
};