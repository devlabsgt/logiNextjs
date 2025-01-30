// components/utils/Unauthorized.js
import { Box, Button, Heading, Text, Image } from '@chakra-ui/react';
import { useRouter } from 'next/router';

const Unauthorized = () => {
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
      <Image src="/logo.webp" alt="Logo" mb={4} boxSize="100px" />
      <Heading as="h2" size="xl" mb={4}>
        Acceso Denegado
      </Heading>
      <Text fontSize="lg" mb={6}>
        No tienes permiso para acceder a esta página.
      </Text>
      <Button colorScheme="teal" onClick={handleLoginRedirect}>
        Ir al Inicio de Sesión
      </Button>
    </Box>
  );
};

export default Unauthorized;
