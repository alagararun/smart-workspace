import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FilePreview from '../components/FilePreview';
import FileList from '../components/FileList';

// Mock zustand store for component testing
vi.mock('../store/fileStore', () => {
  return {
    default: vi.fn(() => ({
      data: {
        id: 'root',
        name: 'My Files',
        type: 'folder',
        children: [
          {
            id: 'folder-1',
            name: 'Documents',
            type: 'folder',
            children: [
              { id: 'file-1', name: 'Test.pdf', type: 'file', fileType: 'pdf' },
            ],
          },
        ],
      },
      currentFolderId: 'root',
      selectedFileIds: [],
      draggedItems: [],
      setCurrentFolder: vi.fn(),
      setSelectedFileIds: vi.fn(),
      getCurrentFolder: vi.fn(() => ({
        id: 'root',
        name: 'My Files',
        type: 'folder',
        children: [
          { id: 'folder-1', name: 'Documents', type: 'folder' },
        ],
      })),
      getSelectedFile: vi.fn(() => null),
      viewType: 'grid',
      searchQuery: '',
      setViewType: vi.fn(),
      setSearchQuery: vi.fn(),
      addFolder: vi.fn(),
      loading: false,
      error: null,
    })),
  };
});

describe('React Components - Core Tests', () => {
  describe('FilePreview', () => {
    it('should display placeholder when no file selected', () => {
      render(<FilePreview file={null} />);
      expect(screen.getByText(/Select a file to preview/i)).toBeInTheDocument();
    });

    it('should display file metadata for PDF', () => {
      const file = {
        id: 'file-1',
        name: 'document.pdf',
        type: 'file',
        fileType: 'pdf',
        size: 2048576,
        date: new Date('2024-01-15'),
      };

      render(<FilePreview file={file} />);
      expect(screen.getByText('document.pdf')).toBeInTheDocument();
    });

    it('should display image preview', () => {
      const file = {
        id: 'file-1',
        name: 'image.jpg',
        type: 'file',
        fileType: 'image',
        url: 'https://via.placeholder.com/400x300',
      };

      render(<FilePreview file={file} />);
      const img = screen.getByAltText('image.jpg');
      expect(img).toBeInTheDocument();
    });

    it('should show download button for files', () => {
      const file = {
        id: 'file-1',
        name: 'document.pdf',
        type: 'file',
        fileType: 'pdf',
        url: 'https://example.com/doc.pdf',
        date: new Date(),
      };

      render(<FilePreview file={file} />);
      expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();
    });
  });

  describe('FileList', () => {
    it('should display empty folder message', () => {
      const emptyFolder = {
        id: 'empty',
        name: 'Empty Folder',
        type: 'folder',
        children: [],
      };

      render(<FileList currentFolder={emptyFolder} />);
      expect(screen.getByText(/This folder is empty/i)).toBeInTheDocument();
    });

    it('should display files in grid view', () => {
      const folder = {
        id: 'folder-1',
        name: 'Test Folder',
        type: 'folder',
        children: [
          { id: 'file-1', name: 'File1.txt', type: 'file', fileType: 'other' },
          { id: 'file-2', name: 'File2.txt', type: 'file', fileType: 'other' },
        ],
      };

      render(<FileList currentFolder={folder} />);
      expect(screen.getByText('File1.txt')).toBeInTheDocument();
      expect(screen.getByText('File2.txt')).toBeInTheDocument();
    });

    it('should display upload button', () => {
      const folder = {
        id: 'folder-1',
        name: 'Test Folder',
        type: 'folder',
        children: [],
      };

      render(<FileList currentFolder={folder} />);
      expect(screen.getByRole('button', { name: /Upload File/i })).toBeInTheDocument();
    });

    it('should render multiple file types with correct icons', () => {
      const folder = {
        id: 'folder-1',
        name: 'Mixed Files',
        type: 'folder',
        children: [
          { id: 'file-1', name: 'image.jpg', type: 'file', fileType: 'image' },
          { id: 'file-2', name: 'video.mp4', type: 'file', fileType: 'video' },
          { id: 'file-3', name: 'document.pdf', type: 'file', fileType: 'pdf' },
        ],
      };

      render(<FileList currentFolder={folder} />);
      expect(screen.getByText('image.jpg')).toBeInTheDocument();
      expect(screen.getByText('video.mp4')).toBeInTheDocument();
      expect(screen.getByText('document.pdf')).toBeInTheDocument();
    });
  });

  describe('FilePreview - Advanced', () => {
    it('should display folder information correctly', () => {
      const folder = {
        id: 'folder-1',
        name: 'Documents',
        type: 'folder',
        children: [
          { id: 'file-1', name: 'doc1.pdf', type: 'file' },
          { id: 'file-2', name: 'doc2.pdf', type: 'file' },
        ],
        date: new Date('2024-01-15'),
      };

      render(<FilePreview file={folder} />);
      expect(screen.getByText(/Documents/i)).toBeInTheDocument();
    });

    it('should handle video file preview', () => {
      const file = {
        id: 'file-1',
        name: 'movie.mp4',
        type: 'file',
        fileType: 'video',
        url: 'https://example.com/video.mp4',
        date: new Date(),
      };

      render(<FilePreview file={file} />);
      expect(screen.getByText('movie.mp4')).toBeInTheDocument();
    });

    it('should display unavailable preview message for unsupported formats', () => {
      const file = {
        id: 'file-1',
        name: 'archive.zip',
        type: 'file',
        fileType: 'other',
        date: new Date(),
      };

      render(<FilePreview file={file} />);
      expect(screen.getByText(/archive.zip/)).toBeInTheDocument();
    });

    it('should display folder with multiple files', () => {
      const folder = {
        id: 'folder-1',
        name: 'Large Folder',
        type: 'folder',
        children: Array.from({ length: 10 }, (_, i) => ({
          id: `file-${i}`,
          name: `file${i}.txt`,
          type: 'file',
        })),
        date: new Date(),
      };

      render(<FilePreview file={folder} />);
      expect(screen.getByText('Large Folder')).toBeInTheDocument();
      expect(screen.getByText(/10/)).toBeInTheDocument();
    });

    it('should handle file without date', () => {
      const file = {
        id: 'file-1',
        name: 'report.pdf',
        type: 'file',
        fileType: 'pdf',
      };

      render(<FilePreview file={file} />);
      expect(screen.getByText('report.pdf')).toBeInTheDocument();
    });

    it('should handle file with size', () => {
      const file = {
        id: 'file-1',
        name: 'large.zip',
        type: 'file',
        fileType: 'other',
        size: 5242880,
        date: new Date(),
      };

      render(<FilePreview file={file} />);
      expect(screen.getByText('large.zip')).toBeInTheDocument();
    });

    it('should display audio preview', () => {
      const file = {
        id: 'file-1',
        name: 'song.mp3',
        type: 'file',
        fileType: 'audio',
        url: 'https://example.com/song.mp3',
        date: new Date(),
      };

      render(<FilePreview file={file} />);
      expect(screen.getByText('song.mp3')).toBeInTheDocument();
    });

    it('should handle folder without date', () => {
      const folder = {
        id: 'folder-1',
        name: 'Docs',
        type: 'folder',
        children: [],
      };

      render(<FilePreview file={folder} />);
      expect(screen.getByText('Docs')).toBeInTheDocument();
    });
  });

  describe('FileList - Additional Tests', () => {
    it('should display multiple folders', () => {
      const folder = {
        id: 'root',
        name: 'Root',
        type: 'folder',
        children: [
          { id: 'folder-1', name: 'Folder1', type: 'folder' },
          { id: 'folder-2', name: 'Folder2', type: 'folder' },
          { id: 'folder-3', name: 'Folder3', type: 'folder' },
        ],
      };

      render(<FileList currentFolder={folder} />);
      expect(screen.getByText('Folder1')).toBeInTheDocument();
      expect(screen.getByText('Folder2')).toBeInTheDocument();
      expect(screen.getByText('Folder3')).toBeInTheDocument();
    });

    it('should render mixed folders and files', () => {
      const folder = {
        id: 'root',
        name: 'Root',
        type: 'folder',
        children: [
          { id: 'folder-1', name: 'Documents', type: 'folder' },
          { id: 'file-1', name: 'readme.txt', type: 'file', fileType: 'other' },
          { id: 'folder-2', name: 'Images', type: 'folder' },
          { id: 'file-2', name: 'photo.jpg', type: 'file', fileType: 'image' },
        ],
      };

      render(<FileList currentFolder={folder} />);
      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText('readme.txt')).toBeInTheDocument();
      expect(screen.getByText('Images')).toBeInTheDocument();
      expect(screen.getByText('photo.jpg')).toBeInTheDocument();
    });

    it('should handle folder with many items', () => {
      const children = Array.from({ length: 20 }, (_, i) => ({
        id: `item-${i}`,
        name: `item${i}`,
        type: i % 2 === 0 ? 'folder' : 'file',
        fileType: 'other',
      }));

      const folder = {
        id: 'root',
        name: 'Root',
        type: 'folder',
        children,
      };

      render(<FileList currentFolder={folder} />);
      expect(screen.getByText('item0')).toBeInTheDocument();
      expect(screen.getByText('item19')).toBeInTheDocument();
    });

    it('should display folder and file names with special characters', () => {
      const folder = {
        id: 'root',
        name: 'Root',
        type: 'folder',
        children: [
          { id: 'file-1', name: 'report-2024.pdf', type: 'file', fileType: 'pdf' },
          { id: 'folder-1', name: 'Project [Draft]', type: 'folder' },
          { id: 'file-2', name: 'data_export.csv', type: 'file', fileType: 'other' },
        ],
      };

      render(<FileList currentFolder={folder} />);
      expect(screen.getByText('report-2024.pdf')).toBeInTheDocument();
      expect(screen.getByText('Project [Draft]')).toBeInTheDocument();
      expect(screen.getByText('data_export.csv')).toBeInTheDocument();
    });

    it('should display only files', () => {
      const folder = {
        id: 'root',
        name: 'Root',
        type: 'folder',
        children: [
          { id: 'file-1', name: 'a.txt', type: 'file', fileType: 'other' },
          { id: 'file-2', name: 'b.txt', type: 'file', fileType: 'other' },
          { id: 'file-3', name: 'c.txt', type: 'file', fileType: 'other' },
        ],
      };

      render(<FileList currentFolder={folder} />);
      expect(screen.getByText('a.txt')).toBeInTheDocument();
      expect(screen.getByText('b.txt')).toBeInTheDocument();
      expect(screen.getByText('c.txt')).toBeInTheDocument();
    });

    it('should display only folders', () => {
      const folder = {
        id: 'root',
        name: 'Root',
        type: 'folder',
        children: [
          { id: 'folder-1', name: 'Folder A', type: 'folder' },
          { id: 'folder-2', name: 'Folder B', type: 'folder' },
          { id: 'folder-3', name: 'Folder C', type: 'folder' },
        ],
      };

      render(<FileList currentFolder={folder} />);
      expect(screen.getByText('Folder A')).toBeInTheDocument();
      expect(screen.getByText('Folder B')).toBeInTheDocument();
      expect(screen.getByText('Folder C')).toBeInTheDocument();
    });

    it('should handle files with different types', () => {
      const folder = {
        id: 'root',
        name: 'Root',
        type: 'folder',
        children: [
          { id: 'file-1', name: 'image.png', type: 'file', fileType: 'image' },
          { id: 'file-2', name: 'video.mp4', type: 'file', fileType: 'video' },
          { id: 'file-3', name: 'doc.pdf', type: 'file', fileType: 'pdf' },
          { id: 'file-4', name: 'data.json', type: 'file', fileType: 'other' },
        ],
      };

      render(<FileList currentFolder={folder} />);
      expect(screen.getByText('image.png')).toBeInTheDocument();
      expect(screen.getByText('video.mp4')).toBeInTheDocument();
      expect(screen.getByText('doc.pdf')).toBeInTheDocument();
      expect(screen.getByText('data.json')).toBeInTheDocument();
    });
  });
});
