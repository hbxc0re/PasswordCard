import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  CircularProgress,
  BottomNavigation,
  BottomNavigationAction,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  GridOn as GridNavIcon,
  Key as KeyNavIcon,
  History as HistoryNavIcon,
  HelpOutlined as GuideNavIcon,
  Android as AndroidIcon,
} from '@mui/icons-material';
import { androidBlackTealTheme } from './theme/muiTheme';
import {
  PasswordCardOptions,
  GeneratedPasswordCard,
  ReadDirection,
  SavedBookmark,
  ROW_COLORS,
  generateRandomCardHex,
  generatePasswordCard,
  extractPasswordFromGrid,
} from './utils/passwordCard';
import { PasswordCardGrid } from './components/PasswordCardGrid';
import { PasswordExtractorPanel } from './components/PasswordExtractorPanel';
import { CardSettingsAndHistory } from './components/CardSettingsAndHistory';
import { AlgorithmGuidePanel } from './components/AlgorithmGuidePanel';
import { AndroidInstallDialog } from './components/AndroidInstallDialog';

const FIVE_MINUTES_SECONDS = 300; // 5 minutes = 300 seconds

const DEFAULT_BOOKMARKS: SavedBookmark[] = [
  {
    id: 'bm-1',
    label: 'Primary Vault',
    rowIdx: 2, // Row 3 (Red)
    symbol: '♥',
    direction: 'right',
    length: 12,
  },
  {
    id: 'bm-2',
    label: 'Cloud SSH Key',
    rowIdx: 7, // Row 8 (Teal)
    symbol: '★',
    direction: 'diag-ur',
    length: 16,
  },
  {
    id: 'bm-3',
    label: 'Banking Login',
    rowIdx: 3, // Row 4 (Green)
    symbol: '€',
    direction: 'right',
    length: 14,
  },
];

type ActiveTab = 'card' | 'extract' | 'history' | 'guide';

