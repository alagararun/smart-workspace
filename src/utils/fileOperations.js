// Mock API functions with simulated latency
export const mockApi = {
  async getFiles(folderId) {
    await simulateLatency(300);
    return { success: true, data: {} };
  },

  async renameFile(fileId, newName) {
    await simulateLatency(200);
    if (Math.random() > 0.95) {
      throw new Error('Network error: Failed to rename file');
    }
    return { success: true, data: { id: fileId, name: newName } };
  },

  async deleteFile(fileId) {
    await simulateLatency(200);
    if (Math.random() > 0.95) {
      throw new Error('Network error: Failed to delete file');
    }
    return { success: true, data: { id: fileId } };
  },

  async moveFile(fileId, targetFolderId) {
    await simulateLatency(250);
    if (Math.random() > 0.95) {
      throw new Error('Network error: Failed to move file');
    }
    return { success: true, data: { id: fileId, parentId: targetFolderId } };
  },

  async uploadFile(file, parentFolderId) {
    await simulateLatency(500);
    if (Math.random() > 0.95) {
      throw new Error('Network error: Upload failed');
    }
    const fileId = `file-${Date.now()}`;
    return {
      success: true,
      data: {
        id: fileId,
        name: file.name,
        type: 'file',
        fileType: getFileType(file.name),
        url: URL.createObjectURL(file),
        size: file.size,
        date: new Date(),
      },
    };
  },
};

function simulateLatency(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getFileType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
  if (['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(ext)) return 'video';
  if (ext === 'pdf') return 'pdf';
  return 'other';
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function getParentPath(tree, nodeId, path = []) {
  if (tree.id === nodeId) {
    return path;
  }

  if (tree.children) {
    for (const child of tree.children) {
      const result = getParentPath(child, nodeId, [...path, tree]);
      if (result) return result;
    }
  }

  return null;
}

export function createNodeJSON(data) {
  return JSON.stringify(data, null, 2);
}

export function downloadJSON(data, filename = 'file-explorer-data.json') {
  const json = createNodeJSON(data);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getAllFiles(tree, files = []) {
  if (tree.type === 'file') {
    files.push(tree);
  }
  if (tree.children) {
    tree.children.forEach((child) => getAllFiles(child, files));
  }
  return files;
}

export function getFolderStats(folder) {
  const files = getAllFiles(folder);
  const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
  const fileCount = files.length;
  const folderCount = countFolders(folder) - 1; // Exclude the folder itself

  return { fileCount, folderCount, totalSize };
}

function countFolders(tree) {
  let count = tree.type === 'folder' ? 1 : 0;
  if (tree.children) {
    tree.children.forEach((child) => {
      count += countFolders(child);
    });
  }
  return count;
}

// Graph/visualization utility
export function buildGraphData(tree, graph = { nodes: [], edges: [] }) {
  graph.nodes.push({
    id: tree.id,
    label: tree.name,
    type: tree.type,
  });

  if (tree.children) {
    tree.children.forEach((child) => {
      graph.edges.push({
        source: tree.id,
        target: child.id,
      });
      buildGraphData(child, graph);
    });
  }

  return graph;
}
