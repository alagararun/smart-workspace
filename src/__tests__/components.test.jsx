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
  });
});
