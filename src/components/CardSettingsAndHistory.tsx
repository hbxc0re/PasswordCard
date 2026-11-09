import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  TextField,
  Button,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Restore as RestoreIcon,
  ContentCopy as CopyIcon,
  Casino as RandomIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import {
  GeneratedPasswordCard,
  PasswordCardOptions,
} from '../utils/passwordCard';

interface CardSettingsAndHistoryProps {
  currentCard: GeneratedPasswordCard;
  options: PasswordCardOptions;
  autoRefreshEnabled: boolean;
  secondsRemaining: number;
  history: GeneratedPasswordCard[];
  onUpdateOptions: (partial: Partial<PasswordCardOptions>) => void;
  onApplyCustomCardNumber: (hex: string) => void;
  onGenerateNewRandomCard: () => void;
  onToggleAutoRefresh: () => void;
  onRestoreHistoryCard: (card: GeneratedPasswordCard) => void;
  onCopyText: (text: string, label: string) => void;
  onExportCardTxt: () => void;
}

export const CardSettingsAndHistory: React.FC<CardSettingsAndHistoryProps> = ({
  currentCard,
  options,
  autoRefreshEnabled,
  secondsRemaining,
  history,
  onUpdateOptions,
  onApplyCustomCardNumber,
  onGenerateNewRandomCard,
  onToggleAutoRefresh,
  onRestoreHistoryCard,
  onCopyText,
  onExportCardTxt,
}) => {
  const [customSeedInput, setCustomSeedInput] = useState(
    currentCard.cardNumber
  );

  // Sync input when card rotates externally
  React.useEffect(() => {
    setCustomSeedInput(currentCard.cardNumber);
  }, [currentCard.cardNumber]);

  const handleSeedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = customSeedInput.replace(/[^0-9a-fA-F]/g, '').slice(0, 16);
    if (cleaned.length > 0) {
      onApplyCustomCardNumber(cleaned.padStart(16, '0'));
    }
  };

  const formatTimeRemaining = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Card Algorithm & Seed Parameters */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          backgroundColor: '#040b0b',
          border: '1px solid rgba(45, 212, 191, 0.28)',
          borderRadius: 3,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ color: '#5eead4', fontWeight: 700, mb: 0.5 }}
        >
          PasswordCard.org Parameters
        </Typography>
        <Typography variant="body2" sx={{ color: '#14b8a6', mb: 2 }}>
          Deterministic 64-bit Java LCG matrix generator. Enter any 16-digit hex
          card number to recreate an exact card or let the 5-minute timer rotate
          seeds automatically.
        </Typography>

        {/* Custom Hex Card Number Form */}
        <Box
          component="form"
          onSubmit={handleSeedSubmit}
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1.25,
            mb: 2.5,
          }}
        >
          <TextField
            size="small"
            fullWidth
            label="16-Digit Hex Card Number (Seed)"
            value={customSeedInput}
            onChange={(e) =>
              setCustomSeedInput(
                e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 16)
              )
            }
            placeholder="e.g. 8f4a2c910b3e7d15"
            slotProps={{
              htmlInput: {
                maxLength: 16,
                style: {
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '0.06em',
                },
              },
            }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              type="submit"
              variant="contained"
              sx={{ minHeight: 42, px: 2.5 }}
            >
              Load Seed
            </Button>
            <Tooltip title="Generate a new random card immediately">
              <Button
                type="button"
                variant="outlined"
                onClick={onGenerateNewRandomCard}
                startIcon={<RandomIcon sx={{ fontSize: 18 }} />}
                sx={{ minHeight: 42 }}
              >
                New Card
              </Button>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ my: 2, borderColor: 'rgba(20, 184, 166, 0.18)' }} />

        {/* Toggles for Symbols, Digit PIN Zone, and 5-Min Auto-Rotation */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              p: 1.5,
              borderRadius: 2,
              backgroundColor: '#000000',
              border: '1px solid rgba(20, 184, 166, 0.2)',
            }}
          >
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: '#5eead4' }}
              >
                Auto-Refresh Every 5 Minutes
              </Typography>
              <Typography variant="caption" sx={{ color: '#14b8a6' }}>
                Automatically generates a fresh cryptographic card every 300s (
                {autoRefreshEnabled
                  ? `Next in ${formatTimeRemaining(secondsRemaining)}`
                  : 'Paused'}
                )
              </Typography>
            </Box>
            <Switch
              checked={autoRefreshEnabled}
              onChange={onToggleAutoRefresh}
              slotProps={{
                input: { 'aria-label': 'Auto refresh every 5 minutes' },
              }}
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              p: 1.5,
              borderRadius: 2,
              backgroundColor: '#000000',
              border: '1px solid rgba(20, 184, 166, 0.2)',
            }}
          >
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: '#5eead4' }}
              >
                Include Special Symbols
              </Typography>
              <Typography variant="caption" sx={{ color: '#14b8a6' }}>
                Inserts punctuation & symbols (@#$%&*€+{}[]()/\?) on even
                columns
              </Typography>
            </Box>
            <Switch
              checked={options.includeSymbols}
              onChange={(e) =>
                onUpdateOptions({ includeSymbols: e.target.checked })
              }
              slotProps={{
                input: { 'aria-label': 'Include special symbols' },
              }}
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              p: 1.5,
              borderRadius: 2,
              backgroundColor: '#000000',
              border: '1px solid rgba(20, 184, 166, 0.2)',
            }}
          >
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: '#5eead4' }}
              >
                Digits-Only PIN Area (Rows 5–8)
              </Typography>
              <Typography variant="caption" sx={{ color: '#14b8a6' }}>
                Populates bottom 4 rows (Yellow, Blue, Purple, Teal) exclusively
                with digits 0–9
              </Typography>
            </Box>
            <Switch
              checked={options.digitArea}
              onChange={(e) =>
                onUpdateOptions({ digitArea: e.target.checked })
              }
              slotProps={{
                input: { 'aria-label': 'Digits only area' },
              }}
            />
          </Box>
        </Box>

        {/* Export / Print Card Actions */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.25,
            mt: 2.5,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<DownloadIcon sx={{ fontSize: 18 }} />}
            onClick={onExportCardTxt}
            sx={{ flex: 1 }}
          >
            Export ASCII Card (.txt)
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon sx={{ fontSize: 18 }} />}
            onClick={() => window.print()}
            sx={{ flex: 1 }}
          >
            Print Physical Card
          </Button>
        </Box>
      </Paper>

      {/* 5-Minute Card Rotation History Log */}
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
            variant="subtitle1"
            sx={{ color: '#5eead4', fontWeight: 700 }}
          >
            5-Minute Rotation Log ({history.length})
          </Typography>
          <Typography variant="caption" sx={{ color: '#14b8a6' }}>
            Tap any past card to restore its grid
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {history.map((item, idx) => {
            const isCurrent = item.cardNumber === currentCard.cardNumber;
            const timeStr = new Date(item.generatedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <Box
                key={`${item.cardNumber}-${item.generatedAt}-${idx}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: isCurrent
                    ? 'rgba(20, 184, 166, 0.14)'
                    : '#000000',
                  border: isCurrent
                    ? '1px solid #2dd4bf'
                    : '1px solid rgba(20, 184, 166, 0.18)',
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      sx={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        color: isCurrent ? '#5eead4' : '#2dd4bf',
                      }}
                    >
                      #{item.formattedSerial}
                    </Typography>
                    {isCurrent && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#99f6e4',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 600,
                        }}
                      >
                        · ACTIVE
                      </Typography>
                    )}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#14b8a6',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    Generated at {timeStr} · Symbols:{' '}
                    {item.options.includeSymbols ? 'On' : 'Off'} · PIN:{' '}
                    {item.options.digitArea ? 'On' : 'Off'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Tooltip title="Copy hex seed">
                    <IconButton
                      size="small"
                      onClick={() =>
                        onCopyText(item.cardNumber, 'Card hex seed')
                      }
                      aria-label="Copy seed"
                    >
                      <CopyIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                  {!isCurrent && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<RestoreIcon sx={{ fontSize: 16 }} />}
                      onClick={() => onRestoreHistoryCard(item)}
                      sx={{ minHeight: 36, fontSize: '0.75rem' }}
                    >
                      Restore
                    </Button>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Paper>
    </Box>
  );
};
