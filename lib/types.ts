// lib/types.ts

// --- Core JSON Data State ---

/**
 * Represents the current state of the JSON input and output,
 * including validation results and the parsed object.
 */
export interface JsonProcessState {
  /** The raw JSON string provided by the user. */
  input: string;
  /** The processed JSON string (e.g., formatted, minified, converted). */
  output: string;
  /** True if the input JSON is syntactically valid. */
  isValid: boolean;
  /** Error message if the JSON is invalid, otherwise null. */
  error: string | null;
  /** The parsed JavaScript object/array if input is valid, otherwise null. */
  parsed: unknown | null;
  /** True if a processing operation (parsing, formatting, conversion) is currently active. */
  isProcessing: boolean;
}

// --- Formatting Options ---

export type IndentStyle = '2Spaces' | '4Spaces' | 'Tabs';

/**
 * Options for formatting JSON output.
 */
export interface FormattingOptions {
  /** The style of indentation to use (e.g., 2 spaces, 4 spaces, tabs). */
  indentStyle: IndentStyle;
  /** Whether to sort object keys alphabetically when formatting. */
  sortKeys: boolean;
}

// --- Minification Options ---

/**
 * Options for minifying JSON output.
 */
export interface MinificationOptions {
  /** Whether to remove all unnecessary whitespace, including newlines, from the JSON. */
  removeWhitespace: boolean;
}

// --- Conversion Options ---

/**
 * Supported target formats for JSON conversion.
 */
export type ConversionTarget = 'yaml' | 'csv' | 'typescript'; // Extend as needed

/**
 * Options for converting JSON to other formats.
 */
export interface ConversionOptions {
  /** The desired target format for conversion. Null if no conversion is selected/applied. */
  target: ConversionTarget | null;
}

// --- UI State ---

/**
 * Defines the currently active tab in the main application interface.
 */
export type ActiveViewTab = 'editor' | 'tree' | 'table' | 'settings';

// --- Editor Settings ---

/**
 * Options specifically for the Monaco Editor component instances.
 */
export interface EditorSettings {
  /** Whether to display line numbers in the editor. */
  showLineNumbers: boolean;
  /** Whether text should wrap to the next line if it exceeds the editor width. */
  wordWrap: 'off' | 'on';
  /** Whether the minimap (code overview scrollbar) is enabled. */
  minimapEnabled: boolean;
  /** Whether the editor content is read-only (e.g., for the output editor). */
  readOnly: boolean;
  /** Whether to automatically format JSON content when pasted into the editor. */
  autoFormatOnPaste: boolean;
}

// --- Global Application Settings ---

export type AppTheme = 'light' | 'dark' | 'system';

/**
 * Global application-wide settings that persist across sessions.
 */
export interface GlobalAppSettings {
  /** The current theme of the application (light, dark, or system preference). */
  theme: AppTheme;
  /** Whether to automatically save the user's input JSON to local storage. */
  autoSaveInput: boolean;
  /** Specific settings for the Monaco Editor instances used throughout the app. */
  editor: EditorSettings;
}

// --- Main Application State ---

/**
 * The root interface for the entire application's state,
 * typically used with a state management library like Zustand.
 */
export interface AppState {
  /** Current state of JSON input, output, validation, and parsed data. */
  json: JsonProcessState;
  /** User-defined preferences for how JSON should be formatted. */
  formatting: FormattingOptions;
  /** User-defined preferences for how JSON should be minified. */
  minification: MinificationOptions;
  /** User-defined preferences for converting JSON to other data formats. */
  conversion: ConversionOptions;
  /** UI-specific state, such as the currently active tab. */
  ui: {
    activeTab: ActiveViewTab;
  };
  /** Global application settings that influence behavior and appearance. */
  settings: GlobalAppSettings;
}