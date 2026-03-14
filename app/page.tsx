// app/page.tsx
// This page is a Server Component, as it only renders other components and does not use client-side hooks or browser APIs itself.

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PasteJson } from '@/components/Paste-json';
import { ValidateJson } from '@/components/Validate-json';

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <Card className="shadow-lg border border-gray-200 bg-white">
        <CardHeader className="border-b border-gray-200 pb-4">
          <CardTitle className="text-3xl font-bold text-center text-gray-800">JSON DevTool</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8 p-6">
          {/* Left Column: JSON Input and Actions */}
          <section className="flex flex-col gap-6 md:border-r md:border-gray-200 md:pr-6">
            <h2 className="text-2xl font-semibold text-gray-700">Input JSON</h2>
            <PasteJson />
          </section>

          {/* Right Column: JSON Output & Validation */}
          <section className="flex flex-col gap-6 md:pl-6">
            <h2 className="text-2xl font-semibold text-gray-700">Output & Validation</h2>
            <ValidateJson />
          </section>
        </CardContent>
      </Card>
    </main>
  );
}