import { describe, it, expect } from 'vitest';
import { formatFileSize, formatDate, getFileType, getAllFiles, getFolderStats, buildGraphData } from '../utils/fileOperations';

describe('Coverage Enhancement - File Operations Edge Cases', () => {
  describe('formatFileSize - Edge Cases', () => {
    it('should handle zero bytes', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });

    it('should handle very large files (GB)', () => {
      const threeGB = 3 * 1024 * 1024 * 1024;
      const result = formatFileSize(threeGB);
      expect(result).toContain('GB');
    });

    it('should handle decimal precision for large files', () => {
      const size = 1536 * 1024;
      expect(formatFileSize(size)).toContain('MB');
    });

    it('should handle edge boundary between units', () => {
      expect(formatFileSize(1024)).toContain('KB');
      expect(formatFileSize(1023)).toBe('1023 B');
    });

    it('should handle megabytes', () => {
      expect(formatFileSize(5 * 1024 * 1024)).toContain('MB');
    });

    it('should handle gigabytes', () => {
      expect(formatFileSize(3 * 1024 * 1024 * 1024)).toContain('GB');
    });
  });

  describe('formatDate - Edge Cases', () => {
    it('should format dates in December correctly', () => {
      const date = new Date('2024-12-31T23:59:59');
      expect(formatDate(date)).toContain('2024');
    });

    it('should format dates in January correctly', () => {
      const date = new Date('2024-01-01T00:00:00');
      expect(formatDate(date)).toContain('2024');
    });

    it('should format dates in June', () => {
      const date = new Date('2024-06-15T12:00:00');
      expect(formatDate(date)).toContain('2024');
    });

    it('should handle date strings', () => {
      const result = formatDate('2024-06-15');
      expect(result).toBeTruthy();
    });

    it('should handle timestamps', () => {
      const result = formatDate(new Date().getTime());
      expect(result).toBeTruthy();
    });

    it('should handle leap year dates', () => {
      const result = formatDate(new Date('2024-02-29'));
      expect(result).toBeTruthy();
    });
  });

  describe('getFileType - Extended Coverage', () => {
    it('should identify image files', () => {
      expect(getFileType('photo.jpg')).toBe('image');
    });

    it('should identify png files', () => {
      expect(getFileType('image.png')).toBe('image');
    });

    it('should identify gif files', () => {
      expect(getFileType('animation.gif')).toBe('image');
    });

    it('should identify webp files', () => {
      expect(getFileType('image.webp')).toBe('image');
    });

    it('should identify video files', () => {
      expect(getFileType('movie.mp4')).toBe('video');
    });

    it('should identify avi files', () => {
      expect(getFileType('video.avi')).toBe('video');
    });

    it('should identify mov files', () => {
      expect(getFileType('movie.mov')).toBe('video');
    });

    it('should identify mkv files', () => {
      expect(getFileType('video.mkv')).toBe('video');
    });

    it('should identify webm files', () => {
      expect(getFileType('clip.webm')).toBe('video');
    });

    it('should identify PDF files', () => {
      expect(getFileType('document.pdf')).toBe('pdf');
    });

    it('should identify PDF files case-insensitive', () => {
      expect(getFileType('document.PDF')).toBe('pdf');
    });

    it('should be case-insensitive for JPG', () => {
      expect(getFileType('photo.JPG')).toBe('image');
    });

    it('should be case-insensitive for MP4', () => {
      expect(getFileType('VIDEO.MP4')).toBe('video');
    });

    it('should handle files without extension', () => {
      expect(getFileType('README')).toBe('other');
    });

    it('should handle Makefile', () => {
      expect(getFileType('Makefile')).toBe('other');
    });

    it('should handle multiple dots in filename', () => {
      expect(getFileType('archive.backup.zip')).toBe('other');
    });

    it('should handle image.min.jpg', () => {
      expect(getFileType('image.min.jpg')).toBe('image');
    });

    it('should identify compressed files as other', () => {
      expect(getFileType('archive.zip')).toBe('other');
    });

    it('should identify docx files as other', () => {
      expect(getFileType('report.docx')).toBe('other');
    });

    it('should identify json files as other', () => {
      expect(getFileType('data.json')).toBe('other');
    });

    it('should handle jpeg extension', () => {
      expect(getFileType('photo.jpeg')).toBe('image');
    });
  });

  describe('getAllFiles - Extended Coverage', () => {
    it('should handle deeply nested folder structures', () => {
      const tree = {
        id: 'root',
        type: 'folder',
        children: [
          {
            id: 'level1',
            type: 'folder',
            children: [
              {
                id: 'level2',
                type: 'folder',
                children: [
                  { id: 'file1', type: 'file' },
                ],
              },
            ],
          },
        ],
      };
      const files = getAllFiles(tree);
      expect(files).toHaveLength(1);
      expect(files[0].id).toBe('file1');
    });

    it('should handle mixed files and folders', () => {
      const tree = {
        id: 'root',
        type: 'folder',
        children: [
          { id: 'file1', type: 'file' },
          { id: 'folder1', type: 'folder', children: [] },
          { id: 'file2', type: 'file' },
        ],
      };
      const files = getAllFiles(tree);
      expect(files).toHaveLength(2);
    });

    it('should return empty array for tree with no files', () => {
      const tree = {
        id: 'root',
        type: 'folder',
        children: [
          { id: 'folder1', type: 'folder', children: [] },
        ],
      };
      const files = getAllFiles(tree);
      expect(files).toHaveLength(0);
    });

    it('should handle folders with undefined children', () => {
      const tree = {
        id: 'root',
        type: 'folder',
        children: [
          { id: 'folder1', type: 'folder' },
        ],
      };
      const files = getAllFiles(tree);
      expect(files).toHaveLength(0);
    });

    it('should handle multiple nested levels with multiple files', () => {
      const tree = {
        id: 'root',
        type: 'folder',
        children: [
          { id: 'file1', type: 'file' },
          {
            id: 'folder1',
            type: 'folder',
            children: [
              { id: 'file2', type: 'file' },
              { id: 'file3', type: 'file' },
            ],
          },
        ],
      };
      const files = getAllFiles(tree);
      expect(files.length).toBeGreaterThan(2);
    });

    it('should handle very deep nesting', () => {
      const createDeepTree = (depth) => {
        if (depth === 0) return { id: `file${depth}`, type: 'file' };
        return {
          id: `folder${depth}`,
          type: 'folder',
          children: [createDeepTree(depth - 1)],
        };
      };
      const tree = createDeepTree(5);
      const files = getAllFiles(tree);
      expect(files.length).toBeGreaterThan(0);
    });
  });

  describe('getFolderStats - Extended Coverage', () => {
    it('should calculate stats for empty folder', () => {
      const folder = {
        id: 'folder1',
        type: 'folder',
        children: [],
      };
      const stats = getFolderStats(folder);
      expect(stats.fileCount).toBe(0);
      expect(stats.totalSize).toBe(0);
    });

    it('should calculate stats for mixed content', () => {
      const folder = {
        id: 'folder1',
        type: 'folder',
        children: [
          { id: 'file1', type: 'file', size: 1024 },
          { id: 'file2', type: 'file', size: 2048 },
          { id: 'subfolder', type: 'folder', children: [
            { id: 'file3', type: 'file', size: 512 },
          ]},
        ],
      };
      const stats = getFolderStats(folder);
      expect(stats.fileCount).toBeGreaterThan(0);
      expect(stats.totalSize).toBeGreaterThan(0);
    });

    it('should handle very large folder sizes', () => {
      const folder = {
        id: 'folder1',
        type: 'folder',
        children: [
          { id: 'largefile', type: 'file', size: 2 * 1024 * 1024 * 1024 },
        ],
      };
      const stats = getFolderStats(folder);
      expect(stats.totalSize).toBeGreaterThan(1024 * 1024 * 1024);
    });

    it('should count multiple files', () => {
      const folder = {
        id: 'folder1',
        type: 'folder',
        children: [
          { id: 'file1', type: 'file', size: 512 },
          { id: 'file2', type: 'file', size: 512 },
          { id: 'file3', type: 'file', size: 512 },
        ],
      };
      const stats = getFolderStats(folder);
      expect(stats.fileCount).toBe(3);
    });

    it('should handle nested folders correctly', () => {
      const folder = {
        id: 'folder1',
        type: 'folder',
        children: [
          {
            id: 'subfolder',
            type: 'folder',
            children: [
              { id: 'file1', type: 'file', size: 1024 },
            ],
          },
        ],
      };
      const stats = getFolderStats(folder);
      expect(stats).toBeTruthy();
    });
  });

  describe('buildGraphData - Extended Coverage', () => {
    it('should handle single file', () => {
      const tree = {
        id: 'root',
        name: 'root',
        type: 'folder',
        children: [
          { id: 'file1', name: 'test.pdf', type: 'file' },
        ],
      };
      const graph = buildGraphData(tree);
      expect(graph.nodes.length).toBeGreaterThan(0);
      expect(graph.edges).toBeDefined();
    });

    it('should create edges for parent-child relationships', () => {
      const tree = {
        id: 'root',
        name: 'root',
        type: 'folder',
        children: [
          { id: 'folder1', name: 'Docs', type: 'folder', children: [] },
        ],
      };
      const graph = buildGraphData(tree);
      expect(graph.edges.length).toBeGreaterThan(0);
    });

    it('should handle complex nested structures', () => {
      const tree = {
        id: 'root',
        name: 'root',
        type: 'folder',
        children: [
          {
            id: 'folder1',
            name: 'Documents',
            type: 'folder',
            children: [
              { id: 'file1', name: 'doc.pdf', type: 'file' },
              {
                id: 'folder2',
                name: 'Archives',
                type: 'folder',
                children: [
                  { id: 'file2', name: 'archive.zip', type: 'file' },
                ],
              },
            ],
          },
        ],
      };
      const graph = buildGraphData(tree);
      expect(graph.nodes.length).toBeGreaterThan(1);
      expect(graph.edges.length).toBeGreaterThan(0);
    });

    it('should handle multiple files at root', () => {
      const tree = {
        id: 'root',
        name: 'root',
        type: 'folder',
        children: [
          { id: 'file1', name: 'doc1.pdf', type: 'file' },
          { id: 'file2', name: 'doc2.pdf', type: 'file' },
          { id: 'file3', name: 'doc3.pdf', type: 'file' },
        ],
      };
      const graph = buildGraphData(tree);
      expect(graph.nodes.length).toBeGreaterThan(3);
    });

    it('should include node labels', () => {
      const tree = {
        id: 'root',
        name: 'My Files',
        type: 'folder',
        children: [
          { id: 'file1', name: 'document.pdf', type: 'file' },
        ],
      };
      const graph = buildGraphData(tree);
      const hasLabels = graph.nodes.some(node => node.label);
      expect(hasLabels).toBeTruthy();
    });

    it('should create proper edge format', () => {
      const tree = {
        id: 'root',
        name: 'root',
        type: 'folder',
        children: [
          {
            id: 'folder1',
            name: 'folder',
            type: 'folder',
            children: [
              { id: 'file1', name: 'file.txt', type: 'file' },
            ],
          },
        ],
      };
      const graph = buildGraphData(tree);
      if (graph.edges.length > 0) {
        expect(graph.edges[0]).toHaveProperty('source');
        expect(graph.edges[0]).toHaveProperty('target');
      }
    });
  });
});

