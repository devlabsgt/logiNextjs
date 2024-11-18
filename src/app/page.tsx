// src/app/page.tsx
"use client";

import { Box, Button, Heading, VStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

const HomePage = () => {
  const router = useRouter();

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <VStack spacing={4}>
        <Heading>Bienvenido a la Aplicación</Heading>
        <Button colorScheme="blue" onClick={() => router.push("/login")}>
          Ir a Iniciar Sesión
        </Button>
      </VStack>
    </Box>
  );
};

export default HomePage;
