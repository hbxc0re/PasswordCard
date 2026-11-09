import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Close as CloseIcon,
  Android as AndroidIcon,
  Download as DownloadIcon,
  Check as CheckIcon,
  ContentCopy as CopyIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';

interface AndroidInstallDialogProps {
  open: boolean;
  onClose: () => void;
}

export const AndroidInstallDialog: React.FC<AndroidInstallDialogProps> = ({
  open,
  onClose,
}) => {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Capture beforeinstallprompt event if supported by Android Chrome
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const capacitorCommand = `# 1. Build the production web bundle
npm run build

# 2. Add the native Android project wrapper
npx cap add android

# 3. Compile the standalone debug APK
cd android && ./gradlew assembleDebug
# Generated APK: android/app/build/outputs/apk/debug/app-debug.apk`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(capacitorCommand);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#040b0b',
          border: '1px solid rgba(45, 212, 191, 0.35)',
          borderRadius: 3,
          color: '#2dd4bf',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
          borderBottom: '1px solid rgba(20, 184, 166, 0.2)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <AndroidIcon sx={{ color: '#5eead4', fontSize: 26 }} />
          <Typography
            variant="h6"
            sx={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              color: '#5eead4',
              fontSize: '1.1rem',
            }}
          >
            Android App &amp; APK
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="Close"
          sx={{ color: '#14b8a6' }}
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, pb: 2.5 }}>
        <Tabs
          value={tabIndex}
          onChange={(_, val) => setTabIndex(val)}
          sx={{
            mb: 2,
            minHeight: 40,
            '& .MuiTabs-indicator': {
              backgroundColor: '#5eead4',
            },
          }}
        >
          <Tab
            label="Instant Install (WebAPK)"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              color: tabIndex === 0 ? '#5eead4' : '#14b8a6',
              minHeight: 40,
            }}
          />
          <Tab
            label="Build .APK Binary"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              color: tabIndex === 1 ? '#5eead4' : '#14b8a6',
              minHeight: 40,
            }}
          />
        </Tabs>

        {tabIndex === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#2dd4bf', lineHeight: 1.6 }}>
              On modern Android devices, Chrome and Android OS automatically
              synthesize an official <strong>WebAPK</strong> package. It installs to
              your home screen and app drawer with a native app icon, running in full
              fullscreen OLED black with zero browser address bars:
            </Typography>

            {deferredPrompt && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleInstallClick}
                startIcon={<DownloadIcon />}
                sx={{
                  py: 1.25,
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  backgroundColor: '#14b8a6',
                  color: '#000000',
                }}
              >
                Install App on this Device
              </Button>
            )}

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: '#000000',
                border: '1px solid rgba(20, 184, 166, 0.22)',
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ color: '#5eead4', fontWeight: 700, mb: 1 }}
              >
                Manual Steps on Android Phone:
              </Typography>
              <Box
                component="ol"
                sx={{
                  pl: 2.5,
                  m: 0,
                  fontSize: '0.82rem',
                  color: '#14b8a6',
                  lineHeight: 1.6,
                }}
              >
                <li>Open this application in <strong>Chrome</strong>, <strong>Brave</strong>, or <strong>Samsung Internet</strong>.</li>
                <li>Tap the browser menu icon (<strong>⋮</strong> three vertical dots in the top right).</li>
                <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                <li>Confirm the prompt. Android will generate the WebAPK and add it to your launcher.</li>
              </Box>
            </Box>
          </Box>
        )}

        {tabIndex === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#2dd4bf', lineHeight: 1.6 }}>
              This project is configured with a <strong>Capacitor</strong> and Web App Manifest specification. Because this web sandbox doesn't have the 10GB+ Android SDK / JDK installed, you can generate the standalone <code className="font-mono text-teal-300">.apk</code> binary in two ways:
            </Typography>

            {/* Option A: PWABuilder */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: '#000000',
                border: '1px solid rgba(20, 184, 166, 0.22)',
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ color: '#5eead4', fontWeight: 700, mb: 0.5 }}
              >
                Option A: Instant APK Generator (PWABuilder — No Android Studio Needed)
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: '#14b8a6', fontSize: '0.82rem', lineHeight: 1.6, mb: 1.5 }}
              >
                Microsoft's free open-source PWABuilder can package any deployed web app into a signed <code className="font-mono text-teal-300">.apk</code> file in 60 seconds:
              </Typography>
              <Button
                variant="outlined"
                size="small"
                href="https://www.pwabuilder.com"
                target="_blank"
                rel="noreferrer"
                endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                sx={{ minHeight: 36, fontSize: '0.78rem' }}
              >
                Open PWABuilder (Generate APK)
              </Button>
            </Box>

            {/* Option B: Local Android Studio Build */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: '#000000',
                border: '1px solid rgba(20, 184, 166, 0.22)',
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
                  sx={{ color: '#5eead4', fontWeight: 700 }}
                >
                  Option B: Local Gradle / Android Studio Build
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  onClick={handleCopyCode}
                  startIcon={copiedCode ? <CheckIcon sx={{ fontSize: 15 }} /> : <CopyIcon sx={{ fontSize: 15 }} />}
                  sx={{ fontSize: '0.72rem', py: 0.25, px: 1 }}
                >
                  {copiedCode ? 'Copied' : 'Copy Commands'}
                </Button>
              </Box>

              <Box
                component="pre"
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  backgroundColor: '#020606',
                  border: '1px solid rgba(20, 184, 166, 0.16)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.72rem',
                  color: '#5eead4',
                  overflowX: 'auto',
                  lineHeight: 1.5,
                  m: 0,
                }}
              >
                {capacitorCommand}
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 1.5,
          borderTop: '1px solid rgba(20, 184, 166, 0.18)',
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ minHeight: 38, px: 2.5 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
