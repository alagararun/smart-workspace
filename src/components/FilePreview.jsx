import React from 'react';
import {
  Box,
  Card,
  CardMedia,
  Typography,
  Button,
  Alert,
  Grid,
  Stack,
  Chip,
  Paper,
  Dialog,
  IconButton,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { formatFileSize, formatDate } from '../utils/fileOperations';

// Helper function to get public file URL
function getPublicFileUrl(fileName) {
  // Use the same origin and port as the app
  return `${window.location.origin}/${fileName}`;
}

// Helper function to download file from URL
function downloadFile(url, fileName) {
  // Create an anchor element and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function FilePreview({ file }) {
  const [fullscreenImage, setFullscreenImage] = React.useState(false);
  
  if (!file) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 300,
          color: 'text.secondary',
        }}
      >
        <InsertDriveFileIcon sx={{ fontSize: 60, mb: 2, opacity: 0.3 }} />
        <Typography variant="h6">Select a file to preview</Typography>
      </Box>
    );
  }

  if (file.type === 'folder') {
    return (
      <Box sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <FolderIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h6">{file.name}</Typography>
            <Typography variant="caption" color="textSecondary">
              Folder
            </Typography>
          </Box>
        </Stack>

        <Paper elevation={0} sx={{ p: 2, backgroundColor: 'background.default', borderRadius: 2, mb: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Box sx={{ p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
                <Typography color="textSecondary" variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  📊 Items
                </Typography>
                <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 700 }}>
                  {file.children?.length || 0}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
                <Typography color="textSecondary" variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  📅 Created
                </Typography>
                <Typography variant="body2">{formatDate(file.date || new Date())}</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <InsertDriveFileIcon sx={{ fontSize: 40, color: 'info.main' }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6">{file.name}</Typography>
          <Chip
            label={file.fileType?.toUpperCase() || 'FILE'}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ mt: 0.5 }}
          />
        </Box>
      </Stack>

      {file.fileType === 'image' && file.url && (
        <>
          <Card
            sx={{
              mb: 3,
              maxWidth: '100%',
              boxShadow: 3,
              borderRadius: 2,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <Box
              component="img"
              src={file.url}
              alt={file.name}
              sx={{
                width: '100%',
                height: 'auto',
                display: 'block',
                maxHeight: '500px',
                objectFit: 'contain',
              }}
            />
            <IconButton
              onClick={() => setFullscreenImage(true)}
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                },
              }}
              size="small"
            >
              <FullscreenIcon />
            </IconButton>
          </Card>

          {/* Fullscreen Dialog */}
          <Dialog
            open={fullscreenImage}
            onClose={() => setFullscreenImage(false)}
            maxWidth="lg"
            fullWidth
            sx={{
              '& .MuiDialog-paper': {
                backgroundColor: '#000000',
                backgroundImage: 'linear-gradient(135deg, #1a1a1a 0%, #000000 50%, #1a1a1a 100%)',
              },
            }}
          >
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '80vh',
                p: 3,
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
              }}
            >
              <Box
                sx={{
                  border: '3px solid #333333',
                  borderRadius: 2,
                  p: 2,
                  backgroundColor: '#ffffff',
                  boxShadow: '0 0 60px rgba(255, 255, 255, 0.1)',
                }}
              >
                <Box
                  component="img"
                  src={file.url}
                  alt={file.name}
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '75vh',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </Box>
              <IconButton
                onClick={() => setFullscreenImage(false)}
                sx={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  },
                  fontSize: '2rem',
                }}
              >
                <FullscreenExitIcon />
              </IconButton>
            </Box>
          </Dialog>
        </>
      )}

      {file.fileType === 'video' && file.url && (
        <Card
          sx={{
            mb: 3,
            boxShadow: 3,
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Box component="video" controls sx={{ width: '100%', maxHeight: 400 }} src={file.url} />
        </Card>
      )}

      {file.fileType === 'pdf' && file.url && (
        <Card
          sx={{
            mb: 3,
            boxShadow: 3,
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Box
            component="iframe"
            src={file.url}
            sx={{ width: '100%', height: 400, border: 'none' }}
          />
        </Card>
      )}

      {file.fileType === 'other' && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          Preview not available for this file type
        </Alert>
      )}

      <Paper elevation={0} sx={{ p: 2.5, backgroundColor: 'background.default', borderRadius: 2, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 0.5 }}>
          📋 Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Box>
              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                Type
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {file.fileType?.charAt(0).toUpperCase() + file.fileType?.slice(1) || 'Unknown'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box>
              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                Size
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {formatFileSize(file.size || 0)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box>
              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                Modified
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {formatDate(file.date || new Date())}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box>
              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                ID
              </Typography>
              <Typography variant="caption" sx={{ mt: 0.5, wordBreak: 'break-all' }}>
                {file.id}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {file.type === 'file' && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
            📥 Download
          </Typography>
          
          {file.url && file.url !== '#' ? (
            <Button
              fullWidth
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => downloadFile(getPublicFileUrl(file.name), file.name)}
              sx={{ py: 1.2, fontSize: '1rem', fontWeight: 600, borderRadius: 1 }}
            >
              Download: {file.name}
            </Button>
          ) : (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              No download link available for this file
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
}

export default FilePreview;
