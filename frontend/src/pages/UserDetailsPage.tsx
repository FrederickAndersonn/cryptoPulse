import React, { useEffect, useState } from 'react';
import { fetchUserProfile, UserProfile } from '../actions/userProfile';
import { updatePassword, UpdatePasswordResponse } from '../actions/userProfile';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Input,
  Text,
  Button,
  FormControl,
  FormLabel,
  useColorModeValue,
  Flex,
  Spacer,
} from '@chakra-ui/react';

const UserDetails: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordUpdateMessage, setPasswordUpdateMessage] = useState('');
  const navigate = useNavigate();

  const bg = useColorModeValue('gray.50', 'gray.800');
  const boxBg = useColorModeValue('white', 'gray.700'); // Light mode: white, Dark mode: gray.700
  const textColor = useColorModeValue('black', 'white'); // Light mode: black, Dark mode: white

  useEffect(() => {
    const fetchProfile = async () => {
      const profile = await fetchUserProfile();
      if (profile) {
        setUserProfile(profile);
      }
    };

    fetchProfile();
  }, []);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setPasswordUpdateMessage('New password and confirm new password do not match.');
      return;
    }

    const response: UpdatePasswordResponse | null = await updatePassword(currentPassword, newPassword);
    if (response) {
      setPasswordUpdateMessage(response.msg);
    } else {
      setPasswordUpdateMessage('Password update failed.');
    }
  };

  if (!userProfile) {
    return <Box p={4} bg={bg} minHeight="100vh">Loading...</Box>;
  }

  return (
    <Box width="100%" p={4} bg={bg} minHeight="100vh">
      <Flex direction="column" align="center" maxW="40%" mx="auto">
        <Heading as="h1" mb={4} textAlign="center" color={textColor}>
          User Details
        </Heading>
        <Box bg={boxBg} p={4} borderRadius="md" boxShadow="md" width="100%">
          <Text fontSize="lg" color={textColor}>
            <strong>Name:</strong> {userProfile.name}
          </Text>
          <Text fontSize="lg" color={textColor}>
            <strong>Email:</strong> {userProfile.email}
          </Text>
          <Text fontSize="lg" color={textColor}>
            <strong>Public Key:</strong> {userProfile.publicKey}
          </Text>
        </Box>
        <Spacer height={8} />
        <Heading as="h2" size="lg" mt={6} mb={4} textAlign="center" color={textColor}>
          Update Password
        </Heading>
        <Box bg={boxBg} p={4} borderRadius="md" boxShadow="md" width="100%">
          <form onSubmit={handlePasswordUpdate}>
            <FormControl mb={4}>
              <FormLabel color={textColor}>Current Password</FormLabel>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                bg={bg}
                color={textColor}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel color={textColor}>New Password</FormLabel>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                bg={bg}
                color={textColor}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel color={textColor}>Confirm New Password</FormLabel>
              <Input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                bg={bg}
                color={textColor}
              />
            </FormControl>
            <Button type="submit" colorScheme="teal" width="full">
              Update Password
            </Button>
          </form>
          {passwordUpdateMessage && (
            <Text mt={4} color={textColor}>
              {passwordUpdateMessage}
            </Text>
          )}
        </Box>
        <Button mt={4} colorScheme="blue" onClick={() => navigate('/walletdetails')}>
          Go to Wallet Details
        </Button>
      </Flex>
    </Box>
  );
};

export default UserDetails;
