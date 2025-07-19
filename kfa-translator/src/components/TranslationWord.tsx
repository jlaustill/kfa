import { useState } from 'react';
import { 
  Typography, 
  Menu, 
  MenuItem, 
  Box,
  Chip 
} from '@mui/material';
import type { IWordTranslation } from '../types';

interface ITranslationWordProps {
  word: IWordTranslation;
  format: 'english' | 'ipa' | 'kfa';
  onPronunciationChange: (newPronunciationIndex: number) => void;
}

export default function TranslationWord({ 
  word, 
  format, 
  onPronunciationChange 
}: ITranslationWordProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: any) => {
    if (word.hasMultiplePronunciations) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (pronunciationIndex: number) => {
    onPronunciationChange(pronunciationIndex);
    handleClose();
  };

  const currentPronunciation = word.pronunciations[word.selectedPronunciation];
  const displayText = currentPronunciation[format];

  return (
    <>
      <Typography
        component="span"
        sx={{
          textDecoration: word.hasMultiplePronunciations ? 'underline' : 'none',
          cursor: word.hasMultiplePronunciations ? 'pointer' : 'default',
          textDecorationStyle: word.hasMultiplePronunciations ? 'solid' : 'none',
          textDecorationThickness: word.hasMultiplePronunciations ? '2px' : 'auto',
          textUnderlineOffset: word.hasMultiplePronunciations ? '4px' : 'auto',
          '&:hover': word.hasMultiplePronunciations ? {
            backgroundColor: 'action.hover',
            borderRadius: '4px',
            padding: '2px 4px',
            margin: '-2px -4px'
          } : {}
        }}
        onClick={handleClick}
        title={word.hasMultiplePronunciations ? 'Click to see other pronunciations' : undefined}
      >
        {displayText}
      </Typography>

      {word.hasMultiplePronunciations && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: { maxWidth: '300px' }
          }}
        >
          {word.pronunciations.map((pronunciation, index) => (
            <MenuItem
              key={index}
              onClick={() => handleSelect(index)}
              selected={index === word.selectedPronunciation}
              sx={{ flexDirection: 'column', alignItems: 'stretch' }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {pronunciation[format]}
                </Typography>
                <Chip 
                  label={`Priority ${pronunciation.priority}`} 
                  size="small" 
                  color={pronunciation.priority === 1 ? 'primary' : 'default'}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, fontSize: '0.75rem' }}>
                <Typography variant="caption">
                  IPA: {pronunciation.ipa}
                </Typography>
                <Typography variant="caption">
                  kfa: {pronunciation.kfa}
                </Typography>
              </Box>
              {pronunciation.region && (
                <Typography variant="caption" color="text.secondary">
                  Region: {pronunciation.region}
                </Typography>
              )}
            </MenuItem>
          ))}
        </Menu>
      )}
    </>
  );
}