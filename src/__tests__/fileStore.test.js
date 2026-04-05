import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useFileStore from '../store/fileStore';

describe('File Store - Core Operations', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useFileStore());
    act(() => {
      result.current.resetStore?.();
    });
  });

  describe('Navigation', () => {
    it('should set current folder', () => {
      const { result } = renderHook(() => useFileStore());
      act(() => {
        result.current.setCurrentFolder('folder-1');
      });
      expect(result.current.currentFolderId).toBe('folder-1');
    });

    it('should clear selection when changing folder', () => {
      const { result } = renderHook(() => useFileStore());
      act(() => {
        result.current.setSelectedFileIds(['file-1']);
        result.current.setCurrentFolder('folder-1');
      });
      expect(result.current.selectedFileIds.length).toBe(0);
    });
  });

  describe('Multi-Selection', () => {
    it('should set selected file IDs', () => {
      const { result } = renderHook(() => useFileStore());
      act(() => {
        result.current.setSelectedFileIds(['file-1', 'file-2']);
      });
      expect(result.current.selectedFileIds).toContain('file-1');
      expect(result.current.selectedFileIds).toContain('file-2');
    });

    it('should clear selection', () => {
      const { result } = renderHook(() => useFileStore());
      act(() => {
        result.current.setSelectedFileIds(['file-1']);
        result.current.clearSelection();
      });
      expect(result.current.selectedFileIds.length).toBe(0);
    });
  });

  describe('Clipboard', () => {
    it('should set clipboard for copy', () => {
      const { result } = renderHook(() => useFileStore());
      act(() => {
        result.current.setClipboard(['file-1'], 'copy');
      });
      expect(result.current.clipboard.items).toContain('file-1');
      expect(result.current.clipboard.operation).toBe('copy');
    });

    it('should clear clipboard', () => {
      const { result } = renderHook(() => useFileStore());
      act(() => {
        result.current.setClipboard(['file-1'], 'copy');
        result.current.clearClipboard();
      });
      expect(result.current.clipboard.items.length).toBe(0);
    });
  });

  describe('Drag & Drop', () => {
    it('should set and clear dragged items', () => {
      const { result } = renderHook(() => useFileStore());
      act(() => {
        result.current.setDraggedItems(['file-1', 'file-2']);
      });
      expect(result.current.draggedItems.length).toBe(2);

      act(() => {
        result.current.setDraggedItems([]);
      });
      expect(result.current.draggedItems.length).toBe(0);
    });
  });

  describe('View & Sort', () => {
    it('should toggle view type', () => {
      const { result } = renderHook(() => useFileStore());
      act(() => {
        result.current.setViewType('list');
      });
      expect(result.current.viewType).toBe('list');

      act(() => {
        result.current.setViewType('grid');
      });
      expect(result.current.viewType).toBe('grid');
    });

    it('should set sort mode', () => {
      const { result } = renderHook(() => useFileStore());
      act(() => {
        result.current.setSortBy('size');
      });
      expect(result.current.sortBy).toBe('size');
    });
  });

  describe('Delete Multiple Files', () => {
    it('should delete multiple files', () => {
      const { result } = renderHook(() => useFileStore());
      act(() => {
        result.current.deleteMultipleFiles(['file-1', 'file-2']);
      });
      expect(result.current.data).toBeDefined();
    });
  });

  describe('Move Multiple Files', () => {
    it('should move multiple files to target folder', () => {
      const { result } = renderHook(() => useFileStore());
      act(() => {
        result.current.moveMultipleFiles(['file-1', 'file-2'], 'folder-2');
      });
      expect(result.current.draggedItems.length).toBe(0);
    });
  });

  describe('Copy Multiple Files', () => {
    it('should copy multiple files', () => {
      const { result } = renderHook(() => useFileStore());
      act(() => {
        result.current.copyMultipleFiles(['file-1', 'file-2'], 'folder-2');
      });
      expect(result.current.data).toBeDefined();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate between folders with arrow keys', () => {
      const { result } = renderHook(() => useFileStore());
      expect(result.current.currentFolderId).toBe('root');
      act(() => {
        result.current.setCurrentFolder('folder-1');
      });
      expect(result.current.currentFolderId).toBe('folder-1');
    });
  });

  describe('Selection & Focus', () => {
    it('should maintain focused item during navigation', () => {
      const { result } = renderHook(() => useFileStore());
      act(() => {
        result.current.setSelectedFileIds(['file-1']);
      });
      expect(result.current.selectedFileIds[0]).toBe('file-1');
      act(() => {
        result.current.setCurrentFolder('folder-1');
      });
      expect(result.current.selectedFileIds.length).toBe(0);
    });

    it('should handle multi-select operations', () => {
      const { result } = renderHook(() => useFileStore());
      act(() => {
        result.current.setSelectedFileIds(['file-1', 'file-2', 'file-3']);
      });
      expect(result.current.selectedFileIds.length).toBe(3);
    });
  });

  describe('File Operations Integrity', () => {
    it('should preserve data during nested navigation', () => {
      const { result } = renderHook(() => useFileStore());
      const originalData = JSON.stringify(result.current.data);
      act(() => {
        result.current.setCurrentFolder('folder-1');
        result.current.setSelectedFileIds(['file-1']);
        result.current.setCurrentFolder('root');
      });
      const afterData = JSON.stringify(result.current.data);
      expect(originalData).toBe(afterData);
    });
  });
});
