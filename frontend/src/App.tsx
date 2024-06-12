import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Box, ChakraProvider } from '@chakra-ui/react';
import Navbar from './components/Navbar'; // Import the Navbar component
import Login from './components/Login'; // Import the Login component
import Signup from './components/Signup'; // Import the SignUp component
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
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App;
