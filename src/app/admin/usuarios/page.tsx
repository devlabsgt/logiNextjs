"use client";

import { Box } from "@chakra-ui/react";
import Navbar from "../../components/ui/navbar";
import VerUsuarios from "../../components/usuarios/VerUsuarios"; // Importar el nuevo componente

const UsuariosPage = () => {
  return (
    <Box>
      {/* Navbar */}
      <Navbar />
      {/* Contenido principal: Componente VerUsuarios */}
      <VerUsuarios rol="super" />
    </Box>
  );
};

export default UsuariosPage;
