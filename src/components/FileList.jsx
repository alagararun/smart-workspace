import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import useFileStore from '../store/fileStore';
import ContextMenu from './ContextMenu';
import { formatFileSize, formatDate } from '../utils/fileOperations';
import { mockApi } from '../utils/fileOperations';

function getFileIcon(node) {
  if (node.type === 'folder') return <FolderIcon sx={{ fontSize: 40 }} />;
  if (node.fileType === 'image') return <ImageIcon sx={{ fontSize: 40 }} />;
  if (node.fileType === 'video') return <VideoLibraryIcon sx={{ fontSize: 40 }} />;
  if (node.fileType === 'pdf') return <PictureAsPdfIcon sx={{ fontSize: 40 }} />;
  return <InsertDriveFileIcon sx={{ fontSize: 40 }} />;
}

function FileList({ currentFolder, onDoubleClickItem }) {
  const { 
    viewType, 
    selectedFileId, 
    selectedFileIds,
    setCurrentFolder, 
    setSelectedFile,
    setSelectedFileIds,
    addToSelection,
    clearSelection,
    addFile, 
    setLoading, 
    setError, 
    sortBy,
    moveMultipleFiles,
    copyMultipleFiles,
    deleteMultipleFiles,
    setClipboard,
    clearClipboard,
    clipboard,
    draggedItems,
    setDraggedItems,
  } = useFileStore();

  const [contextMenu, setContextMenu] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [fileInput, setFileInput] = useState(null);
  const [lastClickedNode, setLastClickedNode] = useState(null);
  const [lastClickTime, setLastClickTime] = useState(0);

  const children = useMemo(() => {
    const items = currentFolder?.children || [];
    
    // Sort items
    const sorted = [...items].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'size') {
        const sizeA = a.size || 0;
        const sizeB = b.size || 0;
        return sizeA - sizeB;
      } else if (sortBy === 'date') {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        return dateB - dateA; // Newest first
      }
      return 0;
    });
    
    return sorted;
  }, [currentFolder, sortBy]);

  const handleContextMenu = useCallback(
    (event, node) => {
      event.preventDefault();
      setSelectedNode(node);
      setContextMenu(event.currentTarget);
    },
    []
  );

  const handleContextMenuClose = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleFileClick = useCallback(
    (node, event) => {
      const currentTime = Date.now();
      const isDoubleClick = lastClickedNode?.id === node.id && (currentTime - lastClickTime) < 300;
      
      setLastClickedNode(node);
      setLastClickTime(currentTime);

      if (isDoubleClick) {
        // Double click detected
        handleFileDoubleClick(node);
      } else if (event.ctrlKey || event.metaKey) {
        // Ctrl/Cmd + Click: Toggle selection in multi-select mode
        addToSelection(node.id);
      } else if (event.shiftKey) {
        // Shift + Click: Select range (simplified: just add to selection)
        addToSelection(node.id);
      } else {
        // Single click: Just select this item
        setSelectedFile(node.id);
        setSelectedFileIds([node.id]);
      }
    },
    [setSelectedFile, setSelectedFileIds, addToSelection, lastClickedNode, lastClickTime]
  );

  const handleFileDoubleClick = useCallback(
    (node) => {
      if (node.type === 'folder') {
        // Double click to open/navigate into folder
        setCurrentFolder(node.id);
      } else {
        // Double click to open file preview
        setSelectedFile(node.id);
        if (onDoubleClickItem) {
          onDoubleClickItem();
        }
      }
    },
    [setCurrentFolder, setSelectedFile, onDoubleClickItem]
  );

  // Drag and drop handlers
  const handleDragStart = useCallback(
    (event, node) => {
      // If dragging a non-selected item, select only that item
      let itemsToMove = selectedFileIds;
      if (!selectedFileIds.includes(node.id)) {
        itemsToMove = [node.id];
        setSelectedFileIds([node.id]);
      }
      setDraggedItems(itemsToMove);
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', itemsToMove.join(','));
    },
    [selectedFileIds, setSelectedFileIds]
  );

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedItems([]);
  }, [setDraggedItems]);

  const handleDrop = useCallback(
    (event, targetNode) => {
      event.preventDefault();
      if (targetNode.type === 'folder' && draggedItems.length > 0) {
        moveMultipleFiles(draggedItems, targetNode.id);
        setDraggedItems([]);
      }
    },
    [draggedItems, moveMultipleFiles]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl/Cmd + A: Select all items in current folder
      if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        event.preventDefault();
        const allIds = children.map(child => child.id);
        setSelectedFileIds(allIds);
      }
      // Ctrl/Cmd + C: Copy selected items
      else if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
        event.preventDefault();
        if (selectedFileIds.length > 0) {
          setClipboard(selectedFileIds, 'copy');
        }
      }
      // Ctrl/Cmd + X: Cut selected items
      else if ((event.ctrlKey || event.metaKey) && event.key === 'x') {
        event.preventDefault();
        if (selectedFileIds.length > 0) {
          setClipboard(selectedFileIds, 'cut');
        }
      }
      // Ctrl/Cmd + V: Paste items
      else if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        event.preventDefault();
        if (clipboard.items.length > 0 && clipboard.operation === 'cut') {
          moveMultipleFiles(clipboard.items, currentFolder.id);
          clearClipboard();
        } else if (clipboard.items.length > 0 && clipboard.operation === 'copy') {
          // Copy: Duplicate files
          copyMultipleFiles(clipboard.items, currentFolder.id);
        }
      }
      // Delete: Delete selected items
      else if (event.key === 'Delete') {
        event.preventDefault();
        if (selectedFileIds.length > 0) {
          deleteMultipleFiles(selectedFileIds);
          setSelectedFileIds([]);
        }
      }
      // Escape: Clear selection
      else if (event.key === 'Escape') {
        setSelectedFileIds([]);
      }
      // Arrow Up: Navigate up and select
      else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (children.length === 0) return;
        
        if (selectedFileIds.length === 0) {
          // Select last item if nothing selected
          setSelectedFileIds([children[children.length - 1].id]);
        } else {
          const lastSelectedId = selectedFileIds[selectedFileIds.length - 1];
          const lastIndex = children.findIndex(child => child.id === lastSelectedId);
          if (lastIndex > 0) {
            if (event.shiftKey) {
              // Shift + Arrow Up: Range select up
              const previousId = children[lastIndex - 1].id;
              if (!selectedFileIds.includes(previousId)) {
                setSelectedFileIds([...selectedFileIds, previousId]);
              }
            } else {
              // Arrow Up: Move selection up
              setSelectedFileIds([children[lastIndex - 1].id]);
            }
          }
        }
      }
      // Arrow Down: Navigate down and select
      else if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (children.length === 0) return;
        
        if (selectedFileIds.length === 0) {
          // Select first item if nothing selected
          setSelectedFileIds([children[0].id]);
        } else {
          const lastSelectedId = selectedFileIds[selectedFileIds.length - 1];
          const lastIndex = children.findIndex(child => child.id === lastSelectedId);
          if (lastIndex < children.length - 1) {
            if (event.shiftKey) {
              // Shift + Arrow Down: Range select down
              const nextId = children[lastIndex + 1].id;
              if (!selectedFileIds.includes(nextId)) {
                setSelectedFileIds([...selectedFileIds, nextId]);
              }
            } else {
              // Arrow Down: Move selection down
              setSelectedFileIds([children[lastIndex + 1].id]);
            }
          }
        }
      }
      // Arrow Left: Navigate left and select (previous item)
      else if (!event.shiftKey && event.key === 'ArrowLeft') {
        event.preventDefault();
        if (children.length === 0) return;
        
        if (selectedFileIds.length === 0) {
          // Select last item if nothing selected
          setSelectedFileIds([children[children.length - 1].id]);
        } else {
          const lastSelectedId = selectedFileIds[selectedFileIds.length - 1];
          const lastIndex = children.findIndex(child => child.id === lastSelectedId);
          if (lastIndex > 0) {
            // Arrow Left: Move selection left (previous item)
            setSelectedFileIds([children[lastIndex - 1].id]);
          } else if (lastIndex === 0) {
            // Wrap to end when at first item
            setSelectedFileIds([children[children.length - 1].id]);
          }
        }
      }
      // Arrow Right: Navigate right and select (next item)
      else if (!event.shiftKey && event.key === 'ArrowRight') {
        event.preventDefault();
        if (children.length === 0) return;
        
        if (selectedFileIds.length === 0) {
          // Select first item if nothing selected
          setSelectedFileIds([children[0].id]);
        } else {
          const lastSelectedId = selectedFileIds[selectedFileIds.length - 1];
          const lastIndex = children.findIndex(child => child.id === lastSelectedId);
          if (lastIndex < children.length - 1) {
            // Arrow Right: Move selection right (next item)
            setSelectedFileIds([children[lastIndex + 1].id]);
          } else if (lastIndex === children.length - 1) {
            // Wrap to start when at last item
            setSelectedFileIds([children[0].id]);
          }
        }
      }
      // Enter: Open selected folder or file
      else if (event.key === 'Enter') {
        event.preventDefault();
        if (selectedFileIds.length > 0) {
          const selectedId = selectedFileIds[0];
          const selectedNode = children.find(child => child.id === selectedId);
          
          if (selectedNode) {
            if (selectedNode.type === 'folder') {
              // Navigate into the folder
              setCurrentFolder(selectedId);
            } else {
              // Open file preview
              onDoubleClickItem(selectedNode);
            }
          }
        }
      }
      // Shift + Arrow Left: Range select left (previous item)
      else if (event.shiftKey && event.key === 'ArrowLeft') {
        event.preventDefault();
        if (children.length === 0) return;
        
        if (selectedFileIds.length === 0) {
          // Select last item if nothing selected
          setSelectedFileIds([children[children.length - 1].id]);
        } else {
          const lastSelectedId = selectedFileIds[selectedFileIds.length - 1];
          const lastIndex = children.findIndex(child => child.id === lastSelectedId);
          if (lastIndex > 0) {
            const previousId = children[lastIndex - 1].id;
            if (!selectedFileIds.includes(previousId)) {
              setSelectedFileIds([...selectedFileIds, previousId]);
            }
          }
        }
      }
      // Shift + Arrow Right: Range select right (next item)
      else if (event.shiftKey && event.key === 'ArrowRight') {
        event.preventDefault();
        if (children.length === 0) return;
        
        if (selectedFileIds.length === 0) {
          // Select first item if nothing selected
          setSelectedFileIds([children[0].id]);
        } else {
          const lastSelectedId = selectedFileIds[selectedFileIds.length - 1];
          const lastIndex = children.findIndex(child => child.id === lastSelectedId);
          if (lastIndex < children.length - 1) {
            const nextId = children[lastIndex + 1].id;
            if (!selectedFileIds.includes(nextId)) {
              setSelectedFileIds([...selectedFileIds, nextId]);
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFileIds, children, clipboard, currentFolder, setSelectedFileIds, setClipboard, clearClipboard, moveMultipleFiles, deleteMultipleFiles, setError, setCurrentFolder, onDoubleClickItem]);

  const handleUploadClick = () => {
    setUploadDialogOpen(true);
  };

  const handleFileInputChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const response = await mockApi.uploadFile(file, currentFolder.id);
      if (response.success) {
        addFile(response.data);
        setUploadDialogOpen(false);
      }
    } catch (err) {
      setError('Upload failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentFolder) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Folder not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ 
        mb: 2, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 1
      }}>
        <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          {currentFolder.name} ({children.length} items)
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleUploadClick}
          fullWidth={{ xs: true, sm: false }}
          size="small"
          sx={{ fontSize: { xs: '0.9rem', sm: '0.875rem' } }}
        >
          Upload File
        </Button>
      </Box>

      {children.length === 0 ? (
        <Alert severity="info">This folder is empty</Alert>
      ) : viewType === 'grid' ? (
        <Grid 
          container 
          spacing={{ xs: 1, sm: 2 }}
          onClick={(e) => {
            // Deselect if clicking on empty space in the grid (not on grid items)
            if (e.target === e.currentTarget) {
              setSelectedFileIds([]);
              setSelectedFile(null);
            }
          }}
        >
          {children.map((node) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={node.id}>
              <Card
                onClick={(e) => e.stopPropagation()}
                onContextMenu={(e) => handleContextMenu(e, node)}
                onDragStart={(e) => handleDragStart(e, node)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, node)}
                draggable={node.type === 'file' || node.type === 'folder'}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: selectedFileIds.includes(node.id) ? 'primary.light' : (selectedFileId === node.id ? 'action.selected' : 'background.paper'),
                  '&:hover': { boxShadow: 3 },
                  opacity: draggedItems.includes(node.id) ? 0.6 : 1,
                }}
              >
                <CardActionArea onClick={(e) => handleFileClick(node, e)} onDoubleClick={() => handleFileDoubleClick(node)}>
                  <CardContent sx={{ textAlign: 'center', pb: 1, px: { xs: 1, sm: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                      {getFileIcon(node)}
                    </Box>
                    <Typography variant="subtitle2" noWrap title={node.name}>
                      {node.name}
                    </Typography>
                    {node.size && (
                      <Typography variant="caption" color="textSecondary">
                        {formatFileSize(node.size)}
                      </Typography>
                    )}
                    {node.date && (
                      <Typography variant="caption" color="textSecondary" display="block">
                        {formatDate(node.date)}
                      </Typography>
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <List
          onClick={(e) => {
            // Deselect if clicking on empty space in the list (not on list items)
            if (e.target === e.currentTarget) {
              setSelectedFileIds([]);
              setSelectedFile(null);
            }
          }}
        >
          {children.map((node) => (
            <ListItem
              key={node.id}
              onClick={(e) => e.stopPropagation()}
              onContextMenu={(e) => handleContextMenu(e, node)}
              onDragStart={(e) => handleDragStart(e, node)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, node)}
              draggable
              selected={selectedFileIds.includes(node.id) || selectedFileId === node.id}
              sx={{
                backgroundColor: selectedFileIds.includes(node.id) ? 'primary.light' : (selectedFileId === node.id ? 'action.selected' : 'transparent'),
                '&:hover': { backgroundColor: 'action.hover' },
                opacity: draggedItems.includes(node.id) ? 0.6 : 1,
              }}
            >
              <ListItemButton onClick={(e) => handleFileClick(node, e)} onDoubleClick={() => handleFileDoubleClick(node)}>
                <ListItemIcon>{getFileIcon(node)}</ListItemIcon>
                <ListItemText
                  primary={node.name}
                  secondary={
                    <>
                      {node.size && <span>{formatFileSize(node.size)}</span>}
                      {node.size && node.date && <span> • </span>}
                      {node.date && <span>{formatDate(node.date)}</span>}
                    </>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}

      <ContextMenu anchorEl={contextMenu} open={!!contextMenu} onClose={handleContextMenuClose} node={selectedNode} />

      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)}>
        <DialogTitle>Upload File</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <input
            ref={setFileInput}
            type="file"
            onChange={handleFileInputChange}
            style={{ display: 'block', marginTop: 16 }}
          />
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2 }}>
            Uploaded files will be temporary and won't persist after reload.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default FileList;
