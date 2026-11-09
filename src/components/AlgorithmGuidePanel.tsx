import React from 'react';
import { Box, Paper, Typography, Divider } from '@mui/material';
import { ROW_COLORS, HEADER_SYMBOLS } from '../utils/passwordCard';

export const AlgorithmGuidePanel: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          backgroundColor: '#040b0b',
          border: '1px solid rgba(45, 212, 191, 0.28)',
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: '#5eead4', fontWeight: 700, mb: 1 }}
        >
          How PasswordCard Android Works
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: '#2dd4bf', lineHeight: 1.65, mb: 2.5 }}
        >
          Instead of memorizing dozens of high-entropy passwords, a PasswordCard
          maps every password to a simple visual coordinate: one of{' '}
          <strong>8 Row Colors</strong> paired with one of{' '}
          <strong>29 Column Symbols</strong>. Because this edition rotates the
          64-bit card seed every 5 minutes (300 seconds), it also functions as a
          visual ephemeral key matrix—or you can type any 16-digit hexadecimal
          seed to deterministically recreate your permanent card at any time.
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
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
              sx={{ color: '#5eead4', fontWeight: 700, mb: 0.75 }}
            >
              01. Pick a Symbol & Color
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#14b8a6', fontSize: '0.84rem', lineHeight: 1.6 }}
            >
              Choose a memorable symbol from the top header row (such as ♥ Heart
              or ★ Star) and a color row from 1 to 8 (such as Row 3 · Red). Tap
              that intersection on the grid.
            </Typography>
          </Box>

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
              sx={{ color: '#5eead4', fontWeight: 700, mb: 0.75 }}
            >
              02. Trace Your Direction
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#14b8a6', fontSize: '0.84rem', lineHeight: 1.6 }}
            >
              Read characters starting from your chosen intersection in a
              consistent direction (Right →, Left ←, Down ↓, Up ↑, or Diagonal)
              for your desired password length (e.g., 12 or 16 characters).
            </Typography>
          </Box>

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
              sx={{ color: '#5eead4', fontWeight: 700, mb: 0.75 }}
            >
              03. 5-Minute Ephemeral Rotation
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#14b8a6', fontSize: '0.84rem', lineHeight: 1.6 }}
            >
              Every 5 minutes (300 seconds), a new 64-bit cryptographic card
              number is generated. Any Pinned Coordinate Recipes automatically
              track their assigned symbol across rotations, and past cards remain
              accessible in the session log.
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2.5, borderColor: 'rgba(20, 184, 166, 0.2)' }} />

        {/* Technical Specification Breakdown */}
        <Typography
          variant="subtitle2"
          sx={{ color: '#5eead4', fontWeight: 700, mb: 1.25 }}
        >
          PasswordCard.org Technical Specification
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 2,
          }}
        >
          <Box
            sx={{
              p: 1.75,
              borderRadius: 2,
              backgroundColor: '#000000',
              border: '1px solid rgba(20, 184, 166, 0.18)',
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: '#14b8a6', fontWeight: 600, display: 'block', mb: 0.5 }}
            >
              Unambiguous Character Pool (56 chars)
            </Typography>
            <Typography
              sx={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.78rem',
                color: '#5eead4',
                wordBreak: 'break-all',
              }}
            >
              23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: '#0f766e', display: 'block', mt: 0.5 }}
            >
              Excludes 0, O, o, 1, l, I, i to eliminate visual transcription errors.
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.75,
              borderRadius: 2,
              backgroundColor: '#000000',
              border: '1px solid rgba(20, 184, 166, 0.18)',
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: '#14b8a6', fontWeight: 600, display: 'block', mb: 0.5 }}
            >
              29 Shuffled Header Symbols
            </Typography>
            <Typography
              sx={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.88rem',
                color: '#5eead4',
                letterSpacing: '0.12em',
                wordBreak: 'break-all',
              }}
            >
              {HEADER_SYMBOLS.join('')}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: '#0f766e', display: 'block', mt: 0.5 }}
            >
              Permuted via seeded 64-bit Java LCG Fisher-Yates shuffle.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography
            variant="caption"
            sx={{ color: '#14b8a6', fontWeight: 600, display: 'block', mb: 1 }}
          >
            8 Canonical Row Colors
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(4, 1fr)',
                md: 'repeat(8, 1fr)',
              },
              gap: 1,
            }}
          >
            {ROW_COLORS.map((r) => (
              <Box
                key={r.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  borderRadius: 1.5,
                  backgroundColor: '#000000',
                  border: '1px solid rgba(20, 184, 166, 0.2)',
                }}
              >
                <Box
                  component="span"
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '2px',
                    backgroundColor: r.dotColor,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.75rem',
                    color: '#2dd4bf',
                  }}
                >
                  {r.index}·{r.name}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 3, borderColor: 'rgba(20, 184, 166, 0.2)' }} />

        {/* Android APK & Installation Guide */}
        <Typography
          variant="subtitle1"
          sx={{ color: '#5eead4', fontWeight: 700, mb: 1.25 }}
        >
          Android Installation & APK Guide
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 2,
          }}
        >
          {/* Method 1: Direct WebAPK Install */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: '#000000',
              border: '1px solid rgba(20, 184, 166, 0.24)',
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ color: '#5eead4', fontWeight: 700, mb: 1 }}
            >
              Method 1: Install Directly to Android (WebAPK)
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#2dd4bf', fontSize: '0.84rem', lineHeight: 1.6, mb: 1 }}
            >
              Android includes native WebAPK generation. You don't need to manually sideload an APK file:
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
              <li>Open this app on your Android device (Chrome, Edge, or Samsung Internet).</li>
              <li>Tap the browser menu (<strong>⋮</strong> three dots).</li>
              <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
              <li>Android automatically creates and installs a native WebAPK package with its own app icon and fullscreen OLED black window.</li>
            </Box>
          </Box>

          {/* Method 2: Build a Standalone .APK File */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: '#000000',
              border: '1px solid rgba(20, 184, 166, 0.24)',
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ color: '#5eead4', fontWeight: 700, mb: 1 }}
            >
              Method 2: Compile a Standalone .APK Binary
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#2dd4bf', fontSize: '0.84rem', lineHeight: 1.6, mb: 1 }}
            >
              To compile an installable <code className="font-mono text-teal-300">.apk</code> file for sideloading or Google Play:
            </Typography>
            <Box
              component="div"
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                backgroundColor: '#020606',
                border: '1px solid rgba(20, 184, 166, 0.16)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.74rem',
                color: '#5eead4',
                lineHeight: 1.5,
                mb: 1,
              }}
            >
              # 1. Build web assets<br />
              npm run build<br />
              <br />
              # 2. Add Capacitor Android wrapper<br />
              npx cap add android<br />
              <br />
              # 3. Compile the .apk binary<br />
              cd android &amp;&amp; ./gradlew assembleDebug<br />
              # Output: android/app/build/outputs/apk/debug/app-debug.apk
            </Box>
            <Typography variant="caption" sx={{ color: '#0f766e', display: 'block' }}>
              Requires Android Studio or the Android SDK (Java JDK 17+ and Gradle) installed on your system.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
