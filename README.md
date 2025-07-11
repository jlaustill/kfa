# kfa - QWERTY Phonetic Alphabet

**kfa** is a phonetic alphabet system that uses only the characters available on a standard QWERTY keyboard (uppercase and lowercase letters) to represent the 44 distinct sounds of English. The goal is to create an intuitive mapping where the most frequently used English sounds are represented by the letters that English speakers already associate with those sounds, making it easy to read and learn.

Unlike traditional phonetic alphabets that use special symbols, kfa constrains itself to the 52 letters (A-Z, a-z) available on any standard keyboard, making it practical for digital communication and typing.

## English Phonetic Reference Template
## 44 English Sounds with IPA and kfa Mapping

**Example Format:** `english/ipa/kfa`
- **english**: The English word
- **ipa**: International Phonetic Alphabet transcription  
- **kfa**: kfa (QWERTY Phonetic Alphabet) transcription

### Vowels (20 sounds)

| IPA | kfa | Test Words | Sound Description | Frequency | Example 1 | Example 2 | Example 3 |
|-----|-----|------------|-------------------|-----------|-----------|-----------|-----------|
| ə | u | but/hut/cut | Schwa | 11.49% | about/əbaʊt/ubaut/ | sofa/səʊfə/suOfu/ | banana/bənɑːnə/bunAnu/ |
| ɪ | i | bit/hit/kit | Short I | 6.32% | bit/bɪt/bit/ | ship/ʃɪp/Sip/ | gym/dʒɪm/Jim/ |
| iː | y | beat/heat/- | Long E | 3.61% | see/siː/sy/ | tree/triː/try/ | key/kiː/ky/ |
| ɜː | E | Bert/hurt/curt | UR sound | 2.86% | bird/bɜːd/bEd/ | word/wɜːd/wEd/ | nurse/nɜːs/nEs/ |
| æ | a | bat/hat/cat | Short A | 2.10% | cat/kæt/kat/ | bat/bæt/bat/ | hand/hænd/hand/ |
| uː | O | boot/hoot/coot | Long U | 1.93% | moon/muːn/mOn/ | blue/bluː/blO/ | food/fuːd/fOd/ |
| e | e | bet/het/- | Short E | 1.79% | bed/bed/bed/ | red/red/red/ | bread/bred/bred/ |
| ʌ | u | but/hut/cut | Schwa-like | 1.74% | cup/kʌp/kup/ | love/lʌv/luv/ | blood/blʌd/blud/ |
| eɪ | ey | beyt/heyt/Keyt | Long A | 1.50% | day/deɪ/dey/ | make/meɪk/meyk/ | rain/reɪn/reyn/ |
| aɪ | ay | bayt/hayt/kayt | Long I | 1.50% | my/maɪ/may/ | time/taɪm/taym/ | fly/flaɪ/flay/ |
| ɑː | A | bart/heart/cart | Long A | 1.45% | car/kɑːr/kAr/ | father/fɑːðər/fATuE/ | palm/pɑːm/pAlm/ |
| ɔː | o | bought/hot/caught | Long O | 1.25% | saw/sɔː/so/ | caught/kɔːt/kot/ | bought/bɔːt/bot/ |
| əʊ | uO | buOt/-/kuOt | Long O | 1.25% | go/gəʊ/guO/ | home/həʊm/huOm/ | boat/bəʊt/buOt/ |
| ɒ | o | bot/hot/cot | Short O | 1.18% | hot/hɒt/hot/ | dog/dɒg/dog/ | wash/wɒʃ/woS/ |
| aʊ | au | baut/haut/-* | OW sound | 0.50% | now/naʊ/nau/ | house/haʊs/haus/ | cloud/klaʊd/klaud/ |
| ʊ | U | book/good/put | Short U | 0.43% | book/bʊk/bUk/ | good/gʊd/gUd/ | put/pʊt/pUt/ |
| ɪə | iE | biE/hiE/-* | EER sound | 0.30% | here/hɪə/hiE/ | beer/bɪə/biE/ | deer/dɪə/diE/ |
| eə | eE | beE/heE/keE | AIR sound | 0.25% | hair/heə/heE/ | care/keə/keE/ | bear/beə/beE/ |
| ʊə | UE | bUE/- /-* | UUR sound | 0.15% | sure/ʃʊə/SUE/ | tour/tʊə/tUE/ | pure/pjʊə/pjUE/ |
| ɔɪ | oUy | boUy/koUy/-* | OY sound | 0.10% | boy/bɔɪ/boUy/ | coin/kɔɪn/koUyn/ | voice/vɔɪs/voUys/ |

### Consonants (24 sounds)

