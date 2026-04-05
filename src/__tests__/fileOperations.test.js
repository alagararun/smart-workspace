import { describe, it, expect } from 'vitest';
import {
  getFileType,
  formatFileSize,
  formatDate,
  getAllFiles,
  getFolderStats,
  buildGraphData,
} from '../utils/fileOperations';

describe('File Operations - Core Utils', () => {
  describe('getFileType', () => {
    it('should identify image files', () => {
      expect(getFileType('photo.jpg')).toBe('image');
      expect(getFileType('image.png')).toBe('image');
    });

    it('should identify video files', () => {
      expect(getFileType('video.mp4')).toBe('video');
      expect(getFileType('movie.mov')).toBe('video');
    });

    it('should identify PDF files', () => {
      expect(getFileType('document.pdf')).toBe('pdf');
    });

    it('should return other for unknown types', () => {
      expect(getFileType('file.txt')).toBe('other');
      expect(getFileType('data.json')).toBe('other');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes to KB/MB/GB', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });
  });

  describe('formatDate', () => {
    it('should format date as Mon DD, YYYY', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date);
      expect(result).toMatch(/Jan 15, 2024/);
    });
  });

  describe('getAllFiles', () => {
    it('should extract all files from tree recursively', () => {
      const tree = {
        id: 'root',
        type: 'folder',
        children: [
          { id: '1', name: 'File1', type: 'file' },
          {
            id: '2',
            type: 'folder',
            children: [{ id: '3', name: 'File2', type: 'file' }],
          },
        ],
      };
      const files = getAllFiles(tree);
      expect(files.length).toBe(2);
      expect(files.every((f) => f.type === 'file')).toBe(true);
    });
  });

  describe('getFolderStats', () => {
    it('should calculate folder statistics', () => {
      const folder = {
        id: 'root',
        type: 'folder',
        children: [
          { id: '1', type: 'file', size: 1024 },
          { id: '2', type: 'folder', children: [] },
        ],
      };
      const stats = getFolderStats(folder);
      expect(stats.fileCount).toBeGreaterThan(0);
      expect(stats.folderCount).toBe(1);
    });
  });

  describe('buildGraphData', () => {
    it('should build graph nodes and edges', () => {
      const tree = {
        id: 'root',
        type: 'folder',
        children: [
          { id: '1', type: 'file' },
          { id: '2', type: 'folder', children: [] },
        ],
      };
      const graph = buildGraphData(tree);
      expect(graph.nodes.length).toBeGreaterThan(0);
      expect(Array.isArray(graph.edges)).toBe(true);
    });

    it('should handle complex nested folder structures', () => {
      const tree = {
        id: 'root',
        name: 'Root',
        type: 'folder',
        children: [
          { id: '1', name: 'File1', type: 'file' },
          {
            id: '2',
            name: 'Folder2',
            type: 'folder',
            children: [
              { id: '3', name: 'File3', type: 'file' },
              { id: '4', name: 'Folder4', type: 'folder', children: [] },
            ],
          },
        ],
      };
      const graph = buildGraphData(tree);
      expect(graph.nodes.length).toBeGreaterThanOrEqual(4);
      expect(graph.edges.length).toBeGreaterThan(0);
    });
  });

  describe('File Size Conversion', () => {
    it('should handle all unit conversions correctly', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });
  });

  describe('Date Formatting', () => {
    it('should format dates in consistent format', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date);
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('File Type Detection', () => {
    it('should correctly identify all media types', () => {
      expect(getFileType('test.jpg')).toBe('image');
      expect(getFileType('test.mp4')).toBe('video');
      expect(getFileType('test.pdf')).toBe('pdf');
      expect(getFileType('test.txt')).toBe('other');
    });
  });
});
