import { useState, useEffect, useCallback } from "react";
import {
  Button,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Stack,
  Heading,
  TableContainer,
  Input,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  HStack,
  Text,
  Editable,
  EditablePreview,
  EditableInput,
  useToast,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
} from "@chakra-ui/react";
import moment from "moment";
import NuevoEmpleado from "./NuevoEmpleado";
import { generarReporteEmpleadosPDF } from "./ReporteEmpleados";
import generarInformeEmpleadoPDF from "./ReporteEmpleado";

interface Usuario {
  _id: string;
  nombre: string;
  email: string;
  telefono: string;
}

interface Empleado {
  _id: string;
  usuario: Usuario;
  direccion: string;
  dpi: string;
  igss: string;
  nit: string;
  cargo: string;
  banco: string;
  cuenta: string;
  sueldo: number;
  bonificacion: number;
  fechaInicio: string;
  fechaFinalizacion: string;
  contratoNo: string;
  renglon: string;
}

interface VerEmpleadosProps {
  onBack: () => void;
}

const VerEmpleados = ({ onBack }: VerEmpleadosProps) => {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [filteredEmpleados, setFilteredEmpleados] = useState<Empleado[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"activos" | "inactivos">("activos");
  const [count, setCount] = useState({ activos: 0, inactivos: 0 });
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const toast = useToast();
const [isNuevoEmpleadoOpen, setIsNuevoEmpleadoOpen] = useState(false);

  const fetchEmpleados = useCallback(() => {
    const endpoint = `/api/empleados?activo=${activeTab === "activos"}`;
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const sortedData = data.sort((a, b) =>
            a.usuario.nombre.localeCompare(b.usuario.nombre)
          );
          setEmpleados(sortedData);
          setFilteredEmpleados(sortedData);
        } else {
          console.error("La respuesta del API no es un arreglo:", data);
          setEmpleados([]);
          setFilteredEmpleados([]);
        }
        setPage(1);
      })
      .catch((error) => {
        console.error(`Error al cargar empleados ${activeTab}:`, error);
        setEmpleados([]);
        setFilteredEmpleados([]);
      });
  }, [activeTab]);

  const fetchEmpleadosCount = useCallback(() => {
    fetch("/api/empleados/count")
      .then((res) => res.json())
      .then(setCount)
      .catch((error) => console.error("Error al cargar los conteos:", error));
  }, []);

  const handleUpdateEmpleado = async (
    id: string,
    field: string,
    value: string | number
  ) => {
    try {
      const response = await fetch(`/api/empleados/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!response.ok) {
        throw new Error("Error al actualizar el empleado");
      }
      toast({
        title: "Actualización exitosa",
        description: "El empleado fue actualizado correctamente.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      fetchEmpleados();
    } catch (error) {
      console.error("Error al actualizar el empleado:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el empleado.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchEmpleadosCount();
    fetchEmpleados();
  }, [fetchEmpleados, fetchEmpleadosCount]);

  useEffect(() => {
    if (Array.isArray(empleados)) {
      const lowerSearch = searchQuery.toLowerCase();
      const filtered = empleados.filter(({ usuario, dpi, nit }) =>
        [usuario.nombre, usuario.email, usuario.telefono, dpi, nit]
          .join(" ")
          .toLowerCase()
          .includes(lowerSearch)
      );
      const sortedFiltered = filtered.sort((a, b) =>
        a.usuario.nombre.localeCompare(b.usuario.nombre)
      );
      setFilteredEmpleados(sortedFiltered);
      setPage(1);
    }
  }, [searchQuery, empleados]);

  const handleTabChange = (tab: "activos" | "inactivos") => {
    setActiveTab(tab);
    fetchEmpleados();
  };

  const startIndex = (page - 1) * pageSize;
  const paginatedEmpleados = Array.isArray(filteredEmpleados)
    ? filteredEmpleados.slice(startIndex, startIndex + pageSize)
    : [];

  const emptyRows = pageSize - paginatedEmpleados.length;

  return (
    <Stack width={{ base: "100%", xl: "1200px" }} gap="5" p={5}>
      <Heading size="sm">Lista de empleados</Heading>
<HStack justify="space-between" align="center" spacing={4} wrap="nowrap" width="100%">
  <Button colorScheme="blue" onClick={onBack}>
    Volver
  </Button>
  <Input
    placeholder="Buscar por nombre, DPI o correo"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
  <Button
    colorScheme="green"
    onClick={() => setIsNuevoEmpleadoOpen(true)}
    p="6"
  >
    Nuevo<br />Empleado
  </Button>
  <Button
    colorScheme="red"
    onClick={() => generarReporteEmpleadosPDF(filteredEmpleados)}
  >
    Informe PDF
  </Button>
</HStack>

    <NuevoEmpleado
  isOpen={isNuevoEmpleadoOpen}
  onClose={() => setIsNuevoEmpleadoOpen(false)}
  onEmpleadoCreated={fetchEmpleados}
/>
      <Tabs
        isFitted
        onChange={(index) =>
          handleTabChange(["activos", "inactivos"][index] as "activos" | "inactivos")
        }
      >
        <TabList>
          <Tab>Activos ({count.activos})</Tab>
          <Tab>Inactivos ({count.inactivos})</Tab>
        </TabList>
        <TabPanels>
          {["activos", "inactivos"].map((_, idx) => (
            <TabPanel key={idx}>
              <TableContainer
                borderWidth="1px"
                borderRadius="md"
                boxShadow="md"
                maxW="full"
              >
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
                        Dirección
                      </Th>
                      <Th color="white" textAlign="center">
                        DPI
                      </Th>
                      <Th color="white" textAlign="center">
                        IGSS
                      </Th>
                      <Th color="white" textAlign="center">
                        NIT
                      </Th>
                      <Th color="white" textAlign="center">
                        Cargo
                      </Th>
                      <Th color="white" textAlign="center">
                        Banco
                      </Th>
                      <Th color="white" textAlign="center">
                        Cuenta
                      </Th>
                      <Th color="white" textAlign="center">
                        Sueldo
                      </Th>
                      <Th color="white" textAlign="center">
                        Bonificación
                      </Th>
                      <Th color="white" textAlign="center">
                        Fecha <br/>de Inicio
                      </Th>
                      <Th color="white" textAlign="center">
                        Fecha <br/>de Finalización
                      </Th>
                      <Th color="white" textAlign="center">
                        Contrato No.
                      </Th>
                      <Th color="white" textAlign="center">
                        Renglón
                      </Th>
                      <Th color="white" textAlign="center">
                        Acciones
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {paginatedEmpleados.map((empleado, index) => (
                      <Tr key={empleado._id}>
                        <Td>{startIndex + index + 1}</Td>
                        <Td>{empleado.usuario.nombre}</Td>
                        <Td>{empleado.usuario.email}</Td>
                        <Td>
                          <a
                            href={`https://wa.me/${empleado.usuario.telefono}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "green", textDecoration: "underline" }}
                          >
                            {empleado.usuario.telefono}
                          </a>
                        </Td>
                        <Td>
                          <Editable
                            defaultValue={empleado.direccion}
                            onSubmit={(value) =>
                              handleUpdateEmpleado(empleado._id, "direccion", value)
                            }
                          >
                            <EditablePreview />
                            <EditableInput />
                          </Editable>
                        </Td>
                        <Td>
                          <Editable
                            defaultValue={empleado.dpi}
                            onSubmit={(value) =>
                              handleUpdateEmpleado(empleado._id, "dpi", value)
                            }
                          >
                            <EditablePreview />
                            <EditableInput />
                          </Editable>
                        </Td>
                        <Td>
                          <Editable
                            defaultValue={empleado.igss}
                            onSubmit={(value) =>
                              handleUpdateEmpleado(empleado._id, "igss", value)
                            }
                          >
                            <EditablePreview />
                            <EditableInput />
                          </Editable>
                        </Td>
                        <Td>
                          <Editable
                            defaultValue={empleado.nit}
                            onSubmit={(value) =>
                              handleUpdateEmpleado(empleado._id, "nit", value)
                            }
                          >
                            <EditablePreview />
                            <EditableInput />
                          </Editable>
                        </Td>
                        <Td>
                          <Editable
                            defaultValue={empleado.cargo}
                            onSubmit={(value) =>
                              handleUpdateEmpleado(empleado._id, "cargo", value)
                            }
                          >
                            <EditablePreview />
                            <EditableInput />
                          </Editable>
                        </Td>
                        <Td>
                          <Editable
                            defaultValue={empleado.banco}
                            onSubmit={(value) =>
                              handleUpdateEmpleado(empleado._id, "banco", value)
                            }
                          >
                            <EditablePreview />
                            <EditableInput />
                          </Editable>
                        </Td>
                        <Td>
                          <Editable
                            defaultValue={empleado.cuenta}
                            onSubmit={(value) =>
                              handleUpdateEmpleado(empleado._id, "cuenta", value)
                            }
                          >
                            <EditablePreview />
                            <EditableInput />
                          </Editable>
                        </Td>
                        <Td>
                          <Editable
                            defaultValue={empleado.sueldo.toFixed(2)}
                            onSubmit={(value) =>
                              handleUpdateEmpleado(
                                empleado._id,
                                "sueldo",
                                parseFloat(value)
                              )
                            }
                          >
                            <EditablePreview />
                            <EditableInput />
                          </Editable>
                        </Td>
                        <Td>
                          <Editable
                            defaultValue={empleado.bonificacion.toFixed(2)}
                            onSubmit={(value) =>
                              handleUpdateEmpleado(
                                empleado._id,
                                "bonificacion",
                                parseFloat(value)
                              )
                            }
                          >
                            <EditablePreview />
                            <EditableInput />
                          </Editable>
                        </Td>
                        <Td>
                          <Input
                            type="date"
                            value={moment(empleado.fechaInicio).format("YYYY-MM-DD")}
                            onChange={(e) =>
                              handleUpdateEmpleado(
                                empleado._id,
                                "fechaInicio",
                                e.target.value
                              )
                            }
                            size="sm"
                            borderColor="gray.300"
                            _hover={{ borderColor: "blue.400" }}
                            _focus={{
                              borderColor: "blue.500",
                              boxShadow: "outline",
                            }}
                          />
                        </Td>
                        <Td>
                          <Input
                            type="date"
                            value={moment(empleado.fechaFinalizacion).format(
                              "YYYY-MM-DD"
                            )}
                            onChange={(e) =>
                              handleUpdateEmpleado(
                                empleado._id,
                                "fechaFinalizacion",
                                e.target.value
                              )
                            }
                            size="sm"
                            borderColor="gray.300"
                            _hover={{ borderColor: "blue.400" }}
                            _focus={{
                              borderColor: "blue.500",
                              boxShadow: "outline",
                            }}
                          />
                        </Td>
                        <Td>
                          <Editable
                            defaultValue={empleado.contratoNo}
                            onSubmit={(value) =>
                              handleUpdateEmpleado(empleado._id, "contratoNo", value)
                            }
                          >
                            <EditablePreview />
                            <EditableInput />
                          </Editable>
                        </Td>
                        <Td>
                          <Editable
                            defaultValue={empleado.renglon}
                            onSubmit={(value) =>
                              handleUpdateEmpleado(empleado._id, "renglon", value)
                            }
                          >
                            <EditablePreview />
                            <EditableInput />
                          </Editable>
                        </Td>
<Td>
<Popover>
  <PopoverTrigger>
    <Button colorScheme="blue" size="sm">
      Gestionar
    </Button>
  </PopoverTrigger>
  <PopoverContent width="150px"> {/* Ajusta el ancho según tus necesidades */}
    <PopoverArrow />
    <PopoverBody>
      <Stack direction="column" spacing={2}>
        <Button
          colorScheme="green"
          size="sm"
          onClick={() => generarInformeEmpleadoPDF(empleado)}
        >
          Generar PDF
        </Button>
        <Button
          colorScheme="red"
          size="sm"
          onClick={() => {/* lógica para desactivar */}}
        >
          Desactivar
        </Button>
      </Stack>
    </PopoverBody>
  </PopoverContent>
</Popover>

</Td>


                        
                      </Tr>
                    ))}
                    {Array.from({ length: emptyRows }).map((_, index) => (
                      <Tr key={`empty-${index}`}>
                        <Td colSpan={17}>&nbsp;</Td>
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
                  Página {page} de{" "}
                  {Math.ceil(filteredEmpleados.length / pageSize) || 1}
                </Text>
                <Button
                  onClick={() =>
                    setPage(
                      page < Math.ceil(filteredEmpleados.length / pageSize)
                        ? page + 1
                        : page
                    )
                  }
                  isDisabled={
                    page === Math.ceil(filteredEmpleados.length / pageSize)
                  }
                >
                  Siguiente
                </Button>
              </HStack>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Stack>
  );
};

export default VerEmpleados;
