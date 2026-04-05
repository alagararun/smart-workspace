import React from 'react';
import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import useFileStore from '../store/fileStore';
import { getParentPath } from '../utils/fileOperations';
import SortBar from './SortBar';

function BreadcrumbNav() {
  const { data, currentFolderId, setCurrentFolder, getCurrentFolder } = useFileStore();

  const breadcrumbPath = getParentPath(data, currentFolderId);
  const currentFolder = getCurrentFolder();

  if (!currentFolder) return null;

  // Filter out root from breadcrumbPath since we show "My Files" separately
  const pathWithoutRoot = breadcrumbPath ? breadcrumbPath.filter(f => f.id !== 'root') : [];
  
  // Build the complete path including current folder, excluding root
  const allFolders = [...pathWithoutRoot, currentFolder];

  return (
    <Box sx={{ 
      mb: 2, 
      p: { xs: 1, sm: 1 },
      display: 'flex', 
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: { xs: 'flex-start', sm: 'center' },
      gap: { xs: 1, sm: 2 }
    }}>
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' }, overflow: 'auto' }}
      >
        <Link
          component="button"
          variant="body2"
          onClick={() => setCurrentFolder('root')}
          sx={{ cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          My Files
        </Link>

        {allFolders.map((folder, index) => {
          const isLast = index === allFolders.length - 1;

          if (isLast) {
            return (
              <Typography key={folder.id} variant="body2" color="textPrimary">
                {folder.name}
              </Typography>
            );
          }

          return (
            <Link
              key={folder.id}
              component="button"
              variant="body2"
              onClick={() => setCurrentFolder(folder.id)}
              sx={{ cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              {folder.name}
            </Link>
          );
        })}
      </Breadcrumbs>
      
      <SortBar />
    </Box>
  );
}

export default BreadcrumbNav;
