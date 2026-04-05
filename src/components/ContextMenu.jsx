import React, { useState, useCallback } from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import useFileStore from '../store/fileStore';
import { mockApi } from '../utils/fileOperations';

function ContextMenu({ anchorEl, open, onClose, node }) {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newName, setNewName] = useState(node?.name || '');
  const { renameFile, deleteFile } = useFileStore();

  const handleRename = useCallback(async () => {
    try {
      await mockApi.renameFile(node.id, newName);
      renameFile(node.id, newName);
      setRenameDialogOpen(false);
      onClose();
    } catch (error) {
      console.error('Rename failed:', error);
    }
  }, [node, newName, renameFile, onClose]);

  const handleDelete = useCallback(async () => {
    try {
      await mockApi.deleteFile(node.id);
      deleteFile(node.id);
      onClose();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  }, [node, deleteFile, onClose]);

  const handleDownload = useCallback(() => {
    if (node?.url && node.type === 'file') {
      const a = document.createElement('a');
      a.href = node.url;
      a.download = node.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    onClose();
  }, [node, onClose]);

  return (
    <>
      <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
        <MenuItem
          onClick={() => {
            setNewName(node?.name || '');
            setRenameDialogOpen(true);
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>

        {node?.type === 'file' && (
          <MenuItem onClick={handleDownload}>
            <ListItemIcon>
              <FileCopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Download</ListItemText>
          </MenuItem>
        )}

        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Rename Item</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            fullWidth
            label="New Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRename} variant="contained">
            Rename
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ContextMenu;
