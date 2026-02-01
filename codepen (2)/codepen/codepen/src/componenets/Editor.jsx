import { Box, styled, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, CircularProgress } from '@mui/material';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { Controlled as ControlledEditor } from 'react-codemirror2';
import { useState } from 'react';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/css/css';
import '../App.css';

// Styled components
const StyledContainer = styled(Box)`
  flex-grow: 1;
  flex-basic: 0;
  display: flex;
  flex-direction: column;
  padding: 0 8px 8px;
`;

const Heading = styled(Box)`
  background: #1d1e22;
  display: flex;
  padding: 9px 12px;
`;

const Header = styled(Box)`
  display: flex;
  background: #060606;
  color: #AAAEBC;
  justify-content: space-between;
  font-weight: 700;
`;

const AIButton = styled(Button)`
  margin-right: 8px;
  min-width: 32px;
  padding: 4px;
`;

const Editor = ({ heading, icon, color, value, onChange }) => {
  const [open, setOpen] = useState(true);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (editor, data, value) => {
    onChange(value);
  };

  const handleAIPrompt = async () => {
    if (!prompt) {
        alert('Please enter a prompt to generate code.'); // Validate prompt input
        return;
    }

    setIsLoading(true);
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer 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` 
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo', // Specify the new model
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 400n
            })
        });

        const data = await response.json();
        if (response.status === 429) {
            alert('You have exceeded your usage quota. Please check your account or try again later.');
        } else if (!response.ok) {
            alert('Error generating code: ' + data.error.message);
        } else {
            onChange(value + '\n' + data.choices[0].message.content.trim()); // Append the generated code
            setAiDialogOpen(false);
            setPrompt('');
        }
    } catch (error) {
        console.error('Error generating code:', error);
        alert('An error occurred while generating code. Please try again.');
    } finally {
        setIsLoading(false);
    }
};


  return (
    <StyledContainer style={open ? null : { flexGrow: 0 }}>
      <Header>
        <Heading>
          <Box
            component="span"
            style={{
              background: color,
              height: 20,
              width: 20,
              display: 'flex',
              placeContent: 'center',
              borderRadius: 5,
              marginRight: 5,
              paddingBottom: 2,
              color: '#000',
            }}
          >
            {icon}
          </Box>
          {heading}
        </Heading>
        <Box display="flex" alignItems="center">
          <AIButton
            variant="contained"
            color="primary"
            onClick={() => setAiDialogOpen(true)}
            title="AI Assistant"
          >
            <SmartToyIcon fontSize="small" />
          </AIButton>
          <CloseFullscreenIcon
            fontSize="small"
            style={{ alignSelf: 'center' }}
            onClick={() => setOpen(prevState => !prevState)}
          />
        </Box>
      </Header>
      <ControlledEditor
        className="controlled-editor"
        value={value}
        onBeforeChange={handleChange}
        options={{
          theme: 'material',
          lineNumbers: true,
        }}
      />

      <Dialog open={aiDialogOpen} onClose={() => setAiDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>AI Code Assistant</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Describe what code you want to generate"
            fullWidth
            multiline
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAiDialogOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleAIPrompt} variant="contained" color="primary" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : 'Generate Code'}
          </Button>
        </DialogActions>
      </Dialog>
    </StyledContainer>
  );
};

export default Editor;
