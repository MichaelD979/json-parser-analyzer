'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

// Feature components (located in the parent directory relative to app/page.tsx)
import { PasteJson } from '../components/PasteJson';
import { UploadJsonFile } from '../components/UploadJsonFile';
import { ValidateJson } from '../components/ValidateJson';
import { useJsonToolStore } from '@/lib/store';

/**
 * Renders the main landing page for the JSON Toolkit application.
 * This page orchestrates the primary features: JSON input (paste/upload)
 * and JSON processing (validation, formatting).
 */
export default function Page() {
  const { jsonInput, parsedData, loading } = useJsonToolStore();

  // Determine the validity status and corresponding badge variant
  const isJsonValid: boolean = parsedData?.isValid ?? false;
  const hasInput: boolean = jsonInput.trim().length > 0;

  let validationBadgeVariant: 'default' | 'success' | 'error' | 'info' = 'default';
  let validationBadgeText: string = 'Awaiting JSON input';

  if (loading) {
    validationBadgeVariant = 'info';
    validationBadgeText = 'Processing...';
  } else if (!hasInput) {
    validationBadgeVariant = 'default';
    validationBadgeText = 'Awaiting JSON input';
  } else if (isJsonValid) {
    validationBadgeVariant = 'success';
    validationBadgeText = 'Valid JSON';
  } else if (parsedData && parsedData.error) {
    validationBadgeVariant = 'error';
    validationBadgeText = 'Invalid JSON';
  }

  return (
    <main className="container mx-auto py-8 px-4 max-w-7xl">
      <Card className="shadow-lg border-2 border-gray-100 dark:border-gray-800">
        <CardHeader className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0 pb-4">
          <CardTitle className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
            JSON Toolkit
          </CardTitle>
          <div className="flex items-center space-x-3 mt-2 md:mt-0">
            <Badge variant={validationBadgeVariant} dot className="px-3 py-1 text-sm font-medium">
              {validationBadgeText}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="input" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 h-12 text-base">
              <TabsTrigger value="input" className="text-lg font-semibold">Input</TabsTrigger>
              <TabsTrigger value="validation" className="text-lg font-semibold">Validation & Formatting</TabsTrigger>
            </TabsList>

            {/* Input Tab Content */}
            <TabsContent value="input" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Paste JSON</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PasteJson />
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Upload JSON File</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <UploadJsonFile />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Validation & Formatting Tab Content */}
            <TabsContent value="validation" className="space-y-4">
              <ValidateJson />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}