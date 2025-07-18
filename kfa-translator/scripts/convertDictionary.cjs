const fs = require('fs');
const path = require('path');

// Read the original ipadict.txt file
const dictPath = path.join(__dirname, '../public/data/ipadict.txt');
const outputPath = path.join(__dirname, '../public/data/ipadict.json');

function convertDictionary() {
  console.log('Reading ipadict.txt...');
  const content = fs.readFileSync(dictPath, 'utf8');
  
  const lines = content.split('\n').filter(line => line.trim());
  const dictionary = Object.create(null); // Use null prototype to avoid built-in properties
  
  console.log(`Processing ${lines.length} lines...`);
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    // Find first whitespace character (space or tab)
    const firstWhitespaceIndex = line.search(/\s/);
    if (firstWhitespaceIndex === -1) continue;
    
    // Extract english word (everything before first whitespace)
    const english = line.substring(0, firstWhitespaceIndex).trim().toLowerCase();
    
    // Find first non-whitespace character after the english word
    const restOfLine = line.substring(firstWhitespaceIndex);
    const ipaMatch = restOfLine.match(/\S.*/);
    if (!ipaMatch) continue;
    
    const ipa = ipaMatch[0].trim();
    
    if (english && ipa) {
      // Remove variant markers like (1), (2) from english word for grouping
      const cleanEnglish = english.replace(/\(\d+\)$/, '');
      
      // Initialize word entry if it doesn't exist
      if (!dictionary[cleanEnglish]) {
        dictionary[cleanEnglish] = [];
      }
      
      
      // Add pronunciation entry
      dictionary[cleanEnglish].push({
        ipa: ipa,
        priority: dictionary[cleanEnglish].length + 1, // 1-indexed priority
        region: "" // Empty string to start with
      });
    }
  }
  
  console.log('Writing JSON file...');
  fs.writeFileSync(outputPath, JSON.stringify(dictionary, null, 2));
  
  console.log(`Conversion complete! Created dictionary with ${Object.keys(dictionary).length} words.`);
  console.log(`Output saved to: ${outputPath}`);
  
  // Print some statistics
  const totalPronunciations = Object.values(dictionary).reduce((sum, pronunciations) => sum + pronunciations.length, 0);
  const wordsWithVariants = Object.values(dictionary).filter(pronunciations => pronunciations.length > 1).length;
  
  console.log(`\nStatistics:`);
  console.log(`- Total pronunciations: ${totalPronunciations}`);
  console.log(`- Words with variants: ${wordsWithVariants}`);
  console.log(`- Average pronunciations per word: ${(totalPronunciations / Object.keys(dictionary).length).toFixed(2)}`);
  
  // Show some examples
  console.log(`\nSample entries:`);
  const sampleWords = ['a', 'be', 'and', 'the', 'to'].filter(word => dictionary[word]);
  sampleWords.forEach(word => {
    console.log(`- ${word}: ${dictionary[word].length} pronunciation(s)`);
    dictionary[word].forEach((entry, index) => {
      console.log(`  ${index + 1}. ${entry.ipa} (priority: ${entry.priority})`);
    });
  });
}

convertDictionary();