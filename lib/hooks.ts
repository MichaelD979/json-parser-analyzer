'use client';

import { useJsonToolStore } from '@/lib/store';

// --- State Hooks ---

export const useJsonInput = () => useJsonToolStore((state) => state.jsonInput);
export const useParsedData = () => useJsonToolStore((state) => state.parsedData);
export const useLoading = () => useJsonToolStore((state) => state.loading);
export const useJsonErrorLine = () => useJsonToolStore((state) => state.jsonErrorLine);
export const useJsonErrorColumn = () => useJsonToolStore((state) => state.jsonErrorColumn);
export const useActiveTab = () => useJsonToolStore((state) => state.activeTab);
export const useFormatSpacing = () => useJsonToolStore((state) => state.formatSpacing);
export const useTreeData = () => useJsonToolStore((state) => state.treeData);
export const useExpandedNodePaths = () => useJsonToolStore((state) => state.expandedNodePaths);
export const useSearchTerm = () => useJsonToolStore((state) => state.searchTerm);
export const useSearchResultsPaths = () => useJsonToolStore((state) => state.searchResultsPaths);
export const useConversionTarget = () => useJsonToolStore((state) => state.conversionTarget);
export const useConvertedOutput = () => useJsonToolStore((state) => state.convertedOutput);
export const useIsConverting = () => useJsonToolStore((state) => state.isConverting);

// --- Action Hooks ---

export const useSetJsonInput = () => useJsonToolStore((state) => state.setJsonInput);
export const useSetParsedData = () => useJsonToolStore((state) => state.setParsedData);
export const useSetLoading = () => useJsonToolStore((state) => state.setLoading);
export const useSetJsonErrorLine = () => useJsonToolStore((state) => state.setJsonErrorLine);
export const useSetJsonErrorColumn = () => useJsonToolStore((state) => state.setJsonErrorColumn);
export const useSetActiveTab = () => useJsonToolStore((state) => state.setActiveTab);
export const useSetFormatSpacing = () => useJsonToolStore((state) => state.setFormatSpacing);
export const useSetTreeData = () => useJsonToolStore((state) => state.setTreeData);
export const useToggleNodeExpansion = () => useJsonToolStore((state) => state.toggleNodeExpansion);
export const useSetSearchTerm = () => useJsonToolStore((state) => state.setSearchTerm);
export const useSetSearchResultsPaths = () => useJsonToolStore((state) => state.setSearchResultsPaths);
export const useSetConversionTarget = () => useJsonToolStore((state) => state.setConversionTarget);
export const useSetConvertedOutput = () => useJsonToolStore((state) => state.setConvertedOutput);
export const useSetIsConverting = () => useJsonToolStore((state) => state.setIsConverting);

// --- Combined State & Action Hooks (for convenience, use sparingly to avoid unnecessary re-renders) ---

/**
 * Hook to access both jsonInput state and setJsonInput action.
 * Use with caution as it will trigger re-renders if either changes.
 */
export const useJsonInputAndSetter = () =>
  useJsonToolStore((state) => ({
    jsonInput: state.jsonInput,
    setJsonInput: state.setJsonInput,
  }));

/**
 * Hook to access both loading state and setLoading action.
 */
export const useLoadingAndSetter = () =>
  useJsonToolStore((state) => ({
    loading: state.loading,
    setLoading: state.setLoading,
  }));

/**
 * Hook to access both activeTab state and setActiveTab action.
 */
export const useActiveTabAndSetter = () =>
  useJsonToolStore((state) => ({
    activeTab: state.activeTab,
    setActiveTab: state.setActiveTab,
  }));

/**
 * Hook to access conversionTarget state and setConversionTarget action.
 */
export const useConversionTargetAndSetter = () =>
  useJsonToolStore((state) => ({
    conversionTarget: state.conversionTarget,
    setConversionTarget: state.setConversionTarget,
  }));

/**
 * Hook to access isConverting state and setIsConverting action.
 */
export const useIsConvertingAndSetter = () =>
  useJsonToolStore((state) => ({
    isConverting: state.isConverting,
    setIsConverting: state.setIsConverting,
  }));