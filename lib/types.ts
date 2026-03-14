export interface ParsedJsonData {
  originalInput: string;
  parsedObject: any | null; // The actual JavaScript object/array/primitive after parsing
  isValid: boolean;
  error: string | null; // Error message if parsing failed
  sizeBytes: number | null; // Size of the original input string in bytes
  parseTimeMs: number | null; // Time taken to parse the JSON
  formattedJson?: string; // Optional: A formatted version of the JSON string
  minifiedJson?: string; // Optional: A minified version of the JSON string
}

export interface TreeViewerNode {
  key: string | number | null; // The key for an object property, index for an array item, or null for the root
  value: any; // The actual value of the node
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'; // The JSON type of the value
  path: string; // Full JSON path to this node (e.g., 'data[0].name')
  isExpanded: boolean; // UI state: whether this node is currently expanded in the tree viewer
  children: TreeViewerNode[] | null; // Child nodes if the value is an object or an array
  valuePreview: string; // A concise string representation of the value for display (e.g., "{...}", "[...]", "hello world")
  length?: number; // Number of items for arrays/objects, or string length for strings
  isRoot?: boolean; // True if this is the very top-level node
}

export interface ValidationResult {
  isValid: boolean;
  message: string; // A general message indicating success or the primary error
  errorDetails?: string; // More specific error details, like a stack trace or detailed parsing error
}

export type ConversionTarget = 'xml' | 'csv' | 'yaml' | 'json'; // Potential targets for JSON conversion