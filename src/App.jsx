import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  MoreVert as MoreVertIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import useFileStore from './store/fileStore';
import FolderTree from './components/FolderTree';
import FileList from './components/FileList';
import BreadcrumbNav from './components/BreadcrumbNav';
import FilePreview from './components/FilePreview';
import SearchBar from './components/SearchBar';
import GraphView from './components/GraphView';
import { downloadJSON, getFolderStats } from './utils/fileOperations';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    secondary: { main: '#f48fb1' },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
});

function App() {
  const {
    data,
    currentFolderId,
    selectedFileId,
    viewType,
    setViewType,
    loading,
    error,
    setError,
    getCurrentFolder,
    getSelectedFile,
    setSelectedFile,
    clearSelection,
  } = useFileStore();

  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [graphModalOpen, setGraphModalOpen] = useState(false);

  // Handle window resize to update sidebar state
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      setSidebarOpen(!isMobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when navigating folders on mobile
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  }, [currentFolderId]);

  const theme = darkMode ? darkTheme : lightTheme;
  const currentFolder = getCurrentFolder();
  const selectedFile = getSelectedFile();

  const handleExportJSON = useCallback(() => {
    downloadJSON(currentFolder || data, `${currentFolder?.name || 'files'}.json`);
    setMoreMenuAnchor(null);
  }, [currentFolder, data]);

  const handleShowStats = useCallback(() => {
    setStatsDialogOpen(true);
    setMoreMenuAnchor(null);
  }, []);

  const stats = useMemo(() => {
    if (currentFolder) {
      return getFolderStats(currentFolder);
    }
    return { fileCount: 0, folderCount: 0, totalSize: 0 };
  }, [currentFolder]);

  // Handler for opening preview on double-click
  const handleOpenPreview = useCallback((file = null) => {
    if (file) {
      setPreviewFile(file);
      setSelectedFile(file.id);
    }
    setPreviewOpen(true);
  }, [setSelectedFile]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
        {/* Top AppBar */}
        <AppBar position="sticky" elevation={2}>
          <Toolbar sx={{ gap: 1, minHeight: { xs: 56, sm: 64 } }}>
            <IconButton
              size="small"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              sx={{ display: { xs: 'flex', md: 'none' }, color: 'inherit' }}
            >
              {sidebarOpen ? '✕' : '☰'}
            </IconButton>

            <Typography 
              variant="h6" 
              sx={{ 
                flexGrow: 1, 
                fontWeight: 700,
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                color: 'inherit'
              }}
            >
              📁 File Explorer
            </Typography>

            <Tooltip title="Toggle View">
              <IconButton
                size="small"
                onClick={() => setViewType(viewType === 'grid' ? 'list' : 'grid')}
                sx={{ color: 'inherit' }}
              >
                {viewType === 'grid' ? <ViewListIcon /> : <GridViewIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Open Graph View">
              <IconButton
                size="small"
                onClick={() => setGraphModalOpen(true)}
                sx={{ display: { xs: 'none', sm: 'flex' }, color: 'inherit' }}
              >
                <BarChartIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Toggle Theme">
              <IconButton 
                size="small" 
                onClick={() => setDarkMode(!darkMode)}
                sx={{ display: { xs: 'none', sm: 'flex' }, color: 'inherit' }}
              >
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            <IconButton
              size="small"
              onClick={(e) => setMoreMenuAnchor(e.currentTarget)}
              sx={{ color: 'inherit' }}
            >
              <MoreVertIcon />
            </IconButton>

            <Menu
              anchorEl={moreMenuAnchor}
              open={!!moreMenuAnchor}
              onClose={() => setMoreMenuAnchor(null)}
            >
              <MenuItem 
                onClick={() => {
                  setGraphModalOpen(true);
                  setMoreMenuAnchor(null);
                }}
                sx={{ display: { xs: 'flex', sm: 'none' } }}
              >
                <BarChartIcon fontSize="small" sx={{ mr: 1, color: 'inherit' }} />
                Graph View
              </MenuItem>
              <MenuItem 
                onClick={() => {
                  setDarkMode(!darkMode);
                  setMoreMenuAnchor(null);
                }}
                sx={{ display: { xs: 'flex', sm: 'none' } }}
              >
                {darkMode ? (
                  <LightModeIcon fontSize="small" sx={{ mr: 1, color: 'inherit' }} />
                ) : (
                  <DarkModeIcon fontSize="small" sx={{ mr: 1, color: 'inherit' }} />
                )}
                Toggle Theme
              </MenuItem>
              <MenuItem 
                onClick={handleExportJSON}
                sx={{ color: 'inherit' }}
              >
                <DownloadIcon fontSize="small" sx={{ mr: 1, color: 'inherit' }} />
                Export JSON
              </MenuItem>
              <MenuItem 
                onClick={handleShowStats}
                sx={{ color: 'inherit' }}
              >
                <InfoIcon fontSize="small" sx={{ mr: 1, color: 'inherit' }} />
                Folder Stats
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Main Content Area */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
          {/* Sidebar - Desktop */}
          <Box
            sx={{
              width: { xs: 0, md: sidebarOpen ? 280 : 0 },
              minHeight: 0,
              flexShrink: 0,
              transition: 'width 0.3s',
              borderRight: 2,
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Folders
              </Typography>
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto', px: 2, pb: 2 }}>
              <FolderTree />
            </Box>
          </Box>

          {/* Sidebar - Mobile Drawer */}
          <Drawer
            anchor="left"
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            sx={{ display: { xs: 'flex', md: 'none' } }}
          >
            <Box sx={{ width: 280, display: 'flex', flexDirection: 'column', h: '100%' }}>
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Folders
                </Typography>
              </Box>
              <Box sx={{ flex: 1, overflow: 'auto', px: 2, pb: 2 }}>
                <FolderTree />
              </Box>
            </Box>
          </Drawer>

          {/* Main Content */}
          <Box 
            sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}
            onClick={(e) => {
              // Deselect on click if not clicking on Paper or its contents
              if (e.target !== e.currentTarget && !e.currentTarget.querySelector('div[role="presentation"]')?.contains(e.target)) {
                clearSelection();
              }
            }}
          >
            <Box sx={{ p: 3, backgroundColor: 'background.default', flex: 1, overflowY: 'auto' }}>
              {error && (
                <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <BreadcrumbNav />
              <SearchBar onOpenPreview={handleOpenPreview} />

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: { xs: 1, sm: 2 },
                    backgroundColor: 'background.paper',
                    borderRadius: { xs: 1, sm: 2 }
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <FileList currentFolder={currentFolder} onDoubleClickItem={handleOpenPreview} />
                </Paper>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Graph View Modal */}
      <Dialog 
        open={graphModalOpen} 
        onClose={() => setGraphModalOpen(false)} 
        maxWidth="lg" 
        fullWidth
        sx={{ '& .MuiDialog-paper': { height: '90vh', display: 'flex', flexDirection: 'column' } }}
      >
        {/* <DialogTitle sx={{ pb: 1 }}>
          📊 Graph View - Folder Hierarchy
        </DialogTitle> */}
        <DialogContent sx={{ p: 0, overflow: 'visible' }}>
          <GraphView data={data} />
        </DialogContent>
        <DialogActions sx={{ pt: 1 }}>
          <Button onClick={() => setGraphModalOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stats Dialog */}
      <Dialog open={statsDialogOpen} onClose={() => setStatsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Folder Statistics</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography color="textSecondary" variant="body2">
                Total Files
              </Typography>
              <Typography variant="h6">{stats.fileCount}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography color="textSecondary" variant="body2">
                Subfolders
              </Typography>
              <Typography variant="h6">{stats.folderCount}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography color="textSecondary" variant="body2">
                Total Size
              </Typography>
              <Typography variant="h6">
                {Math.round(stats.totalSize / 1024 / 1024 * 100) / 100} MB
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography color="textSecondary" variant="body2">
                Current Folder
              </Typography>
              <Typography variant="body2">{currentFolder?.name}</Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog 
        open={previewOpen} 
        onClose={() => {
          setPreviewOpen(false);
          setPreviewFile(null);
        }} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle>
          📋 {(previewFile || selectedFile)?.name || 'Preview'}
        </DialogTitle>
        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
          <FilePreview file={previewFile || selectedFile} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setPreviewOpen(false);
            setPreviewFile(null);
          }} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

export default App;
