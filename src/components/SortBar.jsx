import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import useFileStore from '../store/fileStore';

function SortBar() {
  const { sortBy, setSortBy } = useFileStore();

  return (
    <Box sx={{ 
      display: 'flex', 
      gap: { xs: 1, sm: 2 },
      ml: { xs: 0, sm: 'auto' },
      width: { xs: '100%', sm: 'auto' },
      alignItems: 'center'
    }}>
      <FormControl size="small" sx={{ minWidth: { xs: 120, sm: 150 }, flex: { xs: 1, sm: 'initial' } }}>
        <InputLabel>Sort By</InputLabel>
        <Select
          value={sortBy || 'name'}
          label="Sort By"
          onChange={(e) => setSortBy(e.target.value)}
        >
          <MenuItem value="name">Name (A-Z)</MenuItem>
          <MenuItem value="size">Size (Small-Large)</MenuItem>
          <MenuItem value="date">Date (Newest)</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}

export default SortBar;
