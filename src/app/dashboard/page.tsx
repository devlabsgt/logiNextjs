"use client";

import { Box, Heading, Text, Card, CardBody, VStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import Navbar from "../components/ui/navbar";

const Dashboard = () => {
  const router = useRouter();

  return (
    <Box>
      {/* Navbar */}
      <Navbar />

      {/* Contenido principal */}
      <VStack spacing={6} align="center" p={6}>
        <Heading>Bienvenido al Dashboard</Heading>
        <Text>Selecciona una opción para empezar.</Text>
        
      </VStack>
    </Box>
  );
};

export default Dashboard;