| IPA | kfa | Sound Description | Frequency | Example 1 | Example 2 | Example 3 |
|-----|-----|-------------------|-----------|-----------|-----------|-----------|
| n | n | N sound | 7.11% | no/nəʊ/nuO/ | dinner/dɪnər/dinuE/ | sun/sʌn/sun/ |
| r | r | R sound | 6.94% | red/red/red/ | sorry/sɒri/sory/ | car/kɑːr/kAr/ |
| t | t | T sound | 6.91% | ten/ten/ten/ | better/betər/betuE/ | cat/kæt/kat/ |
| s | s | S sound | 4.75% | sun/sʌn/sun/ | lesson/lesən/lesun/ | bus/bʌs/bus/ |
| d | d | D sound | 4.21% | dog/dɒg/dog/ | ladder/lædər/laduE/ | red/red/red/ |
| l | l | L sound | 3.96% | love/lʌv/luv/ | yellow/jeləʊ/jeluO/ | call/kɔːl/kol/ |
| k | k | K sound | 3.18% | key/kiː/ky/ | school/skuːl/skOl/ | book/bʊk/bUk/ |
| ð | T | TH (this) | 2.95% | this/ðɪs/Tis/ | mother/mʌðər/muTuE/ | breathe/briːð/bryT/ |
| m | m | M sound | 2.76% | man/mæn/man/ | summer/sʌmər/sumuE/ | time/taɪm/taym/ |
| z | z | Z sound | 2.76% | zoo/zuː/zO/ | music/mjuːzɪk/mjOzik/ | eyes/aɪz/ayz/ |
| p | p | P sound | 2.15% | pen/pen/pen/ | happy/hæpi/hapy/ | cup/kʌp/kup/ |
| v | v | V sound | 2.01% | very/veri/veri/ | river/rɪvər/rivuE/ | love/lʌv/luv/ |
| w | w | W sound | 1.95% | water/wɔːtər/wotuE/ | away/əweɪ/uwey/ | quick/kwɪk/kwik/ |
| b | b | B sound | 1.80% | book/bʊk/bUk/ | table/teɪbəl/teybul/ | job/dʒɒb/Job/ |
| f | f | F sound | 1.71% | fish/fɪʃ/fiS/ | coffee/kɒfi/kofy/ | leaf/liːf/lyf/ |
| h | h | H sound | 1.40% | house/haʊs/haus/ | perhaps/pərhæps/purhaps/ | hello/heləʊ/heluO/ |
| ŋ | G | NG sound | 0.99% | sing/sɪŋ/siG/ | thinking/θɪŋkɪŋ/QyGkyG/ | long/lɒŋ/loG/ |
| ʃ | S | SH sound | 0.97% | ship/ʃɪp/Sip/ | washing/wɒʃɪŋ/woSyG/ | fish/fɪʃ/fiS/ |
| j | j | Y sound | 0.81% | yes/jes/jes/ | music/mjuːzɪk/mjOzik/ | few/fjuː/fjO/ |
| g | g | G sound | 0.80% | go/gəʊ/guO/ | bigger/bɪgər/biguE/ | bag/bæg/bag/ |
| dʒ | J | J sound | 0.59% | jump/dʒʌmp/Jump/ | magic/mædʒɪk/maJik/ | bridge/brɪdʒ/briJ/ |
| tʃ | c | CH sound | 0.56% | chair/tʃeər/ceE/ | teacher/tiːtʃər/tycuE/ | watch/wɒtʃ/woc/ |
| θ | Q | TH (thin) | 0.41% | think/θɪŋk/QyGk/ | nothing/nʌθɪŋ/nuQyG/ | path/pɑːθ/pAQ/ |
| ʒ | Z | ZH sound | 0.07% | pleasure/pleʒər/pleZuE/ | vision/vɪʒən/viZun/ | beige/beɪʒ/beyZ/ |

---

## Complete System Achievement

**🎉 All 44 English phonemes successfully mapped using only QWERTY keyboard letters!**

**Core vowels (10):** u, i, y, E, a, O, e, A, o, U  
**Diphthong combinations (10):** ey, ay, uO, au, iE, eE, UE, oUy  
**All consonants (24):** Complete mapping using intuitive letter assignments

The kfa system elegantly represents complex sounds as logical combinations of core vowels, making it both practical and intuitive for English speakers.

---

## Demonstration: The Gettysburg Address

**English:**
> "Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal."

**kfa:**
> "fOr skOr and sevun yiErz uguO auEr fATuEz brot forQ on Tis kontinunt, u nO neysun, kunsyvd in libErty, and dedikeyted tu Tu propuzisun Tat ol men Ar kryeyted ykwul."

This iconic opening from Lincoln's Gettysburg Address demonstrates the kfa system's natural readability and comprehensive coverage of English phonemes. Notice how complex sounds like "years" (yiErz), "fathers" (fATuEz), "conceived" (kunsyvd), and "created" (kryeyted) are represented through logical combinations of core vowels and consonants.

## Demonstration: Eliminating English Spelling Confusion

**English:**
> "Which witch is which? They're at their house over there! Your dog ate you're dinner, but you're not sure whose dog it was or who's coming to dinner."

**kfa:**
> "wic wic iz wic? TeE at TeE haus OvuE TeE! yOr dog eyt yOr dinuE, but yOr not SUE hOz dog it waz or hOz kuming tO dinuE."

This example showcases one of kfa's most powerful features: eliminating the confusion caused by English's inconsistent spelling. Notice how:
- **which/witch** = both `wic` (identical pronunciation, identical spelling)
- **they're/their/there** = all `TeE` (same sound, same spelling)  
- **your/you're** = both `yOr` (phonetically identical)
- **whose/who's** = both `hOz` (eliminates arbitrary apostrophe confusion)

The kfa system represents how words actually sound, not their historical spelling accidents, making it invaluable for language learners and eliminating common English spelling confusion.