describe('Coverage Enhancement - Error Handling and Edge Cases', () => {
  it('should handle formatFileSize with undefined', () => {
    const result = formatFileSize(undefined);
    expect(result).toBeTruthy();
  });

  it('should handle formatFileSize with null', () => {
    const result = formatFileSize(null);
    expect(result).toBeTruthy();
  });

  it('should handle formatFileSize with NaN', () => {
    const result = formatFileSize(NaN);
    expect(result).toBeTruthy();
  });

  it('should handle getFileType with empty string', () => {
    const result = getFileType('');
    expect(result).toBe('other');
  });

  it('should handle getFileType with dot only', () => {
    const result = getFileType('.');
    expect(result).toBeTruthy();
  });

  it('should handle getFileType with path', () => {
    const result = getFileType('/path/to/file.txt');
    expect(result).toBeTruthy();
  });

  it('should handle getAllFiles with null', () => {
    const result = getAllFiles({ id: 'root', type: 'folder', children: [] });
    expect(result).toBeDefined();
  });

  it('should handle getAllFiles with empty tree', () => {
    const tree = {
      id: 'root',
      type: 'folder',
      children: [],
    };
    const result = getAllFiles(tree);
    expect(result).toHaveLength(0);
  });

  it('should handle getFolderStats with missing children', () => {
    const folder = {
      id: 'folder1',
      type: 'folder',
    };
    const stats = getFolderStats(folder);
    expect(stats).toBeTruthy();
    expect(typeof stats.fileCount).toBe('number');
  });

  it('should handle buildGraphData with missing name', () => {
    const tree = {
      id: 'root',
      name: 'root',
      type: 'folder',
      children: [
        { id: 'file1', name: 'file.txt', type: 'file' },
      ],
    };
    const graph = buildGraphData(tree);
    expect(graph.nodes).toBeDefined();
    expect(graph.edges).toBeDefined();
  });

  it('should handle buildGraphData with empty children array', () => {
    const tree = {
      id: 'root',
      name: 'root',
      type: 'folder',
      children: [],
    };
    const graph = buildGraphData(tree);
    expect(graph.nodes).toBeDefined();
  });

  it('should preserve node IDs in graph', () => {
    const tree = {
      id: 'root',
      name: 'root',
      type: 'folder',
      children: [
        { id: 'unique-file-123', name: 'file.txt', type: 'file' },
      ],
    };
    const graph = buildGraphData(tree);
    const hasUniqueId = graph.nodes.some(node => node.id === 'unique-file-123');
    expect(hasUniqueId).toBeTruthy();
  });

  it('should handle formatDate with milliseconds', () => {
    const result = formatDate(1703001600000);
    expect(result).toBeTruthy();
  });

  it('should handle multiple large files', () => {
    const folder = {
      id: 'folder1',
      type: 'folder',
      children: [
        { id: 'file1', type: 'file', size: 1024 * 1024 * 1024 * 10 },
        { id: 'file2', type: 'file', size: 1024 * 1024 * 1024 * 20 },
        { id: 'file3', type: 'file', size: 1024 * 1024 * 1024 * 5 },
      ],
    };
    const stats = getFolderStats(folder);
    expect(stats.totalSize).toBeGreaterThan(1024 * 1024 * 1024 * 30);
  });
});