export default function App() {
  // Initial card options
  const [options, setOptions] = useState<PasswordCardOptions>(() => ({
    cardNumber: generateRandomCardHex(),
    includeSymbols: false,
    digitArea: false,
  }));

  // Generated card state
  const [currentCard, setCurrentCard] = useState<GeneratedPasswordCard>(() =>
    generatePasswordCard({
      cardNumber: options.cardNumber,
      includeSymbols: false,
      digitArea: false,
    })
  );

  // Rotation history log (most recent first)
  const [cardHistory, setCardHistory] = useState<GeneratedPasswordCard[]>(() => [
    currentCard,
  ]);

  // 5-Minute (300s) Auto-Refresh Countdown State
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
  const [secondsRemaining, setSecondsRemaining] =
    useState<number>(FIVE_MINUTES_SECONDS);

  // Coordinate Selection State
  const [startRow, setStartRow] = useState<number>(2); // Default Row 3 (Red)
  const [selectedSymbol, setSelectedSymbol] = useState<string>(
    () => currentCard.headerSymbols[4] || '★'
  );
  const [direction, setDirection] = useState<ReadDirection>('right');
  const [passwordLength, setPasswordLength] = useState<number>(12);

  // Display Preferences
  const [showRowColorTints, setShowRowColorTints] = useState<boolean>(true);
  const [compactMode, setCompactMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('card');

  // Saved Coordinate Bookmarks
  const [bookmarks, setBookmarks] = useState<SavedBookmark[]>(() => {
    try {
      const saved = localStorage.getItem('passwordcard_bookmarks_v1');
      return saved ? JSON.parse(saved) : DEFAULT_BOOKMARKS;
    } catch {
      return DEFAULT_BOOKMARKS;
    }
  });

  // Toast / Snackbar feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showInstallDialog, setShowInstallDialog] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(
        'passwordcard_bookmarks_v1',
        JSON.stringify(bookmarks)
      );
    } catch {
      // Ignore storage errors in private mode
    }
  }, [bookmarks]);

  // Resolve current column index from selectedSymbol so coordinate tracks symbol across rotations
  const startCol = useMemo(() => {
    const idx = currentCard.headerSymbols.indexOf(selectedSymbol);
    return idx >= 0 ? idx : 0;
  }, [currentCard.headerSymbols, selectedSymbol]);

  // Extract password and highlighted path cells from current card
  const { password: extractedPassword, path: highlightedPath } = useMemo(
    () =>
      extractPasswordFromGrid(
        currentCard,
        startRow,
        startCol,
        direction,
        passwordLength
      ),
    [currentCard, startRow, startCol, direction, passwordLength]
  );

  // Function to generate a fresh random card and reset the 5-minute timer
  const rotateToNewCard = useCallback(
    (source: 'auto' | 'manual' = 'manual') => {
      const newHex = generateRandomCardHex();
      const nextOptions: PasswordCardOptions = {
        ...options,
        cardNumber: newHex,
      };
      const nextCard = generatePasswordCard(nextOptions);
      setOptions(nextOptions);
      setCurrentCard(nextCard);
      setCardHistory((prev) => [nextCard, ...prev.slice(0, 24)]);
      setSecondsRemaining(FIVE_MINUTES_SECONDS);

      if (source === 'auto') {
        setToastMessage(
          `5-minute timer reached: Rotated to new card #${nextCard.formattedSerial}`
        );
      } else {
        setToastMessage(`Generated new card #${nextCard.formattedSerial}`);
      }
    },
    [options]
  );

  // 5-Minute (300s) Countdown Interval
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const timer = window.setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          rotateToNewCard('auto');
          return FIVE_MINUTES_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [autoRefreshEnabled, rotateToNewCard]);

  // Update options (Include Symbols / Digits-Only Area)
  const handleUpdateOptions = (partial: Partial<PasswordCardOptions>) => {
    const updated: PasswordCardOptions = { ...options, ...partial };
    const regenerated = generatePasswordCard(updated);
    setOptions(updated);
    setCurrentCard(regenerated);
    setCardHistory((prev) => [
      regenerated,
      ...prev.filter((c) => c.cardNumber !== regenerated.cardNumber).slice(0, 24),
    ]);
  };

  // Load a specific 16-digit hex seed
  const handleApplyCustomCardNumber = (hex: string) => {
    const updated: PasswordCardOptions = { ...options, cardNumber: hex };
    const regenerated = generatePasswordCard(updated);
    setOptions(updated);
    setCurrentCard(regenerated);
    setSecondsRemaining(FIVE_MINUTES_SECONDS);
    setCardHistory((prev) => [
      regenerated,
      ...prev.filter((c) => c.cardNumber !== regenerated.cardNumber).slice(0, 24),
    ]);
    setToastMessage(`Loaded card seed #${regenerated.formattedSerial}`);
  };

  // Restore a card from the 5-minute history log
  const handleRestoreHistoryCard = (card: GeneratedPasswordCard) => {
    setOptions(card.options);
    setCurrentCard(card);
    setSecondsRemaining(FIVE_MINUTES_SECONDS);
    setToastMessage(`Restored card #${card.formattedSerial}`);
    setActiveTab('card');
  };

  // Select cell on grid
  const handleSelectCell = (row: number, col: number) => {
    setStartRow(row);
    const sym = currentCard.headerSymbols[col];
    if (sym) {
      setSelectedSymbol(sym);
    }
  };

  const handleSelectCol = (col: number) => {
    const sym = currentCard.headerSymbols[col];
    if (sym) {
      setSelectedSymbol(sym);
    }
  };

  // Copy helper
  const handleCopyText = async (text: string, label = 'Value') => {
    try {
      await navigator.clipboard.writeText(text);
      setToastMessage(`Copied ${label} to clipboard`);
    } catch {
      setToastMessage(`Copied ${label}`);
    }
  };

  // Export plain-text ASCII representation of the current card
  const handleExportCardTxt = () => {
    const headerLine =
      'Row      | ' + currentCard.headerSymbols.join(' ');
    const dividerLine = '-'.repeat(headerLine.length);
    const bodyLines = currentCard.rows.map((rChars, idx) => {
      const rName = `${idx + 1}.${ROW_COLORS[idx].name}`.padEnd(8, ' ');
      return `${rName} | ${rChars.join(' ')}`;
    });

    const content = [
      `PasswordCard.org Android Edition — Card #${currentCard.cardNumber}`,
      `Generated: ${new Date(currentCard.generatedAt).toISOString()}`,
      dividerLine,
      headerLine,
      dividerLine,
      ...bodyLines,
      dividerLine,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `passwordcard-${currentCard.cardNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setToastMessage('Downloaded ASCII PasswordCard (.txt)');
  };

  // Add / Select / Delete Bookmarks
  const handleAddBookmark = (label: string) => {
    const newBm: SavedBookmark = {
      id: `bm-${Date.now()}`,
      label,
      rowIdx: startRow,
      symbol: selectedSymbol,
      direction,
      length: passwordLength,
    };
    setBookmarks((prev) => [newBm, ...prev]);
    setToastMessage(`Pinned coordinate "${label}"`);
  };

  const handleSelectBookmark = (bm: SavedBookmark) => {
    setStartRow(bm.rowIdx);
    setSelectedSymbol(bm.symbol);
    setDirection(bm.direction);
    setPasswordLength(bm.length);
    setToastMessage(`Selected "${bm.label}" coordinate`);
  };

  const handleDeleteBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  // Format MM:SS countdown
  const formattedCountdown = useMemo(() => {
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [secondsRemaining]);

  const progressPercentage =
    ((FIVE_MINUTES_SECONDS - secondsRemaining) / FIVE_MINUTES_SECONDS) * 100;

  return (
    <ThemeProvider theme={androidBlackTealTheme}>
      <CssBaseline />
      <div className="min-h-screen bg-black text-teal-400 flex flex-col pb-20 lg:pb-10">
        {/* Strict 3-Zone Top Bar Contract */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-4 sm:px-8 py-3.5 bg-black/95 backdrop-blur-md border-b border-teal-500/25 no-print">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('card');
            }}
            className="text-lg font-bold tracking-tight text-teal-300 whitespace-nowrap shrink-0"
          >
            PasswordCard
          </a>

          {/* Zone 2: 4 concise single-line navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-teal-400">
            <button
              type="button"
              onClick={() => setActiveTab('card')}
              className={`hover:text-teal-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                activeTab === 'card'
                  ? 'text-teal-200 border-b-2 border-teal-400 font-semibold'
                  : ''
              }`}
            >
              Card Workspace
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('extract')}
              className={`hover:text-teal-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                activeTab === 'extract'
                  ? 'text-teal-200 border-b-2 border-teal-400 font-semibold'
                  : ''
              }`}
            >
              Coordinate Picker
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`hover:text-teal-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                activeTab === 'history'
                  ? 'text-teal-200 border-b-2 border-teal-400 font-semibold'
                  : ''
              }`}
            >
              Seed & Rotation Log
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`hover:text-teal-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                activeTab === 'guide'
                  ? 'text-teal-200 border-b-2 border-teal-400 font-semibold'
                  : ''
              }`}
            >
              APK &amp; Guide
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<RefreshIcon sx={{ fontSize: 17 }} />}
              onClick={() => rotateToNewCard('manual')}
              sx={{
                minHeight: 40,
                px: 2,
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >
              New Card Now
            </Button>
          </div>
        </header>

        {/* Main Responsive Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
          {/* 5-Minute Auto-Refresh Status Strip */}
          <Paper
            elevation={0}
            className="no-print"
            sx={{
              mb: 3,
              backgroundColor: '#040b0b',
              border: '1px solid rgba(45, 212, 191, 0.3)',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                px: { xs: 2, sm: 2.5 },
                py: 1.5,
              }}
            >
              {/* Left: Circular Progress + Timer Readout */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
                <Box
                  sx={{
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CircularProgress
                    variant="determinate"
                    value={100 - progressPercentage}
                    size={42}
                    thickness={4.5}
                    sx={{
                      color: autoRefreshEnabled ? '#2dd4bf' : '#0f766e',
                    }}
                  />
                  <Typography
                    sx={{
                      position: 'absolute',
                      fontSize: '0.62rem',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                      color: '#5eead4',
                    }}
                  >
                    5m
                  </Typography>
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: '#5eead4',
                        fontWeight: 700,
                      }}
                    >
                      Auto-Refresh Timer
                    </Typography>
                    <span aria-hidden="true" className="text-teal-600">
                      ·
                    </span>
                    <Typography
                      sx={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: '#2dd4bf',
                      }}
                    >
                      {formattedCountdown}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#14b8a6' }}>
                    {autoRefreshEnabled
                      ? 'New 64-bit PasswordCard deals automatically every 5 minutes'
                      : '5-minute auto-rotation paused — current card locked'}
                  </Typography>
                </Box>
              </Box>

              {/* Right: Quick Timer Controls & Quick Password Copy */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AndroidIcon sx={{ fontSize: 16 }} />}
                  onClick={() => setShowInstallDialog(true)}
                  sx={{ minHeight: 40 }}
                >
                  APK / Install
                </Button>

                <Button
                  size="small"
                  variant="outlined"
                  startIcon={
                    autoRefreshEnabled ? (
                      <PauseIcon sx={{ fontSize: 16 }} />
                    ) : (
                      <PlayIcon sx={{ fontSize: 16 }} />
                    )
                  }
                  onClick={() => setAutoRefreshEnabled((prev) => !prev)}
                  sx={{ minHeight: 40 }}
                >
                  {autoRefreshEnabled ? 'Pause 5m Timer' : 'Resume Timer'}
                </Button>

                <Tooltip title="Reset 5-minute countdown & deal a new card immediately">
                  <IconButton
                    onClick={() => rotateToNewCard('manual')}
                    aria-label="Deal new card now"
                    sx={{
                      border: '1px solid rgba(45, 212, 191, 0.35)',
                      borderRadius: 2,
                    }}
                  >
                    <RefreshIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{
                height: 3,
                backgroundColor: '#020606',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: autoRefreshEnabled ? '#2dd4bf' : '#0f766e',
                },
              }}
            />
          </Paper>

          {/* View Routing for Desktop & Mobile */}
          {activeTab === 'card' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left / Main 8 Columns: Authentic 29×9 PasswordCard Matrix */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                <PasswordCardGrid
                  card={currentCard}
                  startRow={startRow}
                  startCol={startCol}
                  highlightedPath={highlightedPath}
                  showRowColorTints={showRowColorTints}
                  compactMode={compactMode}
                  onSelectCell={handleSelectCell}
                  onSelectRow={setStartRow}
                  onSelectCol={handleSelectCol}
                  onCopySerial={() =>
                    handleCopyText(currentCard.cardNumber, 'Card hex number')
                  }
                  onToggleRowTints={() =>
                    setShowRowColorTints((prev) => !prev)
                  }
                  onToggleCompactMode={() => setCompactMode((prev) => !prev)}
                />

                {/* Quick Seed & Options Bar directly underneath the card on Desktop */}
                <div className="hidden lg:block no-print">
                  <CardSettingsAndHistory
                    currentCard={currentCard}
                    options={options}
                    autoRefreshEnabled={autoRefreshEnabled}
                    secondsRemaining={secondsRemaining}
                    history={cardHistory}
                    onUpdateOptions={handleUpdateOptions}
                    onApplyCustomCardNumber={handleApplyCustomCardNumber}
                    onGenerateNewRandomCard={() => rotateToNewCard('manual')}
                    onToggleAutoRefresh={() =>
                      setAutoRefreshEnabled((prev) => !prev)
                    }
                    onRestoreHistoryCard={handleRestoreHistoryCard}
                    onCopyText={handleCopyText}
                    onExportCardTxt={handleExportCardTxt}
                  />
                </div>
              </div>

              {/* Right 4 Columns: Coordinate Password Extractor & Pinned Recipes */}
              <div className="lg:col-span-4 no-print">
                <PasswordExtractorPanel
                  card={currentCard}
                  startRow={startRow}
                  startCol={startCol}
                  direction={direction}
                  length={passwordLength}
                  extractedPassword={extractedPassword}
                  bookmarks={bookmarks}
                  onSelectRow={setStartRow}
                  onSelectCol={handleSelectCol}
                  onChangeDirection={setDirection}
                  onChangeLength={setPasswordLength}
                  onCopyPassword={handleCopyText}
                  onAddBookmark={handleAddBookmark}
                  onSelectBookmark={handleSelectBookmark}
                  onDeleteBookmark={handleDeleteBookmark}
                />
              </div>
            </div>
          )}

          {activeTab === 'extract' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5">
                <PasswordExtractorPanel
                  card={currentCard}
                  startRow={startRow}
                  startCol={startCol}
                  direction={direction}
                  length={passwordLength}
                  extractedPassword={extractedPassword}
                  bookmarks={bookmarks}
                  onSelectRow={setStartRow}
                  onSelectCol={handleSelectCol}
                  onChangeDirection={setDirection}
                  onChangeLength={setPasswordLength}
                  onCopyPassword={handleCopyText}
                  onAddBookmark={handleAddBookmark}
                  onSelectBookmark={handleSelectBookmark}
                  onDeleteBookmark={handleDeleteBookmark}
                />
              </div>
              <div className="lg:col-span-7">
                <PasswordCardGrid
                  card={currentCard}
                  startRow={startRow}
                  startCol={startCol}
                  highlightedPath={highlightedPath}
                  showRowColorTints={showRowColorTints}
                  compactMode={compactMode}
                  onSelectCell={handleSelectCell}
                  onSelectRow={setStartRow}
                  onSelectCol={handleSelectCol}
                  onCopySerial={() =>
                    handleCopyText(currentCard.cardNumber, 'Card hex number')
                  }
                  onToggleRowTints={() =>
                    setShowRowColorTints((prev) => !prev)
                  }
                  onToggleCompactMode={() => setCompactMode((prev) => !prev)}
                />
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="max-w-4xl mx-auto">
              <CardSettingsAndHistory
                currentCard={currentCard}
                options={options}
                autoRefreshEnabled={autoRefreshEnabled}
                secondsRemaining={secondsRemaining}
                history={cardHistory}
                onUpdateOptions={handleUpdateOptions}
                onApplyCustomCardNumber={handleApplyCustomCardNumber}
                onGenerateNewRandomCard={() => rotateToNewCard('manual')}
                onToggleAutoRefresh={() =>
                  setAutoRefreshEnabled((prev) => !prev)
                }
                onRestoreHistoryCard={handleRestoreHistoryCard}
                onCopyText={handleCopyText}
                onExportCardTxt={handleExportCardTxt}
              />
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="max-w-4xl mx-auto">
              <AlgorithmGuidePanel />
            </div>
          )}
        </main>

        {/* Android Material UI Fixed Bottom Navigation Bar (Mobile / Tablet) */}
        <Box
          className="md:hidden no-print"
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 40,
          }}
        >
          <BottomNavigation
            showLabels
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue as ActiveTab)}
          >
            <BottomNavigationAction
              label="Card Grid"
              value="card"
              icon={<GridNavIcon />}
            />
            <BottomNavigationAction
              label="Coordinates"
              value="extract"
              icon={<KeyNavIcon />}
            />
            <BottomNavigationAction
              label="5m History"
              value="history"
              icon={<HistoryNavIcon />}
            />
            <BottomNavigationAction
              label="Guide"
              value="guide"
              icon={<GuideNavIcon />}
            />
          </BottomNavigation>
        </Box>

        {/* Material UI Snackbar Toast Notification */}
        <Snackbar
          open={Boolean(toastMessage)}
          autoHideDuration={3200}
          onClose={() => setToastMessage(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{ bottom: { xs: 76, md: 24 } }}
        >
          <Alert
            onClose={() => setToastMessage(null)}
            severity="success"
            variant="outlined"
            sx={{
              backgroundColor: '#041010',
              color: '#5eead4',
              borderColor: '#14b8a6',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 600,
              boxShadow: '0 10px 30px rgba(0,0,0,0.85)',
            }}
          >
            {toastMessage}
          </Alert>
        </Snackbar>

        {/* Android Installation & APK Modal Dialog */}
        <AndroidInstallDialog
          open={showInstallDialog}
          onClose={() => setShowInstallDialog(false)}
        />
      </div>
    </ThemeProvider>
  );
}
