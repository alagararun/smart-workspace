import React, { useMemo } from 'react';
import { Box, Typography, Card, CardContent, Stack, Chip, Paper } from '@mui/material';
import { buildGraphData } from '../utils/fileOperations';

// Simple D3-less graph visualization using SVG
function GraphView({ data }) {
  const graphData = useMemo(() => buildGraphData(data), [data]);

  // Calculate layout using simple hierarchical positioning
  const layout = useMemo(() => {
    const positions = {};
    const levels = {};

    function calculateLevels(nodeId, level = 0) {
      if (!levels[level]) levels[level] = [];
      levels[level].push(nodeId);

      const node = graphData.nodes.find((n) => n.id === nodeId);
      if (node) {
        const edges = graphData.edges.filter((e) => e.source === nodeId);
        edges.forEach((edge) => calculateLevels(edge.target, level + 1));
      }
    }

    calculateLevels('root');

    // Position nodes
    Object.entries(levels).forEach(([level, nodeIds]) => {
      const levelNum = parseInt(level);
      nodeIds.forEach((nodeId, index) => {
        positions[nodeId] = {
          x: (index + 1) * (800 / (nodeIds.length + 1)),
          y: levelNum * 80 + 40,
        };
      });
    });

    return { positions, edges: graphData.edges, nodes: graphData.nodes };
  }, [graphData]);

  const stats = useMemo(() => {
    const folders = graphData.nodes.filter((n) => n.type === 'folder').length;
    const files = graphData.nodes.filter((n) => n.type === 'file').length;
    return { folders, files, total: graphData.nodes.length };
  }, [graphData]);

  return (
    <Card sx={{ boxShadow: 0, borderRadius: 0, overflow: 'hidden' }}>
      <CardContent sx={{ p: 2, pb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            📊 Folder Hierarchy
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip
              label={`${stats.folders} Folders`}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`${stats.files} Files`}
              size="small"
              color="success"
              variant="outlined"
            />
          </Stack>
        </Stack>

        <Paper
          elevation={0}
          sx={{
            p: 1,
            backgroundColor: 'background.default',
            borderRadius: 1.5,
          }}
        >
          <Box
            component="svg"
            viewBox="0 0 800 500"
            sx={{
              width: '100%',
              height: 'auto',
              maxWidth: '100%',
              border: 2,
              borderColor: 'divider',
              borderRadius: 1,
              backgroundColor: 'background.paper',
              display: 'block',
            }}
          >
            {/* Draw edges */}
            {layout.edges.map((edge, idx) => {
              const from = layout.positions[edge.source];
              const to = layout.positions[edge.target];
              if (!from || !to) return null;

              return (
                <line
                  key={`edge-${idx}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="currentColor"
                  strokeWidth="2.5"
                  opacity={0.2}
                  strokeDasharray="5,5"
                />
              );
            })}

            {/* Draw nodes */}
            {layout.nodes.map((node) => {
              const pos = layout.positions[node.id];
              if (!pos) return null;

              const isFolder = node.type === 'folder';
              const radius = 18;

              return (
                <g key={`node-${node.id}`}>
                  {/* Node shadow */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={radius + 1}
                    fill="black"
                    opacity={0.1}
                  />

                  {/* Node circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={radius}
                    fill={isFolder ? '#1976d2' : '#4caf50'}
                    opacity={0.9}
                    stroke="white"
                    strokeWidth="2"
                    style={{ transition: 'all 0.3s ease' }}
                  />

                  {/* Node label */}
                  <text
                    x={pos.x}
                    y={pos.y + 3}
                    textAnchor="middle"
                    fill="white"
                    fontSize="9"
                    fontWeight="bold"
                    pointerEvents="none"
                    sx={{ userSelect: 'none' }}
                  >
                    {node.label.length > 5
                      ? node.label.substring(0, 5) + '.'
                      : node.label}
                  </text>

                  {/* Type indicator */}
                  <title>{`${node.label} (${node.type})`}</title>
                </g>
              );
            })}

            {/* Legend */}
            <g>
              {/* Legend background */}
              <rect
                x="10"
                y="10"
                width="110"
                height="55"
                fill="white"
                opacity={0.9}
                rx="4"
                stroke="currentColor"
                strokeWidth="1"
              />

              {/* Folder legend */}
              <circle cx="25" cy="25" r="5" fill="#1976d2" opacity={0.9} stroke="white" strokeWidth="1" />
              <text x="36" y="30" fontSize="11" fontWeight="bold">
                Folder
              </text>

              {/* File legend */}
              <circle cx="25" cy="48" r="5" fill="#4caf50" opacity={0.9} stroke="white" strokeWidth="1" />
              <text x="36" y="53" fontSize="11" fontWeight="bold">
                File
              </text>
            </g>
          </Box>
        </Paper>

        <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: 'center' }}>
          <Typography variant="caption" color="textSecondary">
            Total Items: {stats.total}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default GraphView;
