// app/unauthorized/page.tsx
'use client';

import { Box, Button, Heading, Text, Image, Flex } from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';

const UnauthorizedPage = () => {
  const router = useRouter();

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  return (
    <Box
      textAlign="center"
      py={10}
      px={6}
      minH="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Image src="/logo.webp" alt="Logo" mb={4} maxHeight="300px" />
      <Heading as="h2" size="xl" mb={4} color="red">
        Acceso Denegado
      </Heading>
      <Text fontSize="lg" mb={6} color="red">
        No tienes permiso para acceder a esta página.
      </Text>
      <Box
        bg="yellow.100"
        border="1px"
        borderColor="yellow.400"
        borderRadius="md"
        p={4}
        mb={6}
        display="flex"
        alignItems="center"
        justifyContent="center"
        maxWidth="400px"
      >
        <WarningIcon boxSize={10} color="yellow.500" mr={2} />
        <Text fontSize="md" color="yellow.700">
          Por favor, verifica tus credenciales o contacta al administrador del sistema.
        </Text>
      </Box>

      {/* Botones */}
      <Flex gap={4}>

                
        <Button
          colorScheme="blue"
          onClick={() => router.back()}
          p={8}
          fontSize="2xl"
        >
          Volver
        </Button>
        <Button
          bg="green"
          color="white"
          _hover={{ bg: "#005bb5" }}
          onClick={handleLoginRedirect}
          p={8}
          fontSize="2xl"
        >
          Ir al Inicio de Sesión
        </Button>

      </Flex>
    </Box>
  );
};

export default UnauthorizedPage;
