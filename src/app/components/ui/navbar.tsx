"use client";

import {
  Box,
  Button,
  Flex,
  IconButton,
  Image,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  Stack,
  Text,
  useDisclosure,
  Divider
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Navbar = () => {
  const router = useRouter();
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const [userName, setUserName] = useState<string>("Cargando...");
  const [userRole, setUserRole] = useState<string>("Cargando...");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Solicitar al servidor la decodificación del token
        const response = await fetch("/api/protected/auth/me", {
          method: "GET",
          credentials: "include", // Incluir cookies en la solicitud
        });

        if (!response.ok) {
          throw new Error("No se pudo autenticar al usuario.");
        }

        const data = await response.json();
        setUserName(data?.email || "Usuario"); // Validar datos
        setUserRole(data?.rol || "Sin rol"); // Validar datos
      } catch (error) {
        console.error("Error al autenticar al usuario:", error);
        router.push("/login");
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/protected/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al cerrar sesión");
      }

      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <>
      {/* Navbar */}
      <Flex as="nav" p={4} bg="gray.100" color="black" align="center">
        <Stack spacing={0} align="start">
          <Image src="/logo.webp" alt="Logo" height="75px" width="auto" />
        </Stack>
        <Box ml="auto">
          <IconButton
            icon={<HamburgerIcon boxSize={10} />}
            aria-label="Menu"
            onClick={onDrawerOpen}
          />
        </Box>
      </Flex>

      {/* Drawer */}
      <Drawer isOpen={isDrawerOpen} placement="right" onClose={onDrawerClose}>
        <DrawerOverlay/>
        <DrawerContent>
          <DrawerHeader>
            <Stack spacing={0}>
              <Text fontSize="sm"                 
                color={
                    userRole === "Super"
                      ? "purple.600"
                      : userRole === "Admin"
                      ? "green.600"
                      : "blue.600"
                  }>
                {typeof userName === "string" ? userName : "Usuario"}
              </Text>
              <Text
                fontSize="xs"
                color={
                  userRole === "Super"
                    ? "purple.500"
                    : userRole === "Admin"
                    ? "green.500"
                    : "blue.500"
                }
              >
                Rol: {typeof userRole === "string" ? userRole : "Sin rol"}
              </Text>

              <Divider borderColor={
                  userRole === "Super"
                    ? "purple.200"
                    : userRole === "Admin"
                    ? "green.200"
                    : "blue.200"
                } width="100%" borderWidth="2px" mt="5" />

            </Stack>
          </DrawerHeader>
          <DrawerBody>
            <Button
              width="full"
              colorScheme="blue"
              mb={3}
              onClick={() => {
                router.push("/dashboard/usuarios/me");
                onDrawerClose();
              }}
            >
              Mi Perfil
            </Button>
            <Button width="full" colorScheme="red" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Navbar;

