import React, { useState } from 'react';
import {
  Box,
  Typography,
  Collapse,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import AddIcon from '@mui/icons-material/Add';
import useFileStore from '../store/fileStore';
import ContextMenu from './ContextMenu';

function FolderTree() {
  const { data, currentFolderId, setCurrentFolder, addFolder, moveMultipleFiles } = useFileStore();
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [expanded, setExpanded] = useState(new Set(['root']));
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [dragOverNode, setDragOverNode] = useState(null);

  const handleContextMenu = (event, node) => {
    event.preventDefault();
    setSelectedNode(node);
    setContextMenu(event.currentTarget);
  };

  const toggleExpanded = (nodeId) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpanded(newExpanded);
  };

  const handleDragOver = (e, nodeId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverNode(nodeId);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setDragOverNode(null);
    }
  };

  const handleDrop = (e, targetNodeId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverNode(null);

    // Try to get drag data in the format FileList uses
    let fileIds = [];
    const draggedItemsStr = e.dataTransfer.getData('text/plain');
    
    if (draggedItemsStr) {
      fileIds = draggedItemsStr.split(',').filter((id) => id.trim());
    }

    if (fileIds.length > 0) {
      moveMultipleFiles(fileIds, targetNodeId);
    }
  };

  const renderNode = (node, level = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isFolder = node.type === 'folder';
    const isExpanded = expanded.has(node.id);
    const isDragOver = dragOverNode === node.id && isFolder;

    return (
      <Box key={node.id}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            pl: level * 2,
            py: 0.5,
            backgroundColor: isDragOver
              ? 'primary.light'
              : currentFolderId === node.id
              ? 'action.selected'
              : 'transparent',
            '&:hover': { backgroundColor: 'action.hover' },
            borderRadius: 1,
            cursor: isFolder ? 'pointer' : 'default',
            border: isDragOver ? '2px solid' : 'none',
            borderColor: isDragOver ? 'primary.main' : 'transparent',
          }}
          onClick={() => {
            if (isFolder) {
              // Select/navigate to folder
              setCurrentFolder(node.id);
              // Also toggle expand/collapse
              toggleExpanded(node.id);
            }
          }}
          onContextMenu={(e) => {
            if (isFolder) {
              handleContextMenu(e, node);
            }
          }}
          onDragOver={isFolder ? (e) => handleDragOver(e, node.id) : undefined}
          onDragLeave={isFolder ? handleDragLeave : undefined}
          onDrop={isFolder ? (e) => handleDrop(e, node.id) : undefined}
        >
          {isFolder && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(node.id);
              }}
              sx={{ p: 0, minWidth: 24 }}
            >
              {isExpanded ? (
                <ExpandMoreIcon fontSize="small" />
              ) : (
                <ChevronRightIcon fontSize="small" />
              )}
            </IconButton>
          )}
          {!isFolder && <Box sx={{ width: 24 }} />}

          {isFolder ? (
            <FolderOpenIcon
              fontSize="small"
              sx={{
                color: currentFolderId === node.id ? 'primary.main' : 'inherit',
              }}
            />
          ) : (
            <InsertDriveFileIcon fontSize="small" />
          )}

          <Typography
            variant="body2"
            sx={{
              fontWeight: currentFolderId === node.id ? 600 : 400,
              flex: 1,
            }}
          >
            {node.name}
          </Typography>
        </Box>

        {isFolder && hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box>
              {node.children.map((child) => renderNode(child, level + 1))}
            </Box>
          </Collapse>
        )}
      </Box>
    );
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      addFolder(newFolderName, currentFolderId);
      setNewFolderName('');
      setCreateDialogOpen(false);
    }
  };

  if (!data) {
    return <Typography color="error">No data available</Typography>;
  }

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ pb: 1 }}>
        <Button
          startIcon={<AddIcon />}
          size="small"
          onClick={() => setCreateDialogOpen(true)}
          fullWidth
          variant="outlined"
        >
          New Folder
        </Button>
      </Box>
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {renderNode(data)}
      </Box>

      <ContextMenu
        anchorEl={contextMenu}
        open={!!contextMenu}
        onClose={() => setContextMenu(null)}
        node={selectedNode}
      />

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            variant="outlined"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateFolder();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateFolder} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default FolderTree;
