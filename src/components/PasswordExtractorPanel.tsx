import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Slider,
  TextField,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  BookmarkAdd as BookmarkAddIcon,
  DeleteOutlined as DeleteIcon,
  East as RightIcon,
  West as LeftIcon,
  South as DownIcon,
  North as UpIcon,
  SouthEast as DiagDRIcon,
  NorthEast as DiagURIcon,
} from '@mui/icons-material';
import {
  GeneratedPasswordCard,
  ROW_COLORS,
  ReadDirection,
  SavedBookmark,
  extractPasswordFromGrid,
  calculateEntropyBits,
} from '../utils/passwordCard';

interface PasswordExtractorPanelProps {
  card: GeneratedPasswordCard;
  startRow: number;
  startCol: number;
  direction: ReadDirection;
  length: number;
  extractedPassword: string;
  bookmarks: SavedBookmark[];
  onSelectRow: (row: number) => void;
  onSelectCol: (col: number) => void;
  onChangeDirection: (dir: ReadDirection) => void;
  onChangeLength: (len: number) => void;
  onCopyPassword: (pwd: string, label?: string) => void;
  onAddBookmark: (label: string) => void;
  onSelectBookmark: (bookmark: SavedBookmark) => void;
  onDeleteBookmark: (id: string) => void;
}

const DIRECTION_OPTIONS: {
  id: ReadDirection;
  label: string;
  short: string;
  icon: React.ReactNode;
}[] = [
  { id: 'right', label: 'Right', short: '→', icon: <RightIcon sx={{ fontSize: 16 }} /> },
  { id: 'left', label: 'Left', short: '←', icon: <LeftIcon sx={{ fontSize: 16 }} /> },
  { id: 'down', label: 'Down', short: '↓', icon: <DownIcon sx={{ fontSize: 16 }} /> },
  { id: 'up', label: 'Up', short: '↑', icon: <UpIcon sx={{ fontSize: 16 }} /> },
  { id: 'diag-dr', label: 'Diag ↘', short: '↘', icon: <DiagDRIcon sx={{ fontSize: 16 }} /> },
  { id: 'diag-ur', label: 'Diag ↗', short: '↗', icon: <DiagURIcon sx={{ fontSize: 16 }} /> },
];

