import React from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <header className="App-header">
          <Dashboard />
        </header>
      </div>
    </ThemeProvider>
  );
}

export default App;
