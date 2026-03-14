'use client';

import {
  ActiveViewTab,
  ConversionTarget,
  IndentStyle,
  JsonProcessState,
  FormattingOptions,
  MinificationOptions,
  ConversionOptions,
} from '@/lib/types';
import { JsonParserStore, useJsonParserStore } from '@/lib/store';

// Helper function to create typed selectors for the store
const createSelector = <T>(
  selector: (state: JsonParserStore) => T
) => {
  return () => useJsonParserStore(selector);
};

// --- Core JSON Data State Hooks ---
export const useJsonInput = createSelector((state) => state.json.input);
export const useJsonOutput = createSelector((state) => state.json.output);
export const useJsonIsValid = createSelector((state) => state.json.isValid);
export const useJsonError = createSelector((state) => state.json.error);
export const useJsonParsed = createSelector((state) => state.json.parsed);
export const useIsProcessing = createSelector((state) => state.json.isProcessing);
export const useJsonProcessState = createSelector((state) => state.json);

export const useSetJsonInput = createSelector((state) => state.setJsonInput);
export const useSetJsonOutput = createSelector((state) => state.setJsonOutput);
export const useSetJsonIsValid = createSelector((state) => state.setJsonIsValid);
export const useSetJsonError = createSelector((state) => state.setJsonError);
export const useSetJsonParsed = createSelector((state) => state.setJsonParsed);
export const useSetIsProcessing = createSelector((state) => state.setIsProcessing);
export const useClearAll = createSelector((state) => state.clearAll);

// --- Formatting Options Hooks ---
export const useFormattingOptions = createSelector((state) => state.formatting);
export const useIndentStyle = createSelector((state) => state.formatting.indentStyle);
export const useSortKeys = createSelector((state) => state.formatting.sortKeys);

export const useSetIndentStyle = createSelector((state) => state.setIndentStyle);
export const useSetSortKeys = createSelector((state) => state.setSortKeys);

// --- Minification Options Hooks ---
export const useMinificationOptions = createSelector((state) => state.minification);
export const useRemoveWhitespace = createSelector((state) => state.minification.removeWhitespace);

export const useSetRemoveWhitespace = createSelector((state) => state.setRemoveWhitespace);

// --- Conversion Options Hooks ---
export const useConversionOptions = createSelector((state) => state.conversion);
export const useConversionTarget = createSelector((state) => state.conversion.target);

export const useSetConversionTarget = createSelector((state) => state.setConversionTarget);

// --- UI State Hooks ---
export const useActiveTab = createSelector((state) => state.ui.activeTab);
export const useTreeSearchTerm = createSelector((state) => state.ui.treeSearchTerm);
export const useExpandedTreeKeys = createSelector((state) => state.ui.expandedTreeKeys);
export const useHighlightedTreePath = createSelector((state) => state.ui.highlightedTreePath);
export const useInputEditorCursorPosition = createSelector(
  (state) => state.ui.inputEditorCursorPosition
);

// Assuming these setters exist in the JsonParserStore based on the provided types and typical Zustand patterns.
export const useSetActiveTab = createSelector((state) => state.setActiveTab);
export const useSetTreeSearchTerm = createSelector((state) => state.setTreeSearchTerm);
export const useSetExpandedTreeKeys = createSelector((state) => state.setExpandedTreeKeys);
export const useSetHighlightedTreePath = createSelector((state) => state.setHighlightedTreePath);
export const useSetInputEditorCursorPosition = createSelector(
  (state) => state.setInputEditorCursorPosition
);