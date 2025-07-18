import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box, 
  Card, 
  CardContent, 
  TextField, 
  Button 
} from "@mui/material";
import { useState, useRef } from "react";
import TranslationService from "./services/translationService";

function App() {
  const [englishText, setEnglishText] = useState("");
  const [ipaText, setIpaText] = useState("");
  const [kfaText, setKfaText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const translationService = useRef(new TranslationService()).current;

  const handleTranslateFromEnglish = async () => {
    if (!englishText.trim()) return;
    
    setIsTranslating(true);
    try {
      const results = await translationService.translateText(englishText, 'english');
      
      if (results.ipa.success) {
        setIpaText(results.ipa.result);
      } else {
        setIpaText(`Error: ${results.ipa.error}`);
      }
      
      if (results.kfa.success) {
        setKfaText(results.kfa.result);
      } else {
        setKfaText(`Error: ${results.kfa.error}`);
      }
    } catch (error) {
      console.error('Translation error:', error);
      setIpaText('Translation failed');
      setKfaText('Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslateFromIPA = async () => {
    if (!ipaText.trim()) return;
    
    setIsTranslating(true);
    try {
      const results = await translationService.translateText(ipaText, 'ipa');
      
      if (results.english.success) {
        setEnglishText(results.english.result);
      } else {
        setEnglishText(`Error: ${results.english.error}`);
      }
      
      if (results.kfa.success) {
        setKfaText(results.kfa.result);
      } else {
        setKfaText(`Error: ${results.kfa.error}`);
      }
    } catch (error) {
      console.error('Translation error:', error);
      setEnglishText('Translation failed');
      setKfaText('Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslateFromKFA = async () => {
    if (!kfaText.trim()) return;
    
    setIsTranslating(true);
    try {
      const results = await translationService.translateText(kfaText, 'kfa');
      
      if (results.english.success) {
        setEnglishText(results.english.result);
      } else {
        setEnglishText(`Error: ${results.english.error}`);
      }
      
      if (results.ipa.success) {
        setIpaText(results.ipa.result);
      } else {
        setIpaText(`Error: ${results.ipa.error}`);
      }
    } catch (error) {
      console.error('Translation error:', error);
      setEnglishText('Translation failed');
      setIpaText('Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const readmeContent = `# kfa - QWERTY Phonetic Alphabet

**kfa** is a phonetic alphabet system that uses only the characters available on a standard QWERTY keyboard (uppercase and lowercase letters) to represent the 44 distinct sounds of English. The goal is to create an intuitive mapping where the most frequently used English sounds are represented by the letters that English speakers already associate with those sounds, making it easy to read and learn.

Unlike traditional phonetic alphabets that use special symbols, kfa constrains itself to the 52 letters (A-Z, a-z) available on any standard keyboard, making it practical for digital communication and typing.

## Design Philosophy

### Balancing Phonetic Precision with Practical Usability

**kfa** is designed to achieve two primary goals:
1. **Phonetic enough** that spelling bees would make zero sense (no arbitrary spelling rules)
2. **Simple enough** that users don't need to overthink pronunciation decisions

This balance is achieved through deliberate design choices that prioritize **practical phonetic representation** over academic precision.

### The Schwa Decision: Simplicity Over Distinction

One key example is our treatment of the schwa sound (ə) and the "strut" vowel (ʌ). In traditional IPA, these are distinct symbols representing subtly different sounds:

- **banana**: /bənɑnə/ vs /bʌnɑnə/ 
- **cup**: /kəp/ vs /kʌp/
- **love**: /ləv/ vs /lʌv/

However, for most English speakers, the acoustic difference between /ə/ and /ʌ/ is often imperceptible or contextually variable. Different speakers and even different TTS voices (like Amazon Polly's Salli vs Joanna) may pronounce these sounds differently, but the distinction requires careful listening to detect.

**kfa's approach**: Always use **u** (representing schwa) for both sounds:
- **banana**: bunanu
- **cup**: kup  
- **love**: luv

**Benefits of this simplification**:
- **Eliminates guesswork**: No need to decide between nearly identical sounds
- **Maintains phonetic accuracy**: The sound is captured adequately
- **Natural variation**: Readers will naturally produce contextual variations
- **Consistent system**: One symbol, clear mapping

### Regional Accent Considerations

kfa is designed around **Western American English** pronunciation patterns, which reflect how millions of Americans actually speak. A key example is the **low back merger**, where sounds like /ɑː/ (car), /ɔː/ (caught), and /ɒ/ (hot) are pronounced identically as a single vowel sound.

**kfa approach**: All three sounds use **o**:
- **car, father, palm**: kor, foTur, polm
- **saw, caught, bought**: so, kot, bot  
- **hot, dog, wash**: hot, dog, woS

### Phonemic vs Phonetic Distinction

kfa prioritizes **meaning-making sound differences** over academic phonetic precision. The guiding principle: if changing a sound creates a different word, it needs a different symbol. If it's just an accent variation of the same word, one symbol works.

**Examples:**
- **bat vs bot**: Different words → need different symbols (a vs o)
- **car, saw, hot**: Same vowel sound in Western American → all use "o"  
- **buk vs bUk**: Different words (buck vs book) → need different symbols (u vs U)

## 44 English Sounds with IPA and kfa Mapping

### Vowels (20 sounds)

| IPA | kfa | Sound Description | Frequency | Example 1 | Example 2 | Example 3 |
|-----|-----|-------------------|-----------|-----------|-----------|-----------|
| ə | u | Schwa | 11.49% | about/ubaOt | sofa/suOfu | banana/bunanu |
| ɪ | i | Short I | 6.32% | bit/bit | ship/Sip | gym/Jim |
| iː | y | Long E | 3.61% | see/sy | tree/try | key/ky |
| ɜː | ur | UR sound | 2.86% | bird/burd | word/wurd | nurse/nurs |
| æ | a | Short A | 2.10% | cat/kat | bat/bat | hand/hand |
| uː | O | Long U | 1.93% | moon/mOn | blue/blO | food/fOd |
| e | e | Short E | 1.79% | bed/bed | red/red | bread/bred |
| ʌ | u | Schwa-like | 1.74% | cup/kup | love/luv | blood/blud |
| eɪ | ay | Long A | 1.50% | day/day | make/mayk | rain/rayn |
| aɪ | uy | Long I | 1.50% | my/muy | time/tuym | fly/fluy |
| ɑː | o | Long A | 1.45% | car/kor | father/foTur | palm/polm |
| ɔː | o | Long O | 1.25% | saw/so | caught/kot | bought/bot |
| əʊ | uO | Long O | 1.25% | go/guO | home/huOm | boat/buOt |
| ɒ | o | Short O | 1.18% | hot/hot | dog/dog | wash/woS |
| aʊ | aO | OW sound | 0.50% | now/naO | house/haOs | cloud/klaOd |
| ʊ | U | Short U | 0.43% | book/bUk | good/gUd | put/pUt |
| ɪə | ir | EER sound | 0.30% | here/hir | beer/bir | deer/dir |
| eə | er | AIR sound | 0.25% | hair/her | care/ker | bear/ber |
| ʊə | ur | UUR sound | 0.15% | sure/Sur | cure/kjur | pure/pjur |
| ɔɪ | oy | OY sound | 0.10% | boy/boy | coin/koyn | voice/voys |

### Consonants (24 sounds)

| IPA | kfa | Sound Description | Frequency | Example 1 | Example 2 | Example 3 |
|-----|-----|-------------------|-----------|-----------|-----------|-----------|
| n | n | N sound | 7.11% | no/nuO | dinner/dinur | sun/sun |
| r | r | R sound | 6.94% | red/red | sorry/sory | car/kor |
| t | t | T sound | 6.91% | ten/ten | better/betur | cat/kat |
| s | s | S sound | 4.75% | sun/sun | lesson/lesun | bus/bus |
| d | d | D sound | 4.21% | dog/dog | ladder/ladur | red/red |
| l | l | L sound | 3.96% | love/luv | yellow/jeluO | call/kol |
| k | k | K sound | 3.18% | key/ky | school/skOl | book/bUk |
| ð | T | TH (this) | 2.95% | this/Tis | mother/muTur | breathe/bryT |
| m | m | M sound | 2.76% | man/man | summer/sumur | time/teym |
| z | z | Z sound | 2.76% | zoo/zO | music/mjOzik | eyes/oyz |
| p | p | P sound | 2.15% | pen/pen | happy/hapy | cup/kup |
| v | v | V sound | 2.01% | very/very | river/rivur | love/luv |
| w | w | W sound | 1.95% | water/wotur | away/uway | quick/kwik |
| b | b | B sound | 1.80% | book/bUk | table/taybul | job/Job |
| f | f | F sound | 1.71% | fish/fiS | coffee/kofy | leaf/lyf |
| h | h | H sound | 1.40% | house/haOs | perhaps/purhaps | hello/heluO |
| ŋ | G | NG sound | 0.99% | sing/syG | thinking/TyGkyG | long/loG |
| ʃ | S | SH sound | 0.97% | ship/Sip | washing/woSyG | fish/fiS |
| j | j | Y sound | 0.81% | yes/jes | music/mjOzik | few/fjO |
| g | g | G sound | 0.80% | go/guO | bigger/bigur | bag/bag |
| dʒ | J | J sound | 0.59% | jump/Jump | magic/maJik | bridge/briJ |
| tʃ | c | CH sound | 0.56% | chair/cer | teacher/tycer | watch/woc |
| θ | T | TH (thin) | 0.41% | think/TyGk | nothing/nuTyG | path/paT |
| ʒ | Z | ZH sound | 0.07% | pleasure/pleZur | vision/viZun | measure/meZur |

## Complete System Achievement

**🎉 All 44 English phonemes successfully mapped using only QWERTY keyboard letters!**

**Core vowels (8):** u, i, y, a, O, e, o, U  
**Diphthong combinations (10):** ay, uy, uO, aO, ir, er, ur, oy  
**All consonants (24):** Complete mapping using intuitive letter assignments

## Demonstration: The Gettysburg Address

**English:**
"Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal."

**kfa:**
"for skor and sevun yirz ugo aOr foTurz brot forT on Tis kontunint, u nO naysun, kunsyvd in libirty, and dedukayted tO Tu propuZiSun Tat ol men or kryayted ykwul."

## Demonstration: Eliminating English Spelling Confusion

**English:**
"Which witch is which? They're at their house over there! Your dog ate you're dinner, but you're not sure whose dog it was or who's coming to dinner."

**kfa:**
"wic wic iz wic? Ter at Ter haOs uOvur Ter! yuer dog ayt yuer dinur, but yuer not Sur hOz dog it waz or hOz kumyG tO dinur."

This example showcases one of kfa's most powerful features: eliminating the confusion caused by English's inconsistent spelling. Notice how:
- **which/witch** = both 'wic' (identical pronunciation, identical spelling)
- **they're/their/there** = all 'Ter' (same sound, same spelling)  
- **your/you're** = both 'yuer' (phonetically identical)
- **whose/who's** = both 'hOz' (eliminates arbitrary apostrophe confusion)

The kfa system represents how words actually sound, not their historical spelling accidents, making it invaluable for language learners and eliminating common English spelling confusion.`;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            kfa Translator
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box 
          sx={{ 
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
            alignItems: "flex-start"
          }}
        >
          {/* Left Column - Translator */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* English Section */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    English
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={englishText}
                    onChange={(e) => setEnglishText(e.target.value)}
                    placeholder="Enter English text here..."
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleTranslateFromEnglish}
                    fullWidth
                    disabled={isTranslating || !englishText.trim()}
                  >
                    {isTranslating ? 'Translating...' : 'Translate to IPA & kfa'}
                  </Button>
                </CardContent>
              </Card>

              {/* IPA Section */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    IPA (International Phonetic Alphabet)
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={ipaText}
                    onChange={(e) => setIpaText(e.target.value)}
                    placeholder="Enter IPA text here..."
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleTranslateFromIPA}
                    fullWidth
                    disabled={isTranslating || !ipaText.trim()}
                  >
                    {isTranslating ? 'Translating...' : 'Translate to English & kfa'}
                  </Button>
                </CardContent>
              </Card>

              {/* kfa Section */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    kfa (QWERTY Phonetic Alphabet)
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={kfaText}
                    onChange={(e) => setKfaText(e.target.value)}
                    placeholder="Enter kfa text here..."
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleTranslateFromKFA}
                    fullWidth
                    disabled={isTranslating || !kfaText.trim()}
                  >
                    {isTranslating ? 'Translating...' : 'Translate to English & IPA'}
                  </Button>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Right Column - README */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Card sx={{ position: "sticky", top: 16 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Documentation
                </Typography>
                <Box 
                  sx={{ 
                    whiteSpace: "pre-line",
                    fontFamily: "monospace",
                    fontSize: "0.85rem",
                    lineHeight: 1.4,
                    maxHeight: "calc(100vh - 200px)",
                    overflow: "auto",
                    pr: 1
                  }}
                >
                  {readmeContent}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default App;
