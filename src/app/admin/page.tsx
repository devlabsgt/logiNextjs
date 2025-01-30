"use client";

import { Box, Heading, Text, Card, CardBody, VStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import Navbar from "../components/ui/navbar";

const Admin = () => {
  const router = useRouter();

  return (
    <Box>
      {/* Navbar */}
      <Navbar />

      {/* Contenido principal */}
      <VStack spacing={6} align="center" p={6}>
        <Heading textAlign="center">Bienvenido al Dashboard de Administrador</Heading>
        <Text>Selecciona una opción para empezar.</Text>
        
        {/* Otros cards adicionales */}
        <Card
          w="full"
          maxW="400px"
          bg="white"
          borderRadius="md"
          boxShadow="lg"
          cursor="pointer"
          _hover={{ transform: "scale(1.03)", boxShadow: "xl" }}
          transition="all 0.2s ease-in-out"
          onClick={() => router.push("/admin/usuarios")}
        >
          <CardBody>
            <Box textAlign="center">
              <Heading size="md" color="green.400">
                Gestión de Usuarios
              </Heading>
              <Text fontSize="sm" color="gray.600">
                Administra usuarios y roles del sistema.
              </Text>
            </Box>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default Admin;
