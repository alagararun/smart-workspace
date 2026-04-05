import React, { useCallback, useMemo, useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import useFileStore from '../store/fileStore';
import { debounce } from '../utils/fileOperations';

function getFileIcon(node) {
  if (node.type === 'folder') return <FolderIcon sx={{ fontSize: 32 }} />;
  if (node.fileType === 'image') return <ImageIcon sx={{ fontSize: 32 }} />;
  if (node.fileType === 'video') return <VideoLibraryIcon sx={{ fontSize: 32 }} />;
  if (node.fileType === 'pdf') return <PictureAsPdfIcon sx={{ fontSize: 32 }} />;
  return <InsertDriveFileIcon sx={{ fontSize: 32 }} />;
}

function SearchResults({ open, onClose, results, onSelectFile }) {
  const { setCurrentFolder, setSelectedFile } = useFileStore();

  const handleSelectResult = useCallback(
    (node) => {
      if (node.type === 'folder') {
        setCurrentFolder(node.id);
      } else {
        setSelectedFile(node.id);
      }
      onClose();
    },
    [setCurrentFolder, setSelectedFile, onClose]
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Search Results</DialogTitle>
      <DialogContent>
        {results.length === 0 ? (
          <Typography color="textSecondary" sx={{ py: 2 }}>
            No results found
          </Typography>
        ) : (
          <List>
            {results.map((node) => (
              <ListItem key={node.id} disablePadding>
                <ListItemButton onClick={() => handleSelectResult(node)}>
                  <ListItemIcon>{getFileIcon(node)}</ListItemIcon>
                  <ListItemText
                    primary={node.name}
                    secondary={node.type === 'folder' ? 'Folder' : node.fileType || 'File'}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function SearchBar() {
  const { searchQuery, setSearchQuery, searchFiles } = useFileStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [results, setResults] = useState([]);

  const handleSearch = useCallback(
    debounce((query) => {
      if (query.trim()) {
        const searchResults = searchFiles();
        setResults(searchResults);
        setSearchOpen(true);
      }
    }, 300),
    [searchFiles]
  );

  const handleSearchChange = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchQuery(value);
      handleSearch(value);
    },
    [setSearchQuery, handleSearch]
  );

  return (
    <Box sx={{ mb: 2 }}>
      <Box
        component="input"
        type="text"
        placeholder="Search files..."
        value={searchQuery}
        onChange={handleSearchChange}
        sx={{
          width: '100%',
          p: { xs: 1, sm: 1.5 },
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          fontSize: { xs: '0.9rem', sm: '1rem' },
          '&:focus': {
            outline: 'none',
            borderColor: 'primary.main',
            boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.light}33`,
          },
        }}
      />
      <SearchResults open={searchOpen} onClose={() => setSearchOpen(false)} results={results} />
    </Box>
  );
}

export default SearchBar;
