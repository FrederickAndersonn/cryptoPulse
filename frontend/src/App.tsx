
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Box, ChakraProvider } from '@chakra-ui/react';
import Navbar from './components/Navbar'; // Import the Navbar component

import CoinsPage from './pages/CoinsPage';
import theme from './theme/theme'; // Import the custom theme

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Box bg="gray.100" minHeight="100vh">
          <Navbar />
          <Routes>
            <Route path="/coins" element={<CoinsPage />} />
          </Routes>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App;
