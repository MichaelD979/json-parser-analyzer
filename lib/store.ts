import { create } from 'zustand';
import {
  JsonProcessState,
  FormattingOptions,
  MinificationOptions,
  ConversionOptions,
  ActiveViewTab,
  EditorSettings,
  IndentStyle,
  ConversionTarget,
} from '@/lib/types';

// --- Store Interface ---

export interface JsonParserStore {
  // --- Core JSON Data State ---
  json: JsonProcessState;
  /** Sets the raw JSON input string and marks processing as active. */
  setJsonInput: (input: string) => void;
  /** Sets the processed JSON output string. */
    setJsonOutput: (output: string) => void;
  /** Sets the validation status of the JSON input. */
  setJsonIsValid: (isValid: boolean) => void;
  /** Sets the error message if JSON is invalid, otherwise null. */
  setJsonError: (error: string | null) => void;
  /** Sets the parsed JavaScript object/array if input is valid. */
  setJsonParsed: (parsed: unknown | null) => void;
  /** Sets the processing state (true when an operation is active). */
  setIsProcessing: (isProcessing: boolean) => void;
  /** Clears all input, output, errors, and resets relevant UI states. */
  clearAll: () => void;

  // --- Formatting Options ---
  formatting: FormattingOptions;
  /** Sets the indentation style for JSON formatting. */
  setIndentStyle: (style: IndentStyle) => void;
  /** Sets whether to sort object keys alphabetically during formatting. */
  setSortKeys: (sort: boolean) => void;

  // --- Minification Options ---
  minification: MinificationOptions;
  /** Sets whether to remove all unnecessary whitespace during minification. */
  setRemoveWhitespace: (remove: boolean) => void;

  // --- Conversion Options ---
  conversion: ConversionOptions;
  /** Sets the target format for JSON conversion (e.g., 'csv'). */
  setConversionTarget: (target: ConversionTarget | null) => void;

  // --- UI State ---
  ui: {
    /** The currently active tab in the main interface ('editor', 'tree', 'table', 'settings'). */
    activeTab: ActiveViewTab;
    /** The search term for filtering/highlighting in the JSON tree viewer. */
    treeSearchTerm: string;
    /** A Set of paths to currently expanded nodes in the JSON tree viewer. */
    expandedTreeKeys: Set<string>;
    /** The path of the currently highlighted node in the JSON tree viewer (e.g., from search). */
    highlightedTreePath: string | null;
    /** The current cursor position in the input editor, used for error highlighting. */
    inputEditorCursorPosition: { lineNumber: number; column: number } | null;
  };
  /** Sets the currently active UI tab. */
  setActiveTab: (tab: ActiveViewTab) => void;
  /** Sets the search term for the JSON tree viewer. */
  setTreeSearchTerm: (term: string) => void;
  /** Toggles the expansion state of a node in the JSON tree viewer by its path. */
  toggleExpandedTreeKey: (path: string) => void;
  /** Sets the path of the highlighted node in the JSON tree viewer. */
  setHighlightedTreePath: (path: string | null) => void;
  /** Sets the cursor position in the input Monaco editor. */
  setInputEditorCursorPosition: (position: { lineNumber: number; column: number } | null) => void;

  // --- Editor Settings (Monaco Editor Integration) ---
  inputEditorSettings: EditorSettings;
  outputEditorSettings: EditorSettings;
  /** Sets a specific setting for the input Monaco editor. */
  setInputEditorSetting: <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => void;
  /** Sets a specific setting for the output Monaco editor. */
  setOutputEditorSetting: <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => void;

  // --- Composite Actions ---
  /** Initiates the full JSON processing pipeline (validation, formatting, minification, conversion)
   * based on the provided raw input and current store settings. */
  processInput: (rawInput: string) => void;
  /** Re-applies formatting, minification, and conversion to the current JSON input
   * based on updated formatting/conversion settings. */
  reprocessOutput: () => void;
}

// --- Initial State ---

const initialJsonProcessState: JsonProcessState = {
  input: '',
  output: '',
  isValid: false,
  error: null,
  parsed: null,
  isProcessing: false,
};

const initialFormattingOptions: FormattingOptions = {
  indentStyle: '2Spaces',
  sortKeys: false,
};

const initialMinificationOptions: MinificationOptions = {
  removeWhitespace: true,
};

const initialConversionOptions: ConversionOptions = {
  target: null,
};

const initialUiState = {
  activeTab: 'editor' as ActiveViewTab,
  treeSearchTerm: '',
  expandedTreeKeys: new Set<string>(),
  highlightedTreePath: null,
  inputEditorCursorPosition: null,
};