export const PasswordExtractorPanel: React.FC<PasswordExtractorPanelProps> = ({
  card,
  startRow,
  startCol,
  direction,
  length,
  extractedPassword,
  bookmarks,
  onSelectRow,
  onSelectCol,
  onChangeDirection,
  onChangeLength,
  onCopyPassword,
  onAddBookmark,
  onSelectBookmark,
  onDeleteBookmark,
}) => {
  const [copiedMain, setCopiedMain] = useState(false);
  const [newRecipeName, setNewRecipeName] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);

  const activeRow = ROW_COLORS[startRow] || ROW_COLORS[0];
  const activeSymbol = card.headerSymbols[startCol] || '■';
  const isDigitPinRow = card.options.digitArea && startRow >= 4;
  const entropyBits = calculateEntropyBits(
    length,
    card.options.includeSymbols,
    isDigitPinRow
  );

  const handleCopyCurrent = () => {
    onCopyPassword(extractedPassword, `${activeRow.name} · ${activeSymbol}`);
    setCopiedMain(true);
    setTimeout(() => setCopiedMain(false), 1800);
  };

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    const label =
      newRecipeName.trim() || `${activeRow.name} ${activeSymbol} (${length} chars)`;
    onAddBookmark(label);
    setNewRecipeName('');
    setShowAddInput(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Live Extracted Password Readout Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          backgroundColor: '#040b0b',
          border: '1px solid rgba(45, 212, 191, 0.32)',
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              color: '#5eead4',
              fontWeight: 700,
              letterSpacing: '0.01em',
            }}
          >
            Extracted Coordinate Password
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontFamily: "'JetBrains Mono', monospace",
              color: '#14b8a6',
            }}
          >
            {length} chars · ~{entropyBits} bits entropy
          </Typography>
        </Box>

        {/* Big Monospace Password Output Box */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            p: 1.5,
            mt: 1,
            mb: 2,
            backgroundColor: '#000000',
            border: '1px solid rgba(45, 212, 191, 0.45)',
            borderRadius: 2,
          }}
        >
          <Typography
            sx={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: { xs: '1.05rem', sm: '1.2rem' },
              fontWeight: 700,
              color: '#5eead4',
              letterSpacing: '0.08em',
              wordBreak: 'break-all',
              userSelect: 'all',
            }}
          >
            {extractedPassword}
          </Typography>

          <Button
            variant="contained"
            color="primary"
            onClick={handleCopyCurrent}
            startIcon={
              copiedMain ? (
                <CheckIcon sx={{ fontSize: 18 }} />
              ) : (
                <CopyIcon sx={{ fontSize: 18 }} />
              )
            }
            sx={{
              flexShrink: 0,
              minHeight: 44,
              px: 2,
              backgroundColor: copiedMain ? '#2dd4bf' : '#14b8a6',
              color: '#000000',
              fontWeight: 700,
            }}
          >
            {copiedMain ? 'Copied' : 'Copy'}
          </Button>
        </Box>

        {/* Coordinate Formula Summary */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            mb: 2,
            fontSize: '0.78rem',
            color: '#2dd4bf',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="span"
              sx={{
                width: 10,
                height: 10,
                borderRadius: '2px',
                backgroundColor: activeRow.dotColor,
                display: 'inline-block',
              }}
            />
            <span>
              Row {activeRow.index} ({activeRow.name})
            </span>
            <span aria-hidden="true">·</span>
            <span>Symbol {activeSymbol}</span>
            <span aria-hidden="true">·</span>
            <span>
              Dir {DIRECTION_OPTIONS.find((d) => d.id === direction)?.short}
            </span>
          </Box>

          <Button
            size="small"
            variant="outlined"
            startIcon={<BookmarkAddIcon sx={{ fontSize: 16 }} />}
            onClick={() => setShowAddInput((prev) => !prev)}
            sx={{
              minHeight: 36,
              py: 0.5,
              px: 1.5,
              fontSize: '0.75rem',
            }}
          >
            Pin Coordinate
          </Button>
        </Box>

        {showAddInput && (
          <Box
            component="form"
            onSubmit={handleSaveRecipe}
            sx={{
              display: 'flex',
              gap: 1,
              mb: 2,
              p: 1.5,
              backgroundColor: '#000000',
              borderRadius: 2,
              border: '1px solid rgba(20, 184, 166, 0.25)',
            }}
          >
            <TextField
              size="small"
              fullWidth
              placeholder={`e.g. Vault Key (${activeRow.name} + ${activeSymbol})`}
              value={newRecipeName}
              onChange={(e) => setNewRecipeName(e.target.value)}
            />
            <Button type="submit" variant="contained" sx={{ minHeight: 40 }}>
              Save
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 2, borderColor: 'rgba(20, 184, 166, 0.16)' }} />

        {/* Direction Selector */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mb: 1,
              color: '#14b8a6',
              fontWeight: 600,
            }}
          >
            Reading Path Direction
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1,
            }}
          >
            {DIRECTION_OPTIONS.map((opt) => {
              const active = direction === opt.id;
              return (
                <Button
                  key={opt.id}
                  variant={active ? 'contained' : 'outlined'}
                  onClick={() => onChangeDirection(opt.id)}
                  startIcon={opt.icon}
                  sx={{
                    minHeight: 42,
                    fontSize: '0.78rem',
                    px: 1,
                    backgroundColor: active ? '#14b8a6' : '#000000',
                    color: active ? '#000000' : '#2dd4bf',
                    borderColor: active
                      ? '#5eead4'
                      : 'rgba(45, 212, 191, 0.25)',
                  }}
                >
                  {opt.label}
                </Button>
              );
            })}
          </Box>
        </Box>

        {/* Password Length Slider */}
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 0.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: '#14b8a6', fontWeight: 600 }}
            >
              Password Length
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                color: '#5eead4',
              }}
            >
              {length} characters
            </Typography>
          </Box>
          <Slider
            value={length}
            min={4}
            max={29}
            step={1}
            onChange={(_, val) => onChangeLength(val as number)}
            aria-label="Password length"
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
            {[8, 12, 16, 20, 24].map((preset) => (
              <Button
                key={preset}
                size="small"
                variant={length === preset ? 'contained' : 'outlined'}
                onClick={() => onChangeLength(preset)}
                sx={{
                  minHeight: 34,
                  flex: 1,
                  px: 0.5,
                  fontSize: '0.74rem',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {preset}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Quick Row Color Selector */}
        <Box sx={{ mb: 1.5 }}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mb: 1,
              color: '#14b8a6',
              fontWeight: 600,
            }}
          >
            Starting Row Color
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 0.8,
            }}
          >
            {ROW_COLORS.map((rowSpec, idx) => {
              const active = startRow === idx;
              return (
                <Button
                  key={rowSpec.id}
                  size="small"
                  variant={active ? 'contained' : 'outlined'}
                  onClick={() => onSelectRow(idx)}
                  sx={{
                    minHeight: 40,
                    px: 1,
                    fontSize: '0.74rem',
                    justifyContent: 'flex-start',
                    gap: 0.75,
                    backgroundColor: active ? '#14b8a6' : '#000000',
                    color: active ? '#000000' : '#2dd4bf',
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      width: 9,
                      height: 9,
                      borderRadius: '2px',
                      backgroundColor: rowSpec.dotColor,
                      border: '1px solid rgba(0,0,0,0.4)',
                      flexShrink: 0,
                    }}
                  />
                  <span>{rowSpec.name}</span>
                </Button>
              );
            })}
          </Box>
        </Box>

        {/* Quick Symbol Column Picker */}
        <Box>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mb: 1,
              color: '#14b8a6',
              fontWeight: 600,
            }}
          >
            Starting Column Symbol
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(10, 1fr)',
              gap: 0.5,
            }}
          >
            {card.headerSymbols.map((sym, colIdx) => {
              const active = startCol === colIdx;
              return (
                <Box
                  component="button"
                  type="button"
                  key={colIdx}
                  onClick={() => onSelectCol(colIdx)}
                  sx={{
                    minHeight: 36,
                    borderRadius: 1.5,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: active ? '#2dd4bf' : '#000000',
                    color: active ? '#000000' : '#2dd4bf',
                    border: active
                      ? '1px solid #99f6e4'
                      : '1px solid rgba(20, 184, 166, 0.22)',
                    '&:hover': {
                      borderColor: '#5eead4',
                      backgroundColor: active
                        ? '#5eead4'
                        : 'rgba(20, 184, 166, 0.16)',
                    },
                  }}
                >
                  {sym}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Paper>

      {/* Pinned Coordinate Recipes (Auto-Updates Every 5 Minutes When Card Rotates) */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          backgroundColor: '#040b0b',
          border: '1px solid rgba(20, 184, 166, 0.24)',
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1.5,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ color: '#5eead4', fontWeight: 700 }}
          >
            Pinned Coordinate Recipes
          </Typography>
          <Typography variant="caption" sx={{ color: '#14b8a6' }}>
            Auto-syncs on 5m card refresh
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {bookmarks.map((bm) => {
            const rowSpec = ROW_COLORS[bm.rowIdx] || ROW_COLORS[0];
            const currentColIdx = Math.max(
              0,
              card.headerSymbols.indexOf(bm.symbol)
            );
            const { password } = extractPasswordFromGrid(
              card,
              bm.rowIdx,
              currentColIdx,
              bm.direction,
              bm.length
            );
            const dirLabel =
              DIRECTION_OPTIONS.find((d) => d.id === bm.direction)?.short || '→';

            return (
              <Box
                key={bm.id}
                onClick={() => onSelectBookmark(bm)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: '#000000',
                  border: '1px solid rgba(20, 184, 166, 0.22)',
                  cursor: 'pointer',
                  transition: 'border-color 140ms ease',
                  '&:hover': {
                    borderColor: '#2dd4bf',
                  },
                }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 0.4,
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '2px',
                        backgroundColor: rowSpec.dotColor,
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: '#5eead4',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {bm.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: '#14b8a6',
                        flexShrink: 0,
                      }}
                    >
                      {rowSpec.name} · {bm.symbol} · {bm.length}c {dirLabel}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: '#2dd4bf',
                      letterSpacing: '0.06em',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {password}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Tooltip title="Copy password for this recipe">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopyPassword(password, bm.label);
                      }}
                      aria-label={`Copy ${bm.label} password`}
                    >
                      <CopyIcon sx={{ fontSize: 17 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remove pinned coordinate">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteBookmark(bm.id);
                      }}
                      aria-label={`Delete ${bm.label}`}
                      sx={{ color: '#0f766e', '&:hover': { color: '#f43f5e' } }}
                    >
                      <DeleteIcon sx={{ fontSize: 17 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Paper>
    </Box>
  );
};
