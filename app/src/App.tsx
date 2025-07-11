import React, { useState, useEffect } from "react";
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Alert,
  CircularProgress,
  Paper,
  Slider,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Card,
  CardContent,
  Chip
} from "@mui/material";
import { VolumeUp, Stop, PlayArrow } from "@mui/icons-material";
import MeSpeakSynthesizer from "./utils/MeSpeakSynthesizer";
import type ISpeechState from "./types/ISpeechState";

function App(): React.JSX.Element {
  const [kfaText, setKfaText] = useState<string>("bit");
  const [speechSpeed, setSpeechSpeed] = useState<number>(120); // Slower default speed
  const [amplitude, setAmplitude] = useState<number>(100); // Volume/amplitude
  const [pitch, setPitch] = useState<number>(50); // Pitch
  const [wordGap, setWordGap] = useState<number>(0); // Word gap
  const [selectedVoice, setSelectedVoice] = useState<string>('en/en-us'); // Voice
  const [selectedVariant, setSelectedVariant] = useState<string>(''); // Variant
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
      await meSpeakSynthesizer.speakKfa(kfaText, {
        speed: speechSpeed,
        amplitude: amplitude,
        pitch: pitch,
        wordgap: wordGap,
        voice: selectedVoice,
        variant: selectedVariant || undefined
      });
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

  // const exampleKfaText = "bit Sip Jym kat bat hand sy try ky"; // Proper kfa examples
  
  const kfaExamples = [
    { label: "Basic Sounds", text: "bit Sip Jym kat bat hand sy try ky" },
    { label: "Gettysburg Opening", text: "fOr skOr and sevun yiErz uguO" },
    { label: "Homophones", text: "wic wic iz wic? TeE at TeE haus" },
    { label: "Complex Words", text: "kunsyvd libErty kryeyted ykwul" },
    { label: "Vowel Spectrum", text: "u i y E a O e A o U" },
    { label: "Diphthongs", text: "ey ay uO au iE eE UE oUy" }
  ];
  
  const voices = [
    { value: 'en/en-us', label: 'English (US)' },
    { value: 'en/en-uk', label: 'English (UK)' },
    { value: 'en/en-au', label: 'English (Australia)' },
    { value: 'en/en-ca', label: 'English (Canada)' }
  ];
  
  const variants = [
    { value: '', label: 'Default' },
    { value: 'f1', label: 'Female 1' },
    { value: 'f2', label: 'Female 2' },
    { value: 'f3', label: 'Female 3' },
    { value: 'm1', label: 'Male 1' },
    { value: 'm2', label: 'Male 2' },
    { value: 'm3', label: 'Male 3' },
    { value: 'whisper', label: 'Whisper' },
    { value: 'croak', label: 'Croak' }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ height: '100vh' }}>
        <Box sx={{ flex: '1 1 55%' }}>
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

        <Box sx={{ mb: 3 }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Speech Speed: {speechSpeed}
                </Typography>
                <Slider
                  value={speechSpeed}
                  onChange={(_, newValue) => setSpeechSpeed(newValue as number)}
                  min={50}
                  max={300}
                  step={25}
                  marks={[
                    { value: 50, label: 'Slow' },
                    { value: 175, label: 'Normal' },
                    { value: 300, label: 'Fast' }
                  ]}
                  disabled={!speechState.isSupported || speechState.isSpeaking}
                  sx={{ mt: 1 }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Amplitude: {amplitude}
                </Typography>
                <Slider
                  value={amplitude}
                  onChange={(_, newValue) => setAmplitude(newValue as number)}
                  min={0}
                  max={200}
                  step={10}
                  marks={[
                    { value: 0, label: 'Quiet' },
                    { value: 100, label: 'Normal' },
                    { value: 200, label: 'Loud' }
                  ]}
                  disabled={!speechState.isSupported || speechState.isSpeaking}
                  sx={{ mt: 1 }}
                />
              </Box>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Pitch: {pitch}
                </Typography>
                <Slider
                  value={pitch}
                  onChange={(_, newValue) => setPitch(newValue as number)}
                  min={0}
                  max={99}
                  step={5}
                  marks={[
                    { value: 0, label: 'Low' },
                    { value: 50, label: 'Normal' },
                    { value: 99, label: 'High' }
                  ]}
                  disabled={!speechState.isSupported || speechState.isSpeaking}
                  sx={{ mt: 1 }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Word Gap: {wordGap}
                </Typography>
                <Slider
                  value={wordGap}
                  onChange={(_, newValue) => setWordGap(newValue as number)}
                  min={0}
                  max={10}
                  step={1}
                  marks={[
                    { value: 0, label: 'None' },
                    { value: 5, label: 'Normal' },
                    { value: 10, label: 'Wide' }
                  ]}
                  disabled={!speechState.isSupported || speechState.isSpeaking}
                  sx={{ mt: 1 }}
                />
              </Box>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth>
                  <InputLabel>Voice</InputLabel>
                  <Select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    disabled={!speechState.isSupported || speechState.isSpeaking}
                    label="Voice"
                  >
                    {voices.map((voice) => (
                      <MenuItem key={voice.value} value={voice.value}>
                        {voice.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth>
                  <InputLabel>Variant</InputLabel>
                  <Select
                    value={selectedVariant}
                    onChange={(e) => setSelectedVariant(e.target.value)}
                    disabled={!speechState.isSupported || speechState.isSpeaking}
                    label="Variant"
                  >
                    {variants.map((variant) => (
                      <MenuItem key={variant.value} value={variant.value}>
                        {variant.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Stack>
          </Stack>
        </Box>

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
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {kfaExamples.map((example, index) => (
            <Chip
              key={index}
              label={example.label}
              onClick={() => setKfaText(example.text)}
              disabled={!speechState.isSupported}
              variant="outlined"
              clickable
              icon={<PlayArrow />}
            />
          ))}
        </Box>
      </Paper>
        </Box>
        
        <Box sx={{ flex: '1 1 45%', minWidth: '400px' }}>
          <Paper elevation={2} sx={{ p: 3, height: '100%', overflow: 'auto' }}>
            <Typography variant="h5" gutterBottom>
              kfa - QWERTY Phonetic Alphabet
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              kfa is a phonetic alphabet system using only QWERTY keyboard characters (A-Z, a-z) to represent the 44 distinct sounds of English.
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Vowels (20 sounds)
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 2 }}>
              u (schwa) - about/ubaut/, sofa/suOfu/<br/>
              i (short I) - bit/bit/, ship/Sip/, gym/Jim/<br/>
              y (long E) - see/sy/, tree/try/, key/ky/<br/>
              E (UR sound) - bird/bEd/, word/wEd/, nurse/nEs/<br/>
              a (short A) - cat/kat/, bat/bat/, hand/hand/<br/>
              O (long U) - moon/mOn/, blue/blO/, food/fOd/<br/>
              e (short E) - bed/bed/, red/red/, bread/bred/<br/>
              A (long A) - car/kAr/, father/fATuE/, palm/pAlm/<br/>
              o (long O) - saw/so/, caught/kot/, bought/bot/<br/>
              U (short U) - book/bUk/, good/gUd/, put/pUt/
            </Typography>
            
            <Typography variant="h6" gutterBottom>
              Diphthongs (10 sounds)
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 2 }}>
              ey (long A) - day/dey/, make/meyk/, rain/reyn/<br/>
              ay (long I) - my/may/, time/taym/, fly/flay/<br/>
              uO (long O) - go/guO/, home/huOm/, boat/buOt/<br/>
              au (OW sound) - now/nau/, house/haus/, cloud/klaud/<br/>
              iE (EER sound) - here/hiE/, beer/biE/, deer/diE/<br/>
              eE (AIR sound) - hair/heE/, care/keE/, bear/beE/<br/>
              UE (UUR sound) - sure/SUE/, tour/tUE/, pure/pjUE/<br/>
              oUy (OY sound) - boy/boUy/, coin/koUyn/, voice/voUys/
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Demonstration Examples
            </Typography>
            
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Gettysburg Address Opening
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  English: "Four score and seven years ago our fathers brought forth..."
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  kfa: "fOr skOr and sevun yiErz uguO auEr fATuEz brot forQ..."
                </Typography>
              </CardContent>
            </Card>
            
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Homophones Resolved
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  English: "Which witch is which? They're at their house over there!"
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  kfa: "wic wic iz wic? TeE at TeE haus OvuE TeE!"
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Notice how identical sounds get identical spelling in kfa
                </Typography>
              </CardContent>
            </Card>
            
            <Typography variant="body2" color="text.secondary">
              The kfa system eliminates English spelling confusion by representing how words actually sound, not their historical spelling accidents.
            </Typography>
          </Paper>
        </Box>
      </Stack>
    </Container>
  );
}

export default App;
