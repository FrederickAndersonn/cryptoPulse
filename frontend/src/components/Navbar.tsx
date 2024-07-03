import React, { useState } from "react";
import {
  Box,
  Flex,
  Link,
  IconButton,
  useColorMode,
  Spacer,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  useDisclosure,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import {
  FaMoon,
  FaSun,
  FaCoins,
  FaBars,
  FaForumbee,
  FaMoneyCheckAlt,
  FaExchangeAlt,
  FaNewspaper,
  FaRobot,
} from "react-icons/fa";

import logo from "../assets/small_logo.png";

const Navbar: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isDark = colorMode === "dark";
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("token") !== null
  );

  // Function to check screen size and set state accordingly
  const checkScreenSize = () => {
    setIsSmallScreen(window.innerWidth < 768); // Adjust the breakpoint as needed
  };

  // Listen to window resize events
  React.useEffect(() => {
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Function to handle logout
  const handleLogout = () => {
    // Clear token from localStorage
    localStorage.removeItem("token");
    // Update state to reflect user is logged out
    setIsLoggedIn(false);
  };

  return (
    <Box
      bg={isDark ? "gray.800" : "brand.300"}
      color={"white"}
      px={4}
      py={2}
      width="100%"
    >
      <Flex justify="space-between" align="center" maxWidth="1200px" mx="auto">
        {isSmallScreen && (
          <IconButton
            icon={<FaBars color={"white"} />}
            aria-label="Open menu"
            onClick={onOpen}
            bg="transparent"
            _hover={{ bg: "transparent" }}
            isRound
            size="sm"
            mr={2}
          />
        )}
        {/* Logo/Home Link */}
        {!isSmallScreen && (
          <Flex align="center">
            <Link
              as={RouterLink}
              to="/"
              display="flex"
              alignItems="center"
              mr={4}
              _hover={{
                textDecoration: "none",
                bg: "teal.600",
                borderRadius: "md",
                color: "black",
              }}
              p={2}
            >
              <img src={logo} alt="Logo" style={{ width: "50px", height: "50px" }} />
              <Box as="span" ml={2} fontSize="lg">
                Home
              </Box>
            </Link>

            {/* Coins Link */}
            <Link
              as={RouterLink}
              to="/coins"
              display="flex"
              alignItems="center"
              mr={4}
              _hover={{
                textDecoration: "none",
                bg: "teal.600",
                borderRadius: "md",
                color: "black",
              }}
              p={2}
            >
              <FaCoins color={"white"} />
              <Box as="span" ml={2} fontSize="lg">
                Coins
              </Box>
            </Link>

            {/* Forum Link */}
            <Link
              as={RouterLink}
              to="/forum"
              display="flex"
              alignItems="center"
              mr={4}
              _hover={{
                textDecoration: "none",
                bg: "teal.600",
                borderRadius: "md",
                color: "black",
              }}
              p={2}
            >
              <FaForumbee color={"white"} />
              <Box as="span" ml={2} fontSize="lg">
                Forum
              </Box>
            </Link>

             {/* Transfer Link */}
             <Link
              as={RouterLink}
              to="/sendfunds"
              display="flex"
              alignItems="center"
              mr={4}
              _hover={{
                textDecoration: "none",
                bg: "teal.600",
                borderRadius: "md",
                color: "black",
              }}
              p={2}
            >
              <FaMoneyCheckAlt color={"white"} />
              <Box as="span" ml={2} fontSize="lg">
                Transfer
              </Box>
            </Link>

            {/* Converter Link */}
            <Link
              as={RouterLink}
              to="/cryptoconverter"
              display="flex"
              alignItems="center"
              mr={4}
              _hover={{
                textDecoration: "none",
                bg: "teal.600",
                borderRadius: "md",
                color: "black",
              }}
              p={2}
            >
              <FaExchangeAlt color={"white"} />
              <Box as="span" ml={2} fontSize="lg">
                Converter
              </Box>
            </Link>

            {/* News Link */}
            <Link
              as={RouterLink}
              to="/news"
              display="flex"
              alignItems="center"
              mr={4}
              _hover={{
                textDecoration: "none",
                bg: "teal.600",
                borderRadius: "md",
                color: "black",
              }}
              p={2}
            >
              <FaNewspaper color={"white"} />
              <Box as="span" ml={2} fontSize="lg">
                News
              </Box>
            </Link>

              {/* AI Prediction Link */}
              <Link
              as={RouterLink}
              to="/prediction"
              display="flex"
              alignItems="center"
              mr={4}
              _hover={{
                textDecoration: "none",
                bg: "teal.600",
                borderRadius: "md",
                color: "black",
              }}
              p={2}
            >
              <FaRobot color={"white"} />
              <Box as="span" ml={2} fontSize="lg">
                AI
              </Box>
            </Link>
          </Flex>
        )}
        {/* Remaining items (Login/Logout, Dark Mode) */}
        {!isSmallScreen && (
          <Flex align="center">
            {/* Conditional rendering of Login/Logout link */}
            {isLoggedIn ? (
              <Link
                as={RouterLink}
                to="/"
                color={"white"}
                onClick={handleLogout}
                mr={4}
                _hover={{
                  textDecoration: "none",
                  bg: "teal.600",
                  borderRadius: "md",
                  color: "black",
                }}
                p={2}
              >
                Logout
              </Link>
            ) : (
              <>
                {/* Login Link */}
                <Link
                  as={RouterLink}
                  to="/login"
                  color={"white"}
                  mr={4}
                  _hover={{
                    textDecoration: "none",
                    bg: "teal.600",
                    borderRadius: "md",
                    color: "black",
                  }}
                  p={2}
                >
                  Login
                </Link>

                {/* Sign Up Link */}
                <Link
                  as={RouterLink}
                  to="/signup"
                  color={"white"}
                  mr={4}
                  _hover={{
                    textDecoration: "none",
                    bg: "teal.600",
                    borderRadius: "md",
                    color: "black",
                  }}
                  p={2}
                >
                  Sign Up
                </Link>
              </>
            )}

            <Spacer />

            {/* User profile Link */}
            <Link
              as={RouterLink}
              to="/userdetails"
              color={"white"}
              _hover={{
                textDecoration: "none",
                bg: "teal.600",
                borderRadius: "md",
                color: "black",
              }}
              p={2}
            >
              User Profile
            </Link>

            {/* Dark Mode Toggle */}
            <IconButton
              icon={isDark ? <FaSun color="white" /> : <FaMoon color="white" />}
              aria-label="Toggle Dark Mode"
              onClick={toggleColorMode}
              bg="transparent"
              _hover={{ bg: "teal.600" }}
              ml={4}
            />
          </Flex>
        )}
      </Flex>

      {/* Drawer for small screens */}
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent
          bg={isDark ? "gray.800" : "brand.300"}
          color={isDark ? "white" : "white"}
        >
          <DrawerCloseButton />
          <DrawerBody>
            <Flex direction="column" align="start" p={4}>
              {/* Home Link */}
              <Link
                as={RouterLink}
                to="/"
                color={"white"}
                display="block"
                py={2}
                onClick={onClose}
                _hover={{ bg: "teal.600", borderRadius: "md", color: "black" }}
              >
                Home
              </Link>

              {/* Coins Link */}
              <Link
                as={RouterLink}
                to="/coins"
                color={"white"}
                display="block"
                py={2}
                onClick={onClose}
                _hover={{ bg: "teal.600", borderRadius: "md", color: "black" }}
              >
                Coins
              </Link>

              {/* Forum Link */}
              <Link
                as={RouterLink}
                to="/forum"
                color={"white"}
                display="block"
                py={2}
                onClick={onClose}
                _hover={{ bg: "teal.600", borderRadius: "md", color: "black" }}
              >
                Forum
              </Link>

              {/* Transfer Link */}
              <Link
                as={RouterLink}
                to="/sendfunds"
                color={"white"}
                display="block"
                py={2}
                onClick={onClose}
                _hover={{ bg: "teal.600", borderRadius: "md", color: "black" }}
              >
                Transfer
              </Link>

              {/* Converter Link */}
              <Link
                as={RouterLink}
                to="/cryptoconverter"
                color={"white"}
                display="block"
                py={2}
                onClick={onClose}
                _hover={{ bg: "teal.600", borderRadius: "md", color: "black" }}
              >
                Converter
              </Link>

              {/* News Link */}
              <Link
                as={RouterLink}
                to="/news"
                color={"white"}
                display="block"
                py={2}
                onClick={onClose}
                _hover={{ bg: "teal.600", borderRadius: "md", color: "black" }}
              >
                News
              </Link>

              {/* AI Prediction Link */}
            <Link
              as={RouterLink}
              to="/prediction"
              color={"white"}
              display="block"
              py={2}
              onClick={onClose}
              _hover={{ bg: "teal.600", borderRadius: "md", color: "black" }}
            >
              AI
            </Link>
              {/* Conditional rendering of Login/Logout link in Drawer */}
              {isLoggedIn ? (
                <Link
                  as={RouterLink}
                  to="/"
                  color={"white"}
                  display="block"
                  py={2}
                  onClick={() => {
                    handleLogout();
                    onClose();
                  }}
                  _hover={{
                    bg: "teal.600",
                    borderRadius: "md",
                    color: "black",
                  }}
                >
                  Logout
                </Link>
              ) : (
                <>
                  {/* Login Link */}
                  <Link
                    as={RouterLink}
                    to="/login"
                    color={"white"}
                    display="block"
                    py={2}
                    onClick={onClose}
                    _hover={{
                      bg: "teal.600",
                      borderRadius: "md",
                      color: "black",
                    }}
                  >
                    Login
                  </Link>

                  {/* Sign Up Link */}
                  <Link
                    as={RouterLink}
                    to="/signup"
                    color={"white"}
                    display="block"
                    py={2}
                    onClick={onClose}
                    _hover={{
                      bg: "teal.600",
                      borderRadius: "md",
                      color: "black",
                    }}
                  >
                    Sign Up
                  </Link>
                </>
              )}

              {/* User profile Link */}
              <Link
                as={RouterLink}
                to="/userdetails"
                color={"white"}
                display="block"
                py={2}
                onClick={onClose}
                _hover={{
                  bg: "teal.600",
                  borderRadius: "md",
                  color: "black",
                }}
              >
                User Profile
              </Link>

              {/* Dark Mode Toggle */}
              <IconButton
                icon={
                  isDark ? <FaSun color="white" /> : <FaMoon color="white" />
                }
                aria-label="Toggle Dark Mode"
                onClick={() => {
                  toggleColorMode();
                  onClose();
                }}
                bg="transparent"
                _hover={{ bg: "teal.600" }}
                mt={4}
              />
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Navbar;
