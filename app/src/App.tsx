import React, { useState, useEffect } from "react";
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Alert,
  CircularProgress,
  Paper
} from "@mui/material";
import { VolumeUp, Stop } from "@mui/icons-material";
import MeSpeakSynthesizer from "./utils/MeSpeakSynthesizer";
import type ISpeechState from "./types/ISpeechState";

function App(): React.JSX.Element {
  const [kfaText, setKfaText] = useState<string>("bit");
  const [speechState, setSpeechState] = useState<ISpeechState>({
    isSupported: false,
    isLoading: false,
    isSpeaking: false,
    error: null
  });
  const [meSpeakSynthesizer] = useState(() => new MeSpeakSynthesizer());

  useEffect(() => {
    // Delay initialization to ensure meSpeak is loaded
    const initializeWithDelay = () => {
      console.log('Attempting to initialize meSpeak...');
      meSpeakSynthesizer.initialize()
        .then(() => {
          setSpeechState(prev => ({
            ...prev,
            isSupported: true,
            error: null
          }));
        })
        .catch((error) => {
          console.error('meSpeak initialization failed:', error);
          setSpeechState(prev => ({
            ...prev,
            isSupported: false,
            error: `Failed to initialize speech: ${error.message}`
          }));
        });
    };

    // Try immediately, then retry after delay if needed
    if (typeof window !== 'undefined' && window.meSpeak) {
      initializeWithDelay();
    } else {
      console.log('meSpeak not ready, retrying in 1 second...');
      setTimeout(initializeWithDelay, 1000);
    }
  }, [meSpeakSynthesizer]);

  const handleSpeak = async (): Promise<void> => {
    if (!kfaText.trim()) return;

    setSpeechState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      setSpeechState(prev => ({ ...prev, isLoading: false, isSpeaking: true }));
      await meSpeakSynthesizer.speakKfa(kfaText);
      setSpeechState(prev => ({ ...prev, isSpeaking: false }));
    } catch (error) {
      setSpeechState(prev => ({
        ...prev,
        isLoading: false,
        isSpeaking: false,
        error: error instanceof Error ? error.message : "Speech synthesis failed"
      }));
    }
  };

  const handleStop = (): void => {
    // meSpeak doesn't have a built-in stop method, but we can reset state
    setSpeechState(prev => ({ ...prev, isSpeaking: false, isLoading: false }));
  };

  const exampleKfaText = "bit Sip Jym kat bat hand sy try ky"; // Proper kfa examples

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        kfa Text-to-Speech
      </Typography>
      
      <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 4 }}>
        QWERTY Phonetic Alphabet - Powered by meSpeak.js for accurate pronunciation
      </Typography>

      {speechState.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {speechState.error}
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Enter kfa text"
          value={kfaText}
          onChange={(e) => setKfaText(e.target.value)}
          placeholder="Type kfa phonetic text here..."
          disabled={!speechState.isSupported}
          sx={{ mb: 3 }}
        />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={speechState.isLoading ? <CircularProgress size={20} /> : <VolumeUp />}
            onClick={handleSpeak}
            disabled={!speechState.isSupported || speechState.isLoading || speechState.isSpeaking || !kfaText.trim()}
          >
            {speechState.isLoading ? "Loading..." : speechState.isSpeaking ? "Speaking..." : "Speak"}
          </Button>

          {speechState.isSpeaking && (
            <Button
              variant="outlined"
              size="large"
              startIcon={<Stop />}
              onClick={handleStop}
              color="secondary"
            >
              Stop
            </Button>
          )}
        </Box>
      </Paper>

      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Try these kfa examples:
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Click to load into the text field
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setKfaText(exampleKfaText)}
          disabled={!speechState.isSupported}
        >
          {exampleKfaText}
        </Button>
      </Paper>
    </Container>
  );
}

export default App;
