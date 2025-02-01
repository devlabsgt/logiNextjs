"use client";

import {
  Box,
  Heading,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Input,
  Button,
  Spinner,
  useToast,
  Flex,
  Select,
} from "@chakra-ui/react";
import { FaUser } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NuevoUsuario from "./NuevoUsuario";

interface Usuario {
  _id: string;
  email: string;
  rol: {
    nombre: string;
  } | null;
  cliente?: {
    nombre: string;
  };
  activo: boolean;
  verificado: boolean;
  sesion: string | null;
}


const VerUsuarios = ({ rol }: { rol: string }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetails, setShowDetails] = useState(false);

  const toast = useToast();
  const router = useRouter();

const fetchUsuarios = async () => {
  try {
    const response = await fetch("/api/protected/usuarios");

    if (!response.ok) throw new Error("Error al obtener usuarios");
    const data: Usuario[] = await response.json();

    const sortedData = data.sort((a, b) => a.email.localeCompare(b.email));
    setUsuarios(sortedData);
    setFilteredUsuarios(sortedData);
  } catch (error) {
    toast({
      title: "Error",
      description: "No se pudo cargar la lista de usuarios.",
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchUsuarios();
}, [])


  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsuarios(usuarios);
    } else {
      const searchLower = searchTerm.toLowerCase();
      setFilteredUsuarios(
        usuarios.filter(
          (user) =>
            user.email.toLowerCase().includes(searchLower) ||
            user.rol?.nombre?.toLowerCase().includes(searchLower) ||
            user.cliente?.nombre?.toLowerCase().includes(searchLower)
        )
      );
    }
    setCurrentPage(1);
  }, [searchTerm, usuarios]);

  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers =
    itemsPerPage === 0
      ? filteredUsuarios
      : filteredUsuarios.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Box>
      <VStack spacing={6} align="center" p={6}>
        <Flex w="full" maxW="1000px" align="center" justify="space-between">
          <Button colorScheme="blue" onClick={() => router.back()}>
            Atrás
          </Button>
          
          <Heading>Lista de Usuarios</Heading>
        </Flex>

        <Flex w="full" maxW="1000px" align="center" justify="space-between">
          <Input
            placeholder="Buscar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            maxW="700px"
            textAlign="center"
            marginRight="1em"
          />
          <Button colorScheme="green" onClick={() => setIsModalOpen(true)}>
            Nuevo <br />
            Usuario
          </Button>
        </Flex>

        {loading ? (
          <Spinner size="xl" />
        ) : filteredUsuarios.length === 0 ? (
          <Box>No se encontraron usuarios.</Box>
        ) : (
          <TableContainer w="full" maxW="1000px">
            <Table
              variant="striped"
              colorScheme={rol === "Super" ? "purple" : rol === "Admin" ? "green" : "blue"}
              sx={{
                tableLayout: "fixed", // Fuerza las columnas a respetar el ancho
                width: "100%",
              }}
            >
              <Thead>
                <Tr>
                  <Th 
                    style={{ width: "25px" }} 
                    position="sticky" 
                    left={0} 
                    bg="white" 
                    zIndex={2}
                  >
                    No.
                  </Th>
                  <Th style={{ width: "150px" }}>Email</Th>
                  <Th style={{ width: "100px" }}>Rol</Th>
                  {showDetails && (
                    <>
                      <Th style={{ width: "100px" }}>Cliente</Th>
                      <Th style={{ width: "75px" }}>Activo</Th>
                      <Th style={{ width: "100px" }}>Verificado</Th>
                      <Th style={{ width: "200px" }}>Última sesión</Th>
                    </>
                  )}
                  <Th style={{ width: "100px" }}>Opciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentUsers.map((usuario, index) => (
                  <Tr key={usuario._id}>
                  <Td 
                    position="sticky" 
                    left={0} 
                    bg="white" 
                    zIndex={1}
                  >
                    {startIndex + index + 1}
                  </Td>

                    <Td>
                      {usuario.email}
                    </Td>
                    <Td>
                      {usuario.rol?.nombre || "Sin rol"}
                    </Td>
                    {showDetails && (
                      <>
                        <Td>
                          {usuario.cliente?.nombre || "Sin cliente"}
                        </Td>
                        <Td>
                          {usuario.activo ? "Sí" : "No"}
                        </Td>
                        <Td>
                          {usuario.verificado ? "Sí" : "No"}
                        </Td>
                        <Td>
                          {usuario.sesion
                            ? new Date(usuario.sesion).toLocaleString()
                            : "Nunca"}
                        </Td>
                      </>
                    )}
                    <Td>
                      <Button
                       colorScheme={rol === "Super" ? "purple" : rol === "Admin" ? "green" : "blue"}
                        size="sm"
                        rightIcon={<FaUser />}
                        onClick={() =>
                          router.push(`/admin/usuarios/${usuario._id}`)
                        }
                      >
                        Ver
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Button
              mt={4}
              colorScheme="gray"
              onClick={() => setShowDetails((prev) => !prev)}
            >
              {showDetails ? "Ocultar detalles" : "Mostrar detalles"}
            </Button>
          </TableContainer>
        )}

        <Flex w="full" maxW="1000px" align="center" justify="space-between" mt={4}>
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            isDisabled={currentPage === 1}
          >
            ← Anterior
          </Button>

          <Select
            maxW="150px"
            value={itemsPerPage}
            onChange={(e) => {
              const value = Number(e.target.value);
              setItemsPerPage(value);
              setCurrentPage(1);
            }}
          >
            <option value={5}>Ver 5</option>
            <option value={10}>Ver 10</option>
            <option value={0}>Ver todos</option>
          </Select>

          <Button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            isDisabled={currentPage === totalPages || totalPages === 0}
          >
            Siguiente →
          </Button>
        </Flex>
      </VStack>

      <NuevoUsuario
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchUsuarios();
        }}
      />
    </Box>
  );
};

export default VerUsuarios;