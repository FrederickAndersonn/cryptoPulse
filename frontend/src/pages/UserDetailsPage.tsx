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
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  const bg = useColorModeValue('gray.50', 'gray.900');
  const boxBg = useColorModeValue('white', 'gray.700'); // Light mode: white, Dark mode: gray.700
  const textColor = useColorModeValue('black', 'white'); // Light mode: black, Dark mode: white

  const truncateDescription = (description: string): string => {
    const words = description.split(' ');
    if (words.length > 30) {
      return words.slice(0, 30).join(' ') + ' ...';
    }
    return description;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const profile = await fetchUserProfile();
      if (profile) {
        setUserProfile(profile);
        fetchUserPosts(profile._id); // Fetch user posts
      } else {
        // If user profile fetch fails, navigate to login
        navigate('/login');
      }
    };

    fetchProfile();
  }, [navigate]);

  const fetchUserPosts = async (userId: string) => {
    try {
      const response = await axios.get(`https://cryptopulse-n0ol.onrender.com/users/${userId}/posts`);
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
      await axios.delete(`https://cryptopulse-n0ol.onrender.com/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Remove the deleted post from the local state
      setUserPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
      // Adjust currentPostIndex if necessary
      if (currentPostIndex >= userPosts.length - 1 && currentPostIndex > 0) {
        setCurrentPostIndex(currentPostIndex - 1);
      }
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

  const handleNextPost = () => {
    if (currentPostIndex < userPosts.length - 1) {
      setCurrentPostIndex(currentPostIndex + 1);
    }
  };

  const handlePrevPost = () => {
    if (currentPostIndex > 0) {
      setCurrentPostIndex(currentPostIndex - 1);
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
    <Box width="100%" py={10} px={24} bg={bg} minHeight="100vh">
      <Flex direction="column" align="center" maxW="100%" mx="auto">
        <Heading as="h1" mb={4} textAlign="center" color={textColor} data-testid="user-details-heading">
          User Details
        </Heading>
        <Box bg={boxBg} p={4} borderRadius="md" boxShadow="md" width="100%">
          <Text fontSize="lg" color={textColor} data-testid="user-name">
            <strong>Name:</strong> {userProfile.name}
          </Text>
          <Text fontSize="lg" color={textColor} data-testid="user-email">
            <strong>Email:</strong> {userProfile.email}
          </Text>
          <Text fontSize="lg" color={textColor} data-testid="user-publicKey">
            <strong>Public Key:</strong> {userProfile.publicKey}
          </Text>
          <Button mt={4} mr={4} colorScheme="blue" onClick={() => navigate('/walletdetails')} data-testid="wallet-details-button">
            Go to Wallet Details
          </Button>
          <Button mt={4} colorScheme="teal" onClick={onOpen} data-testid="update-password-button">
            Update Password
          </Button>
        </Box>
        <Spacer height={8} />
      </Flex>

      <Spacer height={8} />
      <Heading as="h2" size="lg" mt={6} mb={4} textAlign="center" color={textColor} data-testid="user-posts-heading">
        Your Posts
      </Heading>
      {userPosts.length > 0 && (
        <Box bg={boxBg} p={4} borderRadius="md" boxShadow="md" width="100%">
          <Box p={4} shadow="md" borderWidth="1px" borderRadius="md" bg={boxBg}>
            <Heading fontSize="lg" color={textColor} data-testid="post-heading">
              {userPosts[currentPostIndex].heading}
            </Heading>
            <Text mt={4} color={textColor} data-testid="post-description">
              {truncateDescription(userPosts[currentPostIndex].description)}
            </Text>
            <Button mt={4} colorScheme="red" onClick={() => handleDeletePost(userPosts[currentPostIndex]._id)} data-testid="delete-post-button">
              Delete Post
            </Button>
          </Box>
          <Flex mt={4} justifyContent="space-between">
            <Button onClick={handlePrevPost} isDisabled={currentPostIndex === 0} data-testid="prev-post-button">
              Previous
            </Button>
            <Button onClick={handleNextPost} isDisabled={currentPostIndex === userPosts.length - 1} data-testid="next-post-button">
              Next
            </Button>
          </Flex>
        </Box>
      )}

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
                  data-testid="current-password-input"
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>New Password</FormLabel>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  data-testid="new-password-input"
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Confirm New Password</FormLabel>
                <Input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  data-testid="confirm-new-password-input"
                />
              </FormControl>
              <Button type="submit" colorScheme="teal" width="full" data-testid="submit-password-button">
                Update Password
              </Button>
            </form>
            {passwordUpdateMessage && (
              <Text mt={4} data-testid="password-update-message">
                {passwordUpdateMessage}
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose} data-testid="close-password-modal-button">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UserDetails;
