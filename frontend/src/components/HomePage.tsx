import { Flex, Heading, Text, Button, Image } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom'; // Assuming you're using React Router
import MyLogo from '../assets/logo.png'; // Replace with your logo file path

const HomePage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signup');
  };

  return (
    <Flex
      minHeight="100vh"
      align="center"
      justify="center"
      bg="gray.900"
      color="white"
      flexDirection="column"
      padding="2rem"
    >
      <Image src={MyLogo} alt="My Logo" mb="2rem" style={{ width: '300px', height: '100px'}} />
      <Heading as="h1" size="xl" textAlign="center" mb="1rem">
        Cryptopulse
      </Heading>
      <Text fontSize="xl" textAlign="center" mb="2rem">
        See cryptocurrency prices, news, posts, and send money - all in one place!
      </Text>
      <Button colorScheme="teal" size="lg" onClick={handleGetStarted}>
        Get Started
      </Button>
    </Flex>
  );
};

export default HomePage;
