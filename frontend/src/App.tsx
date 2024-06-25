import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Box, ChakraProvider } from '@chakra-ui/react';
import Navbar from './components/Navbar'; // Import the Navbar component
import Login from './components/Login'; // Import the Login component
import Signup from './components/Signup'; // Import the SignUp component
import ShowGraph from './components/ShowGraph';
import Forum from './components/Forum';
import CoinsPage from './pages/CoinsPage';
import theme from './theme/theme'; // Import the custom theme
import WalletDetails from './components/WalletDetails';
import Posts from './components/Posts';import SendFundsForm from './components/SendFunds';
import UserDetails from './pages/UserDetailsPage';
import PostDetails from './components/PostDetails';
import HomePage from './components/HomePage';
import CryptoConverterPage from './pages/CryptoConverterPage';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Box bg="gray.100" minHeight="100vh">
          <Navbar />
          <Routes>
          <Route path="/" element={<HomePage />} />
            <Route path="/coins" element={<CoinsPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/coin/:id" element={<ShowGraph />} />
            <Route path="/walletdetails" element={<WalletDetails/>} />
            <Route path="/create-post" element={<Posts/>} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/sendfunds" element={<SendFundsForm />} />
            <Route path="/userdetails" element={<UserDetails />} />
            <Route path="/post/:id" element={<PostDetails />} />
            <Route path="/cryptoconverter" element={<CryptoConverterPage />} />
          </Routes>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App;
