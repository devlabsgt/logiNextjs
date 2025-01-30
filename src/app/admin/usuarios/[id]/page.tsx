"use client";

import { useParams } from "next/navigation"; // Importa useParams
import { Box, Text, Spinner, Button, Flex, Heading } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/ui/navbar";
import VerUsuario from "../../../components/usuarios/VerUsuario";

const UsuarioPage = () => {
  const params = useParams();
  const userId = Array.isArray(params.id) ? params.id[0] : params.id; // Asegura que sea string
  const router = useRouter();

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

        {/* Componente VerUsuario con ID de la URL */}
        <VerUsuario userId={userId} />
      </Box>
    </Box>
  );
};

export default UsuarioPage;
