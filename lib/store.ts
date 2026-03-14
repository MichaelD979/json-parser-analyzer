import { create } from 'zustand';
import { ParsedJsonData, TreeViewerNode, ConversionTarget } from '@/lib/types';

// Define the state structure for the JSON tool
interface JsonToolState {
  // 1. Paste JSON Input & Upload JSON File
  jsonInput: string; // The raw JSON string entered by the user or uploaded from a file

  // 3. Validate JSON & Highlight Errors with Line/Column Numbers
  parsedData: ParsedJsonData | null; // Stores the result of parsing, including validity and errors
  loading: boolean; // Indicates if a heavy operation (parsing, formatting, conversion) is in progress
  jsonErrorLine: number | null; // Specific line number of a JSON syntax error
  jsonErrorColumn: number | null; // Specific column number of a JSON syntax error

  // UI state for active panel
  activeTab: 'editor' | 'tree' | 'csv' | 'output'; // To manage which main panel is currently displayed

  // 4. Pretty Format JSON
  formatSpacing: number; // Number of spaces for pretty printing (e.g., 2, 4)

  // 5. Minify JSON - No specific state beyond `parsedData.minifiedJson` which is set by actions

  // 6. Inspect Tree Structure
  treeData: TreeViewerNode[] | null; // The root nodes for the interactive tree view
  expandedNodePaths: Set<string>; // Stores unique paths of currently expanded nodes in the tree viewer

  // 7. Search Keys & Values
  searchTerm: string; // The current search query for keys and values
  searchResultsPaths: Set<string>; // Paths of nodes that match the search term, for highlighting

  // 8. Convert JSON to CSV
  conversionTarget: ConversionTarget | null; // The desired format for conversion (e.g., 'csv')
  convertedOutput: string; // The result of the JSON conversion
  isConverting: boolean; // Indicates if a conversion process is active
}

// Define the actions available for the JSON tool
interface JsonToolActions {
  // Actions for Input & Core Data
  setJsonInput: (input: string) => void;
  setParsedData: (data: ParsedJsonData | null) => void;
  setLoading: (isLoading: boolean) => void;
  setActiveTab: (tab: JsonToolState['activeTab']) => void;

  // Actions for Formatting
  setFormatSpacing: (spacing: number) => void;
  // Actions to trigger actual formatting/minifying would typically be handled by components
  // that then call `setParsedData` with the updated `formattedJson` or `minifiedJson` fields.

  // Actions for Tree View
  setTreeData: (nodes: TreeViewerNode[] | null) => void;
  toggleNodeExpansion: (path: string) => void; // Toggles the expansion state of a specific node
  setExpandedNodePaths: (paths: Set<string>) => void; // Replaces the entire set of expanded paths

  // Actions for Search
  setSearchTerm: (term: string) => void;
  setSearchResultsPaths: (paths: Set<string>) => void;

  // Actions for Conversion
  setConversionTarget: (target: ConversionTarget | null) => void;
  setConvertedOutput: (output: string) => void;
  setIsConverting: (isConverting: boolean) => void;

  // Actions for Error Highlighting
  setJsonErrorLocation: (line: number | null, column: number | null) => void;

  // Utility action to reset the store to its initial state
  resetStore: () => void;
}

// Combine the state and actions into a single store type
type JsonToolStore = JsonToolState & JsonToolActions;

// Initial state for the Zustand store
const initialState: JsonToolState = {
  jsonInput: '',
  parsedData: null,
  loading: false,
  activeTab: 'editor',

  formatSpacing: 2, // Default to 2 spaces for pretty printing

  treeData: null,
  expandedNodePaths: new Set(),

  searchTerm: '',
  searchResultsPaths: new Set(),

  conversionTarget: null,
  convertedOutput: '',
  isConverting: false,

  jsonErrorLine: null,
  jsonErrorColumn: null,
};

// Create the Zustand store
export const useJsonToolStore = create<JsonToolStore>((set) => ({
  ...initialState, // Spread initial state

  // Implement actions
  setJsonInput: (input) => set({ jsonInput: input }),
  setParsedData: (data) => set({ parsedData: data }),
  setLoading: (isLoading) => set({ loading: isLoading }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  setFormatSpacing: (spacing) => set({ formatSpacing: spacing }),

  setTreeData: (nodes) => set({ treeData: nodes }),
  toggleNodeExpansion: (path) =>
    set((state) => {
      const newExpandedPaths = new Set(state.expandedNodePaths);
      if (newExpandedPaths.has(path)) {
        newExpandedPaths.delete(path);
      } else {
        newExpandedPaths.add(path);
      }
      return { expandedNodePaths: newExpandedPaths };
    }),
  setExpandedNodePaths: (paths) => set({ expandedNodePaths: paths }),

  setSearchTerm: (term) => set({ searchTerm: term }),
  setSearchResultsPaths: (paths) => set({ searchResultsPaths: paths }),

  setConversionTarget: (target) => set({ conversionTarget: target }),
  setConvertedOutput: (output) => set({ convertedOutput: output }),
  setIsConverting: (isConverting) => set({ isConverting: isConverting }),

  setJsonErrorLocation: (line, column) =>
    set({
      jsonErrorLine: line,
      jsonErrorColumn: column,
    }),

  resetStore: () => set(initialState),
}));