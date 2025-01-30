"use client";

import { useEffect, useState } from "react";
import { Box, Text, Spinner, Button, Flex, Heading } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/ui/navbar";
import VerUsuario from "../../../components/usuarios/VerUsuario";

const UsuarioPage = () => {
  const [userId, setUserId] = useState<string | null>(null); // Solo se guarda el ID
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await fetch("/api/protected/auth/me", {
          method: "GET",
          credentials: "include", // Incluye cookies para autenticación
        });

        if (!response.ok) {
          throw new Error("No se pudo autenticar al usuario.");
        }
        const data = await response.json();


        setUserId(data.id); // Solo se guarda el ID
      } catch (error) {
        console.error("Error al obtener la información del usuario:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserId();
  }, []);

  if (loading) {
    return (
      <Box>
        <Navbar />
        <Box p={6} textAlign="center">
          <Spinner size="xl" />
          <Text mt={4}>Cargando datos del usuario...</Text>
        </Box>
      </Box>
    );
  }

  if (!userId) {
    return (
      <Box>
        <Navbar />
        <Box p={6} textAlign="center">
          <Text color="red.500">No se pudo obtener el ID del usuario.</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Navbar */}
      <Navbar />

      {/* Contenido del usuario */}
      <Box p={6}>
        {/* Cabecera con botón Volver y título centrado */}
        <Flex align="center" justify="space-between" mb={6}>
          <Button colorScheme="blue" onClick={() => router.back()}>
            Volver
          </Button>
          <Heading textAlign="center" flex="1">
            Perfil de Usuario
          </Heading>
        </Flex>

        {/* Componente VerUsuario */}
        <VerUsuario userId={userId} />
      </Box>
    </Box>
  );
};

export default UsuarioPage;
