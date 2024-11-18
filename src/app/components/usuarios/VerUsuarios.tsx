import { useState, useEffect, useCallback } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Button,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  HStack,
  Heading,
  Stack,
  Text,
  TableContainer,
  Input,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import moment from "moment-timezone";
import VerUsuario from "./VerUsuario";
import NuevoUsuario from "./NuevoUsuario";
import Swal from "sweetalert2";

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

interface VerUsuariosProps {
  onBack: () => void;
}

const VerUsuarios = ({ onBack }: VerUsuariosProps) => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNuevoUsuarioOpen, setIsNuevoUsuarioOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"activos" | "inactivos" | "sesion">("activos");
  const [count, setCount] = useState({ activos: 0, inactivos: 0, enSesion: 0 });
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [showHint, setShowHint] = useState(false); // Solución al error

  const fetchUsuarios = useCallback((type: "activos" | "inactivos" | "sesion") => {
    const endpoint = `/api/usuarios?${type === "sesion" ? "sesion=true" : `activo=${type === "activos"}`}`;
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        const usuariosConRol = data.map((usuario: User) => ({
          ...usuario,
          rol: usuario.rol || { _id: "default", nombre: "Sin rol asignado" },
        }));
        setUsuarios(usuariosConRol);
        setFilteredUsuarios(usuariosConRol);
        setPage(1);
      })
      .catch((error) => console.error(`Error al cargar usuarios ${type}:`, error));
  }, []);

  const fetchUsuariosCount = useCallback(() => {
    fetch("/api/usuarios/count")
      .then((res) => res.json())
      .then(setCount)
      .catch((error) => console.error("Error al cargar los conteos:", error));
  }, []);

  useEffect(() => {
    fetchUsuariosCount();
    fetchUsuarios("activos");
  }, [fetchUsuarios, fetchUsuariosCount]);

  useEffect(() => {
    const lowerSearch = searchQuery.toLowerCase();
    const filtered = usuarios.filter(({ nombre, email, telefono, rol }) =>
      [nombre, email, telefono, rol.nombre].join(" ").toLowerCase().includes(lowerSearch)
    );
    setFilteredUsuarios(filtered);
    setPage(1);
  }, [searchQuery, usuarios]);

  const handleTabChange = (tab: "activos" | "inactivos" | "sesion") => {
    setActiveTab(tab);
    fetchUsuarios(tab);
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    const confirmation = await Swal.fire({
      title: isActive ? "¿Desactivar usuario?" : "¿Activar usuario?",
      text: isActive
        ? "Si desactivas este usuario, perderá acceso al sistema."
        : "¿Deseas activar este usuario? Esto le dará acceso al sistema.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: isActive ? "#d33" : "#28a745",
      cancelButtonColor: "#6c757d",
      confirmButtonText: isActive ? "Sí, desactivar" : "Sí, activar",
      cancelButtonText: "Cancelar",
    });
    if (!confirmation.isConfirmed) return;

    try {
      const { sesion } = await fetch(`/api/usuarios/${userId}`).then((res) => res.json());
      if (sesion && isActive) {
        Swal.fire({ icon: "error", title: "No se puede desactivar", text: "El usuario está actualmente en sesión." });
      } else {
        const toggleResponse = await fetch(`/api/usuarios/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activo: !isActive }),
        });
        if (toggleResponse.ok) {
          Swal.fire({
            icon: "success",
            title: isActive ? "Usuario desactivado" : "Usuario activado",
            text: `El usuario ha sido ${isActive ? "desactivado" : "activado"} correctamente.`,
          });
          fetchUsuarios(activeTab);
          fetchUsuariosCount();
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: `Ocurrió un error al intentar ${isActive ? "desactivar" : "activar"} el usuario.`,
          });
        }
      }
    } catch (error) {
      console.error(`Error al cambiar el estado del usuario:`, error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Ocurrió un error al intentar ${isActive ? "desactivar" : "activar"} el usuario.`,
      });
    }
  };

  const startIndex = (page - 1) * pageSize;
  const paginatedUsuarios = filteredUsuarios.slice(startIndex, startIndex + pageSize);

  return (
    <Stack width={{ base: "100%", xl: "1200px" }} gap="5" p={5}>
      <Heading size="sm">Lista de usuarios con acceso al sistema</Heading>
      <HStack justify="space-between" align="center" spacing={4} wrap="nowrap" width="100%">
        <Button colorScheme="blue" onClick={onBack}>
          Volver
        </Button>
        <Stack align="center" flex="1">
          <Input
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowHint(true)}
            onBlur={() => setShowHint(false)}
            width="100%"
          />
          {showHint && (
            <Text fontSize="sm" color="gray.500">
              Buscar por nombre, email, rol o teléfono
            </Text>
          )}
        </Stack>
        <Button colorScheme="green" onClick={() => setIsNuevoUsuarioOpen(true)}>
          Nuevo Usuario
        </Button>
      </HStack>
      <Tabs isFitted onChange={(index) => handleTabChange(["activos", "inactivos", "sesion"][index] as "activos" | "inactivos" | "sesion")}>
        <TabList>
          <Tab>Activos ({count.activos})</Tab>
          <Tab>Desactivados ({count.inactivos})</Tab>
          <Tab>En sesión ({count.enSesion})</Tab>
        </TabList>
        <TabPanels>
          {["activos", "inactivos", "sesion"].map((_, idx) => (
            <TabPanel key={idx}>
              <TableContainer borderWidth="1px" borderRadius="md" boxShadow="md" maxW="full">
                <Table variant="striped" colorScheme="gray" size="sm">
                  <Thead bg="blue.500">
                    <Tr>
                      <Th color="white" textAlign="center">
                        No.
                      </Th>
                      <Th color="white" textAlign="center">
                        Nombre
                      </Th>
                      <Th color="white" textAlign="center">
                        Email
                      </Th>
                      <Th color="white" textAlign="center">
                        Teléfono
                      </Th>
                      <Th color="white" textAlign="center">
                        Fecha de Nacimiento
                      </Th>
                      <Th color="white" textAlign="center">
                        Rol
                      </Th>
                      <Th color="white" textAlign="center">
                        Acciones
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {paginatedUsuarios.map((usuario, index) => (
                      <Tr key={usuario._id}>
                        <Td>{startIndex + index + 1}</Td>
                        <Td>{usuario.nombre}</Td>
                        <Td>{usuario.email}</Td>
                        <Td>{usuario.telefono}</Td>
                        <Td>{moment(usuario.fechaNacimiento).format("DD-MM-YYYY")}</Td>
                        <Td>{usuario.rol.nombre || "Sin rol asignado"}</Td>
                        <Td>
                          <Popover>
                            <PopoverTrigger>
                              <Button bg="#4da8da" _hover={{ bg: "#3798c4" }} color="white" size="sm">
                                Gestionar
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent>
                              <PopoverArrow />
                              <PopoverCloseButton />
                              <PopoverHeader>Opciones</PopoverHeader>
                              <PopoverBody>
                                <Stack spacing={3}>
                                  <Button
                                    colorScheme="blue"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedUser(usuario);
                                      setIsModalOpen(true);
                                    }}
                                  >
                                    Editar
                                  </Button>
                                  <Button
                                    colorScheme={usuario.activo ? "red" : "green"}
                                    size="sm"
                                    onClick={() => handleToggleActive(usuario._id, usuario.activo)}
                                  >
                                    {usuario.activo ? "Desactivar" : "Activar"}
                                  </Button>
                                </Stack>
                              </PopoverBody>
                            </PopoverContent>
                          </Popover>
                        </Td>
                      </Tr>
                    ))}
                    {paginatedUsuarios.length < pageSize &&
                      Array.from({ length: pageSize - paginatedUsuarios.length }).map((_, idx) => (
                        <Tr key={`empty-${idx}`}>
                          <Td colSpan={7}>&nbsp;</Td>
                        </Tr>
                      ))}
                  </Tbody>
                </Table>
              </TableContainer>
              <HStack justify="space-between" mt={4}>
                <Button
                  onClick={() => setPage(page > 1 ? page - 1 : page)}
                  isDisabled={page === 1}
                >
                  Anterior
                </Button>
                <Text>
                  Página {page} de {Math.ceil(filteredUsuarios.length / pageSize) || 1}
                </Text>
                <Button
                  onClick={() =>
                    setPage(
                      page < Math.ceil(filteredUsuarios.length / pageSize)
                        ? page + 1
                        : page
                    )
                  }
                  isDisabled={page === Math.ceil(filteredUsuarios.length / pageSize)}
                >
                  Siguiente
                </Button>
              </HStack>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
      <NuevoUsuario
        isOpen={isNuevoUsuarioOpen}
        onClose={() => setIsNuevoUsuarioOpen(false)}
        onUserCreated={() => fetchUsuarios(activeTab)}
      />
      {selectedUser && (
        <VerUsuario
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          userData={selectedUser}
          setUserData={setSelectedUser}
        />
      )}
    </Stack>
  );
};

export default VerUsuarios;
