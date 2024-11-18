// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Spacer,
  Text,
  useToast,
  useDisclosure,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  Stack,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { HamburgerIcon } from "@chakra-ui/icons";
import Swal from "sweetalert2";
import VerUsuario from "../components/usuarios/VerUsuario";
import VerUsuarios from "../components/usuarios/VerUsuarios";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  id: string;
  exp: number;
}

interface User {
  _id: string;
  nombre: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  rol: { _id: string; nombre: string }; // No opcional
  activo: boolean;
  sesion: boolean;
}

const Dashboard = () => {
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [reloadDashboard, setReloadDashboard] = useState(false);
  const [showUsuarios, setShowUsuarios] = useState(false); // Controla la vista de usuarios
  const [usuariosCount, setUsuariosCount] = useState({
    total: 0,
    activos: 0,
    inactivos: 0,
    enSesion: 0,
  });

  const handleSessionExpiration = useCallback(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        const userId = decoded.id;

        // Llamada al backend para actualizar `sesion` a false
        fetch(`/api/usuarios/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sesion: false }),
        })
          .then(() => {
            // Mostrar mensaje de sesión expirada
            Swal.fire({
              title: "Sesión expirada",
              text: "Tu sesión ha expirado, por favor inicia sesión nuevamente.",
              icon: "warning",
              confirmButtonText: "Aceptar",
            }).then(() => {
              // Eliminar token y redirigir a login
              localStorage.removeItem("token");
              router.push("/login");
            });
          })
          .catch((error) => {
            console.error("Error al actualizar el estado de la sesión:", error);
            Swal.fire({
              title: "Error",
              text: "Ocurrió un error al actualizar el estado de la sesión.",
              icon: "error",
              confirmButtonText: "Aceptar",
            }).then(() => {
              localStorage.removeItem("token");
              router.push("/login");
            });
          });
      } catch (error) {
        console.error("Error al decodificar el token:", error);
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [router]);


  const startSessionExpirationTimer = useCallback(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: DecodedToken = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiration = decoded.exp - currentTime;

      if (timeUntilExpiration > 0) {
        setTimeout(() => {
          handleSessionExpiration();
        }, timeUntilExpiration * 1000);
      } else {
        handleSessionExpiration();
      }
    }
  }, [handleSessionExpiration]);

  const refreshUserData = useCallback(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: DecodedToken = jwtDecode(token);
      const userId = decoded.id;

      fetch(`/api/usuarios/${userId}`)
        .then((response) => response.json())
        .then((data: User) => {
          setUserName(data.nombre);
          setUserRole(data.rol.nombre);
          setUserData(data);
        })
        .catch((error) => {
          console.error("Error al obtener los detalles del usuario:", error);
          router.push("/");
        });
    } else {
      router.push("/");
    }
  }, [router]);

  const fetchUsuariosCount = useCallback(() => {
    fetch("/api/usuarios/count")
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setUsuariosCount({
            total: data.total,
            activos: data.activos,
            inactivos: data.inactivos,
            enSesion: data.enSesion,
          });
        }
      })
      .catch((error) => console.error("Error al obtener el conteo de usuarios:", error));
  }, []);

  useEffect(() => {
    startSessionExpirationTimer();
    fetchUsuariosCount();
  }, [startSessionExpirationTimer, fetchUsuariosCount]);

  useEffect(() => {
    if (reloadDashboard) {
      refreshUserData();
      setReloadDashboard(false);
    }
  }, [reloadDashboard, refreshUserData]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Deseas cerrar sesión?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded: DecodedToken = jwtDecode(token);
          const userId = decoded.id;

          await fetch(`/api/usuarios/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sesion: false }),
          });

          localStorage.removeItem("token");
          toast({
            title: "Sesión cerrada",
            description: "Has cerrado sesión correctamente.",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          router.push("/login");
        } catch (error) {
          toast({
            title: "Error",
            description: "Ocurrió un error al cerrar sesión: " + error,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      }
    }
  };

  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  return (
    <Box>
      {/* Navbar */}
      <Flex as="nav" p={4} bg="gray.100" color="black" align="center">
        <Stack spacing={0} align="start">
          <Image src="/logo.webp" alt="Logo" height="75px" width="auto" />
        </Stack>
        <Spacer />

        {/* Botón para abrir el Drawer siempre visible */}
        <IconButton
          icon={<HamburgerIcon boxSize={10} />}
          aria-label="Menu"
          onClick={onDrawerOpen}
        />
      </Flex>

      {/* Drawer que contiene las opciones de navegación */}
      <Drawer isOpen={isDrawerOpen} placement="right" onClose={onDrawerClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <Stack spacing={0}>
              <Text fontSize="sm" color="blue.500">
                {userName || "Cargando..."}
              </Text>
              <Text fontSize="xs" color="blue.300">
                Rol: {userRole || ""}
              </Text>
            </Stack>
          </DrawerHeader>
          <DrawerBody>
            <Button
              width="full"
              colorScheme="blue"
              mb={3}
              onClick={() => { onOpen(); onDrawerClose(); }} // Cierra el drawer cuando se hace clic
            >
              Ver Perfil
            </Button>
            <Button
              width="full"
              colorScheme="red"
              onClick={() => { handleLogout(); onDrawerClose(); }} // Cierra el drawer cuando se cierra sesión
            >
              Cerrar sesión
            </Button>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Contenido del Dashboard */}
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="0vh">
        {showUsuarios ? (
          <VerUsuarios onBack={() => setShowUsuarios(false)} />
        ) : (
          <>
            <Heading>Bienvenido al Dashboard</Heading>
            <Card
              mt={6}
              p={4}
              borderRadius="md"
              boxShadow="lg"
              bg="white"
              _hover={{ transform: "scale(1.03)", boxShadow: "xl" }}
              transition="all 0.2s ease-in-out"
              cursor="pointer"
              onClick={() => setShowUsuarios(true)}
            >
              {/* Encabezado */}
              <CardBody>
                <Box textAlign="center" mb={6}>
                  <Heading size="lg" color="blue.600" fontWeight="bold">
                    Usuarios del Sistema
                  </Heading>
                  <Text fontSize="sm" color="gray.500">
                    Administración y Gestión
                  </Text>
                </Box>

                {/* Conteos */}
                <Flex gap={4}>
                  {/* Usuarios Activos */}
                  
                  <Box
                    flex="1"
                    bg="green.50"
                    py={4}
                    borderRadius="md"
                    textAlign="center"
                    boxShadow="inner"
                  >
                    <Text fontSize="3xl" fontWeight="bold" color="green.700">
                      {usuariosCount.enSesion}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Usuarios en <><br/></>Sesión
                    </Text>
                  </Box>

                  <Box
                    flex="1"
                    bg="blue.50"
                    py={4}
                    borderRadius="md"
                    textAlign="center"
                    boxShadow="inner"
                  >
                    <Text fontSize="3xl" fontWeight="bold" color="blue.700">
                      {usuariosCount.activos}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Usuarios <><br/></>Activos
                    </Text>
                  </Box>

                  {/* Usuarios Inactivos */}
                  <Box
                    flex="1"
                    bg="red.50"
                    py={4}
                    borderRadius="md"
                    textAlign="center"
                    boxShadow="inner"
                  >
                    <Text fontSize="3xl" fontWeight="bold" color="red.700">
                      {usuariosCount.inactivos}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Usuarios <><br/></> Inactivos
                    </Text>
                  </Box>
                </Flex>

              </CardBody>

              {/* Footer */}
              <Box
                p={3}
                mt={4}
                bg="blue.100"
                borderTop="1px solid"
                borderColor="blue.300"
                borderRadius="md"
                textAlign="center"
              >
                <Text fontSize="md" fontWeight="medium" color="blue.1000">
                  Haz clic para ver todos los usuarios
                </Text>
              </Box>
            </Card>




          </>
        )}
      </Box>

      {/* Modal de perfil */}
      {userData && (
        <VerUsuario
          isOpen={isOpen}
          onClose={() => {
            onClose();
            setReloadDashboard(true);
          }}
          userData={userData}
          setUserData={setUserData}
        />
      )}
    </Box>
  );
};

export default Dashboard;
