import React, { useEffect, useState } from 'react';
import { fetchUserProfile, UserProfile } from '../actions/userProfile';
import { updatePassword, UpdatePasswordResponse } from '../actions/userProfile';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  Stack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';

interface Post {
  _id: string;
  heading: string;
  description: string;
}

const UserDetails: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordUpdateMessage, setPasswordUpdateMessage] = useState('');
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  const bg = useColorModeValue('gray.50', 'gray.800');
  const boxBg = useColorModeValue('white', 'gray.700'); // Light mode: white, Dark mode: gray.700
  const textColor = useColorModeValue('black', 'white'); // Light mode: black, Dark mode: white

  useEffect(() => {
    const fetchProfile = async () => {
      const profile = await fetchUserProfile();
      if (profile) {
        setUserProfile(profile);
        fetchUserPosts(profile._id); // Fetch user posts
      }
    };

    fetchProfile();
  }, []);

  const fetchUserPosts = async (userId: string) => {
    try {
      const response = await axios.get(`http://localhost:5001/users/${userId}/posts`);
      setUserPosts(response.data);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found, please login first.');
      return;
    }

    try {
      await axios.delete(`http://localhost:5001/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Remove the deleted post from the local state
      setUserPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

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
    return (
      <Box p={4} bg={bg} minHeight="100vh">
        Loading...
      </Box>
    );
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
        <Button mt={4} colorScheme="teal" onClick={onOpen}>
          Update Password
        </Button>
        <Button mt={4} colorScheme="blue" onClick={() => navigate('/walletdetails')}>
          Go to Wallet Details
        </Button>
      </Flex>

      <Spacer height={8} />
      <Heading as="h2" size="lg" mt={6} mb={4} textAlign="center" color={textColor}>
        Your Posts
      </Heading>
      <Box bg={boxBg} p={4} borderRadius="md" boxShadow="md" width="100%">
        <Stack spacing={4}>
          {userPosts.map((post) => (
            <Box key={post._id} p={4} shadow="md" borderWidth="1px" borderRadius="md" bg={boxBg}>
              <Heading fontSize="lg" color={textColor}>
                {post.heading}
              </Heading>
              <Text mt={2} color={textColor}>
                {post.description}
              </Text>
              <Button mt={4} colorScheme="red" onClick={() => handleDeletePost(post._id)}>
                Delete Post
              </Button>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Password Update Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Password</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handlePasswordUpdate}>
              <FormControl mb={4}>
                <FormLabel>Current Password</FormLabel>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>New Password</FormLabel>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Confirm New Password</FormLabel>
                <Input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </FormControl>
              <Button type="submit" colorScheme="teal" width="full">
                Update Password
              </Button>
            </form>
            {passwordUpdateMessage && (
              <Text mt={4}>
                {passwordUpdateMessage}
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UserDetails;
