import { create } from 'zustand';
import { mockFileTree } from '../data/mockFileTree';

const useFileStore = create((set, get) => ({
  // State
  data: mockFileTree,
  currentFolderId: 'root',
  selectedFileId: null,
  selectedFileIds: [], // Multi-selection
  viewType: 'grid', // 'grid' or 'list'
  searchQuery: '',
  loading: false,
  error: null,
  showGraphView: false,
  sortBy: 'name', // 'name', 'size', or 'date'
  clipboard: { items: [], operation: null }, // 'copy' or 'cut'
  draggedItems: [], // Items being dragged for visual feedback

  // Actions
  setData: (newData) => set({ data: newData }),

  setCurrentFolder: (folderId) => set({ currentFolderId: folderId, selectedFileId: null, selectedFileIds: [] }),

  setSelectedFile: (fileId) => set({ selectedFileId: fileId }),

  setSelectedFileIds: (fileIds) => set({ selectedFileIds: fileIds }),

  setDraggedItems: (items) => set({ draggedItems: items }),

  addToSelection: (fileId) => set((state) => ({
    selectedFileIds: state.selectedFileIds.includes(fileId) 
      ? state.selectedFileIds.filter(id => id !== fileId)
      : [...state.selectedFileIds, fileId],
  })),

  clearSelection: () => set({ selectedFileIds: [], selectedFileId: null }),

  setClipboard: (items, operation) => set({ clipboard: { items, operation } }),

  clearClipboard: () => set({ clipboard: { items: [], operation: null } }),

  setViewType: (viewType) => set({ viewType }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  setShowGraphView: (show) => set({ showGraphView: show }),

  setSortBy: (sortBy) => set({ sortBy }),

  getCurrentFolder: () => {
    const { data, currentFolderId } = get();
    return findNodeById(data, currentFolderId);
  },

  getSelectedFile: () => {
    const { data, selectedFileId } = get();
    return selectedFileId ? findNodeById(data, selectedFileId) : null;
  },

  renameFile: (fileId, newName) =>
    set((state) => ({
      data: renameNodeInTree(state.data, fileId, newName),
    })),

  deleteFile: (fileId) =>
    set((state) => ({
      data: deleteNodeFromTree(state.data, fileId),
      selectedFileId: state.selectedFileId === fileId ? null : state.selectedFileId,
      selectedFileIds: state.selectedFileIds.filter(id => id !== fileId),
    })),

  deleteMultipleFiles: (fileIds) =>
    set((state) => {
      let newData = state.data;
      fileIds.forEach(fileId => {
        newData = deleteNodeFromTree(newData, fileId);
      });
      return {
        data: newData,
        selectedFileIds: state.selectedFileIds.filter(id => !fileIds.includes(id)),
        selectedFileId: fileIds.includes(state.selectedFileId) ? null : state.selectedFileId,
      };
    }),

  moveFile: (fileId, targetFolderId) =>
    set((state) => ({
      data: moveNodeInTree(state.data, fileId, targetFolderId),
    })),

  moveMultipleFiles: (fileIds, targetFolderId) =>
    set((state) => {
      let newData = state.data;
      fileIds.forEach(fileId => {
        newData = moveNodeInTree(newData, fileId, targetFolderId);
      });
      return {
        data: newData,
        clipboard: { items: [], operation: null },
        selectedFileIds: [],
        draggedItems: [],
      };
    }),

  copyMultipleFiles: (fileIds, targetFolderId) =>
    set((state) => {
      let newData = state.data;
      fileIds.forEach(fileId => {
        const nodeToCopy = findNodeById(state.data, fileId);
        if (nodeToCopy) {
          const duplicatedNode = duplicateNode(nodeToCopy);
          newData = addNodeToTree(newData, duplicatedNode, targetFolderId);
        }
      });
      return {
        data: newData,
        clipboard: { items: [], operation: null },
        selectedFileIds: [],
      };
    }),

  addFile: (file, parentFolderId = null) =>
    set((state) => ({
      data: addNodeToTree(state.data, file, parentFolderId || state.currentFolderId),
    })),

  addFolder: (folderName, parentFolderId = null) =>
    set((state) => {
      const parent = parentFolderId || state.currentFolderId;
      const newFolder = {
        id: `folder-${Date.now()}`,
        name: folderName,
        type: 'folder',
        children: [],
        date: new Date(),
      };
      return {
        data: addNodeToTree(state.data, newFolder, parent),
      };
    }),

  searchFiles: () => {
    const { data, searchQuery } = get();
    if (!searchQuery.trim()) return [];
    return searchInTree(data, searchQuery.toLowerCase());
  },

  resetStore: () => set({
    data: mockFileTree,
    currentFolderId: 'root',
    selectedFileId: null,
    selectedFileIds: [],
    viewType: 'grid',
    searchQuery: '',
    loading: false,
    error: null,
    showGraphView: false,
    sortBy: 'name',
    clipboard: { items: [], operation: null },
  }),
}));

// Utility functions
function findNodeById(tree, id) {
  if (tree.id === id) return tree;
  if (tree.children) {
    for (const child of tree.children) {
      const result = findNodeById(child, id);
      if (result) return result;
    }
  }
  return null;
}

function renameNodeInTree(tree, id, newName) {
  if (tree.id === id) {
    return { ...tree, name: newName };
  }
  if (tree.children) {
    return {
      ...tree,
      children: tree.children.map((child) => renameNodeInTree(child, id, newName)),
    };
  }
  return tree;
}

function deleteNodeFromTree(tree, id) {
  if (tree.children) {
    return {
      ...tree,
      children: tree.children
        .filter((child) => child.id !== id)
        .map((child) => deleteNodeFromTree(child, id)),
    };
  }
  return tree;
}

function moveNodeInTree(tree, nodeId, targetFolderId) {
  // Don't move to the same location
  const nodeParent = findNodeParent(tree, nodeId);
  if (nodeParent && nodeParent.id === targetFolderId) {
    return tree; // Same location, no move needed
  }

  // Don't move a node into itself
  if (nodeId === targetFolderId) {
    return tree;
  }

  // Don't move a node into its own children (would lose the node)
  const targetNode = findNodeById(tree, targetFolderId);
  if (targetNode && isNodeDescendant(targetNode, nodeId)) {
    return tree;
  }

  // First, find and remove the node
  let nodeToMove = null;
  const treeWithoutNode = deleteNodeFromTree(tree, nodeId);

  // Find the node we deleted
  const findNodeForMove = (node, id) => {
    if (node.id === id) return node;
    if (node.children) {
      for (const child of node.children) {
        const result = findNodeForMove(child, id);
        if (result) return result;
      }
    }
    return null;
  };

  nodeToMove = findNodeForMove(tree, nodeId);
  if (!nodeToMove) return tree;

  // Add the node to the target folder
  return addNodeToTree(treeWithoutNode, nodeToMove, targetFolderId);
}

function findNodeParent(tree, nodeId, parent = null) {
  if (tree.id === nodeId) return parent;
  if (tree.children) {
    for (const child of tree.children) {
      const result = findNodeParent(child, nodeId, tree);
      if (result) return result;
    }
  }
  return null;
}

function isNodeDescendant(node, targetId) {
  if (!node.children) return false;
  for (const child of node.children) {
    if (child.id === targetId) return true;
    if (isNodeDescendant(child, targetId)) return true;
  }
  return false;
}

function addNodeToTree(tree, node, parentFolderId) {
  if (tree.id === parentFolderId) {
    if (!tree.children) tree.children = [];
    return {
      ...tree,
      children: [...tree.children, node],
    };
  }

  if (tree.children) {
    return {
      ...tree,
      children: tree.children.map((child) => addNodeToTree(child, node, parentFolderId)),
    };
  }

  return tree;
}

function searchInTree(tree, query, results = []) {
  if (tree.name.toLowerCase().includes(query)) {
    results.push(tree);
  }

  if (tree.children) {
    tree.children.forEach((child) => searchInTree(child, query, results));
  }

  return results;
}

function duplicateNode(node) {
  const timestamp = Date.now();
  const newNode = {
    ...node,
    id: `${node.type}-${timestamp}`,
    name: `${node.name} (copy)`,
    date: new Date(),
  };

  // Recursively duplicate children if folder
  if (node.children && node.children.length > 0) {
    newNode.children = node.children.map((child) => duplicateNode(child));
  }

  return newNode;
}

export default useFileStore;