const initialInputEditorSettings: EditorSettings = {
  showLineNumbers: true,
  wordWrap: 'on',
  minimapEnabled: false,
  readOnly: false,
};

const initialOutputEditorSettings: EditorSettings = {
  showLineNumbers: true,
  wordWrap: 'on',
  minimapEnabled: false,
  readOnly: true,
};

// --- Zustand Store Creation ---

export const useJsonParserStore = create<JsonParserStore>((set, get) => ({
  // Core JSON Data
  json: initialJsonProcessState,
  setJsonInput: (input) => set((state) => ({ json: { ...state.json, input, isProcessing: true, error: null } })),
  setJsonOutput: (output) => set((state) => ({ json: { ...state.json, output } })),
  setJsonIsValid: (isValid) => set((state) => ({ json: { ...state.json, isValid } })),
  setJsonError: (error) => set((state) => ({ json: { ...state.json, error } })),
  setJsonParsed: (parsed) => set((state) => ({ json: { ...state.json, parsed } })),
  setIsProcessing: (isProcessing) => set((state) => ({ json: { ...state.json, isProcessing } })),
  clearAll: () => set(() => ({
    json: initialJsonProcessState,
    ui: {
      ...initialUiState,
      expandedTreeKeys: new Set<string>(), // Ensure new set on clear
    },
  })),

  // Formatting
  formatting: initialFormattingOptions,
  setIndentStyle: (indentStyle) => set((state) => ({ formatting: { ...state.formatting, indentStyle } })),
  setSortKeys: (sortKeys) => set((state) => ({ formatting: { ...state.formatting, sortKeys } })),

  // Minification
  minification: initialMinificationOptions,
  setRemoveWhitespace: (removeWhitespace) => set((state) => ({ minification: { ...state.minification, removeWhitespace } })),

  // Conversion
  conversion: initialConversionOptions,
  setConversionTarget: (target) => set((state) => ({ conversion: { ...state.conversion, target } })),

  // UI State
  ui: initialUiState,
  setActiveTab: (activeTab) => set((state) => ({ ui: { ...state.ui, activeTab } })),
  setTreeSearchTerm: (treeSearchTerm) => set((state) => ({ ui: { ...state.ui, treeSearchTerm } })),
  toggleExpandedTreeKey: (path) => set((state) => {
    const newExpandedKeys = new Set(state.ui.expandedTreeKeys);
    if (newExpandedKeys.has(path)) {
      newExpandedKeys.delete(path);
    } else {
      newExpandedKeys.add(path);
    }
    return { ui: { ...state.ui, expandedTreeKeys: newExpandedKeys } };
  }),
  setHighlightedTreePath: (highlightedTreePath) => set((state) => ({ ui: { ...state.ui, highlightedTreePath } })),
  setInputEditorCursorPosition: (inputEditorCursorPosition) => set((state) => ({ ui: { ...state.ui, inputEditorCursorPosition } })),

  // Editor Settings
  inputEditorSettings: initialInputEditorSettings,
  outputEditorSettings: initialOutputEditorSettings,
  setInputEditorSetting: (key, value) => set((state) => ({ inputEditorSettings: { ...state.inputEditorSettings, [key]: value } })),
  setOutputEditorSetting: (key, value) => set((state) => ({ outputEditorSettings: { ...state.outputEditorSettings, [key]: value } })),

  // Composite Actions (placeholders; actual processing logic lives in services/workers and dispatches these atomic setters)
  processInput: (rawInput: string) => {
    set((state) => ({
      json: {
        ...state.json,
        input: rawInput,
        isProcessing: true,
        error: null, // Clear previous error on new input
      },
    }));
    // In a real application, this would trigger a web worker or an async service call
    // that then dispatches further actions like setJsonOutput, setJsonIsValid, etc.,
    // after performing validation, formatting, minification, and conversion based on `get()`'s current state.
  },
  reprocessOutput: () => {
    // This action typically signals that the current input should be re-processed
    // using the *current* formatting/minification/conversion settings.
    const currentInput = get().json.input;
    if (currentInput) {
      set((state) => ({ json: { ...state.json, isProcessing: true } }));
      // Similar to processInput, this would trigger an async service/worker
      // to re-process `currentInput` with the latest `formatting`, `minification`, and `conversion` options
      // and then update `json.output`, `json.isValid`, `json.parsed`, `json.error`, `isProcessing`.
    }
  },
}));