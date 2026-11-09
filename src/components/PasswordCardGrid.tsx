import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Visibility as EyeIcon,
  GridOn as GridIcon,
} from '@mui/icons-material';
import {
  GeneratedPasswordCard,
  ROW_COLORS,
  CoordinateCell,
  GRID_WIDTH,
} from '../utils/passwordCard';

interface PasswordCardGridProps {
  card: GeneratedPasswordCard;
  startRow: number;
  startCol: number;
  highlightedPath: CoordinateCell[];
  showRowColorTints: boolean;
  compactMode: boolean;
  onSelectCell: (row: number, col: number) => void;
  onSelectRow: (row: number) => void;
  onSelectCol: (col: number) => void;
  onCopySerial: () => void;
  onToggleRowTints: () => void;
  onToggleCompactMode: () => void;
}

export const PasswordCardGrid: React.FC<PasswordCardGridProps> = ({
  card,
  startRow,
  startCol,
  highlightedPath,
  showRowColorTints,
  compactMode,
  onSelectCell,
  onSelectRow,
  onSelectCol,
  onCopySerial,
  onToggleRowTints,
  onToggleCompactMode,
}) => {
  // Build fast lookup map for cells in the active password path
  const pathStepMap = React.useMemo(() => {
    const map = new Map<string, number>();
    highlightedPath.forEach((cell, idx) => {
      const key = `${cell.row}:${cell.col}`;
      // Keep the earliest step index if path wraps around
      if (!map.has(key)) {
        map.set(key, idx + 1);
      }
    });
    return map;
  }, [highlightedPath]);

  const activeSymbol = card.headerSymbols[startCol] || '■';
  const activeRowSpec = ROW_COLORS[startRow] || ROW_COLORS[0];

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: '#000000',
        border: '1px solid rgba(45, 212, 191, 0.32)',
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 16px 40px -12px rgba(20, 184, 166, 0.14)',
      }}
    >
      {/* Top Card Identity Bar (Physical Credit-Card Header Style) */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          px: { xs: 2, sm: 2.5 },
          py: 1.5,
          backgroundColor: '#040b0b',
          borderBottom: '1px solid rgba(20, 184, 166, 0.22)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              color: '#5eead4',
              letterSpacing: '0.04em',
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
            }}
          >
            CARD #{card.formattedSerial}
          </Typography>
          <Tooltip title="Copy 16-digit Hex Card Seed">
            <IconButton
              size="small"
              onClick={onCopySerial}
              aria-label="Copy hex card number"
              sx={{
                minWidth: 36,
                minHeight: 36,
                p: 0.75,
                color: '#2dd4bf',
                border: '1px solid rgba(45, 212, 191, 0.25)',
                borderRadius: 1.5,
              }}
            >
              <CopyIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Active Coordinate Summary & View Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: '0.78rem',
              color: '#2dd4bf',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <Box
              component="span"
              sx={{
                width: 10,
                height: 10,
                borderRadius: '2px',
                backgroundColor: activeRowSpec.dotColor,
                border: '1px solid rgba(255,255,255,0.4)',
                display: 'inline-block',
              }}
            />
            <span>
              Row {activeRowSpec.index} ({activeRowSpec.name})
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Col {startCol + 1} ({activeSymbol})
            </span>
          </Box>

          <Tooltip
            title={
              showRowColorTints
                ? 'Hide subtle row color backdrops'
                : 'Show subtle row color backdrops'
            }
          >
            <IconButton
              size="small"
              onClick={onToggleRowTints}
              aria-label="Toggle row color tints"
              sx={{
                minWidth: 36,
                minHeight: 36,
                p: 0.75,
                color: showRowColorTints ? '#5eead4' : '#0f766e',
                backgroundColor: showRowColorTints
                  ? 'rgba(20, 184, 166, 0.14)'
                  : 'transparent',
                border: '1px solid rgba(45, 212, 191, 0.22)',
                borderRadius: 1.5,
              }}
            >
              <EyeIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          <Tooltip
            title={
              compactMode
                ? 'Switch to spacious touch grid'
                : 'Switch to compact full-card view'
            }
          >
            <IconButton
              size="small"
              onClick={onToggleCompactMode}
              aria-label="Toggle compact grid density"
              sx={{
                minWidth: 36,
                minHeight: 36,
                p: 0.75,
                color: compactMode ? '#5eead4' : '#2dd4bf',
                backgroundColor: compactMode
                  ? 'rgba(20, 184, 166, 0.14)'
                  : 'transparent',
                border: '1px solid rgba(45, 212, 191, 0.22)',
                borderRadius: 1.5,
              }}
            >
              <GridIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Scrollable 29-Column × 9-Row Matrix Container */}
      <Box
        sx={{
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          backgroundColor: '#000000',
          px: { xs: 1, sm: 1.5 },
          py: 1.5,
        }}
      >
        <Box
          component="table"
          sx={{
            width: '100%',
            minWidth: compactMode ? 680 : 860,
            borderCollapse: 'separate',
            borderSpacing: compactMode ? '1px' : '2px',
            tableLayout: 'fixed',
            userSelect: 'none',
          }}
        >
          {/* Column Number Micro-Index + Shuffled 29 Symbol Header Row */}
          <Box component="thead">
            <Box component="tr">
              <Box
                component="th"
                sx={{
                  width: compactMode ? 68 : 84,
                  textAlign: 'left',
                  px: 1,
                  py: 0.5,
                  fontSize: '0.68rem',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600,
                  color: '#0f766e',
                  borderBottom: '1px solid rgba(20, 184, 166, 0.25)',
                }}
              >
                ROW / SYM
              </Box>
              {card.headerSymbols.map((sym, colIdx) => {
                const isSelectedCol = colIdx === startCol;
                return (
                  <Box
                    component="th"
                    key={colIdx}
                    onClick={() => onSelectCol(colIdx)}
                    sx={{
                      cursor: 'pointer',
                      textAlign: 'center',
                      py: compactMode ? 0.6 : 0.85,
                      px: 0.25,
                      borderRadius: 1,
                      backgroundColor: isSelectedCol
                        ? 'rgba(20, 184, 166, 0.28)'
                        : '#040c0c',
                      borderBottom: isSelectedCol
                        ? '2px solid #5eead4'
                        : '1px solid rgba(20, 184, 166, 0.25)',
                      transition: 'background-color 120ms ease',
                      '&:hover': {
                        backgroundColor: 'rgba(20, 184, 166, 0.2)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        fontSize: '0.58rem',
                        lineHeight: 1,
                        color: isSelectedCol ? '#99f6e4' : '#0f766e',
                        fontFamily: "'JetBrains Mono', monospace",
                        mb: 0.3,
                      }}
                    >
                      {String(colIdx + 1).padStart(2, '0')}
                    </Box>
                    <Box
                      sx={{
                        fontSize: compactMode ? '0.92rem' : '1.05rem',
                        lineHeight: 1.1,
                        fontWeight: 700,
                        color: isSelectedCol ? '#5eead4' : '#2dd4bf',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {sym}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* 8 Color-Coded Character Rows */}
          <Box component="tbody">
            {card.rows.map((rowChars, rowIdx) => {
              const rowSpec = ROW_COLORS[rowIdx];
              const isSelectedRow = rowIdx === startRow;
              const isDigitPinRow = card.options.digitArea && rowIdx >= 4;

              return (
                <Box
                  component="tr"
                  key={rowSpec.id}
                  sx={{
                    backgroundColor: showRowColorTints
                      ? rowSpec.rowBgTint
                      : rowIdx % 2 === 1
                      ? 'rgba(20, 184, 166, 0.03)'
                      : '#000000',
                  }}
                >
                  {/* Row Label Cell (1..8 + Color Swatch + Color Name) */}
                  <Box
                    component="td"
                    onClick={() => onSelectRow(rowIdx)}
                    sx={{
                      cursor: 'pointer',
                      px: 1,
                      py: compactMode ? 0.5 : 0.75,
                      borderRadius: 1,
                      backgroundColor: isSelectedRow
                        ? 'rgba(20, 184, 166, 0.22)'
                        : '#030909',
                      border: isSelectedRow
                        ? '1px solid #2dd4bf'
                        : '1px solid rgba(20, 184, 166, 0.14)',
                      whiteSpace: 'nowrap',
                      '&:hover': {
                        backgroundColor: 'rgba(20, 184, 166, 0.16)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          width: 9,
                          height: 9,
                          borderRadius: '2px',
                          backgroundColor: rowSpec.dotColor,
                          flexShrink: 0,
                          boxShadow: `0 0 6px ${rowSpec.dotColor}66`,
                        }}
                      />
                      <Typography
                        component="span"
                        sx={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: compactMode ? '0.7rem' : '0.75rem',
                          fontWeight: isSelectedRow ? 700 : 600,
                          color: isSelectedRow ? '#5eead4' : '#2dd4bf',
                        }}
                      >
                        {rowSpec.index}·{rowSpec.name}
                      </Typography>
                    </Box>
                  </Box>

                  {/* 29 Character Cells in this Row */}
                  {rowChars.map((ch, colIdx) => {
                    const stepNum = pathStepMap.get(`${rowIdx}:${colIdx}`);
                    const isStartCell =
                      rowIdx === startRow && colIdx === startCol;
                    const isInPath = stepNum !== undefined;

                    return (
                      <Box
                        component="td"
                        key={colIdx}
                        onClick={() => onSelectCell(rowIdx, colIdx)}
                        sx={{
                          position: 'relative',
                          cursor: 'pointer',
                          textAlign: 'center',
                          py: compactMode ? 0.55 : 0.85,
                          px: 0.15,
                          borderRadius: 1,
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: compactMode ? '0.84rem' : '0.95rem',
                          fontWeight: isInPath ? 700 : 500,
                          color: isStartCell
                            ? '#000000'
                            : isInPath
                            ? '#99f6e4'
                            : isDigitPinRow
                            ? '#5eead4'
                            : '#2dd4bf',
                          backgroundColor: isStartCell
                            ? '#2dd4bf'
                            : isInPath
                            ? 'rgba(20, 184, 166, 0.28)'
                            : 'transparent',
                          border: isStartCell
                            ? '1px solid #99f6e4'
                            : isInPath
                            ? '1px solid rgba(94, 234, 212, 0.65)'
                            : '1px solid rgba(20, 184, 166, 0.08)',
                          boxShadow: isStartCell
                            ? '0 0 12px rgba(45, 212, 191, 0.55)'
                            : 'none',
                          transition:
                            'transform 100ms ease, background-color 100ms ease',
                          '&:hover': {
                            backgroundColor: isStartCell
                              ? '#5eead4'
                              : 'rgba(45, 212, 191, 0.22)',
                            borderColor: '#2dd4bf',
                          },
                        }}
                      >
                        {ch}
                        {isInPath && (
                          <Box
                            component="span"
                            sx={{
                              position: 'absolute',
                              top: 1,
                              right: 2,
                              fontSize: '0.48rem',
                              lineHeight: 1,
                              fontWeight: 700,
                              color: isStartCell ? '#000000' : '#5eead4',
                              opacity: 0.9,
                            }}
                          >
                            {stepNum}
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* Bottom Card Footer Legend */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          px: { xs: 2, sm: 2.5 },
          py: 1.1,
          backgroundColor: '#030808',
          borderTop: '1px solid rgba(20, 184, 166, 0.18)',
          fontSize: '0.73rem',
          color: '#14b8a6',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>Tap any cell to set start coordinate</span>
          <span aria-hidden="true">·</span>
          <span>29 cols × 8 rows ({29 * 8} chars)</span>
        </Box>
        <Box
          sx={{
            fontFamily: "'JetBrains Mono', monospace",
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <span>
            Symbols: {card.options.includeSymbols ? 'Enabled' : 'Off'}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            PIN Zone (Rows 5–8): {card.options.digitArea ? 'Digits 0-9' : 'Off'}
          </span>
        </Box>
      </Box>
    </Paper>
  );
};
