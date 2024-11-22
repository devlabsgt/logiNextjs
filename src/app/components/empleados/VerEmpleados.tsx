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
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
} from "@chakra-ui/react";
import moment from "moment";
import VerEmpleado from "./VerEmpleado";
import { generarReporteEmpleadosPDF } from "./ReporteEmpleados";
import generarInformeEmpleadoPDF from "./ReporteEmpleado";

interface Usuario {
  _id: string;
  email: string; // Viene poblado desde `populate`
}

interface Empleado {
  _id?: string;
  usuario?: Usuario | null; // Usuario poblado o null si no está asignado
  nombre: string;
  telefono: string;
  fechaNacimiento: string;
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

  const [isVerEmpleadoOpen, setIsVerEmpleadoOpen] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<Empleado | null>(null);

  const fetchEmpleados = useCallback(() => {
    const endpoint = `/api/empleados?activo=${activeTab === "activos"}`;
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const sortedData = data.sort((a, b) => a.nombre.localeCompare(b.nombre));
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

  useEffect(() => {
    fetchEmpleadosCount();
    fetchEmpleados();
  }, [fetchEmpleados, fetchEmpleadosCount]);

  useEffect(() => {
    if (Array.isArray(empleados)) {
      const lowerSearch = searchQuery.toLowerCase();
      const filtered = empleados.filter(({ nombre, telefono, dpi, nit }) =>
        [nombre, telefono, dpi, nit].filter(Boolean).join(" ").toLowerCase().includes(lowerSearch)
      );
      const sortedFiltered = filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
      setFilteredEmpleados(sortedFiltered);
      setPage(1);
    }
  }, [searchQuery, empleados]);

  const handleTabChange = (tab: "activos" | "inactivos") => {
    setActiveTab(tab);
    fetchEmpleados();
  };

  const startIndex = (page - 1) * pageSize;
  const paginatedEmpleados = filteredEmpleados.slice(startIndex, startIndex + pageSize);
  const emptyRows = pageSize - paginatedEmpleados.length;

  const handleEditEmpleado = (empleado: Empleado) => {
    setEmpleadoSeleccionado(empleado);
    setIsVerEmpleadoOpen(true);
  };

  const handleNuevoEmpleado = () => {
    setEmpleadoSeleccionado(null);
    setIsVerEmpleadoOpen(true);
  };

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
        <Button colorScheme="green" fontSize="sm" onClick={handleNuevoEmpleado}>
          Nuevo<br />Empleado
        </Button>
        <Button colorScheme="red" fontSize="sm" onClick={() => generarReporteEmpleadosPDF(filteredEmpleados)}>
          Informe<br />PDF
        </Button>
      </HStack>

      <VerEmpleado
        isOpen={isVerEmpleadoOpen}
        onClose={() => setIsVerEmpleadoOpen(false)}
        onEmpleadoUpdated={fetchEmpleados}
        empleado={empleadoSeleccionado}
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
<TableContainer borderWidth="1px" borderRadius="md" boxShadow="md" maxW="full" overflowX="auto">
  <Table variant="striped" colorScheme="gray" size="sm">
    <Thead bg="blue.500">
      <Tr>
        <Th
          color="white"
          textAlign="center"
          position="sticky"
          left="0" // Mantiene fija la columna en el lado izquierdo
          zIndex="1" // Asegura que esté encima del contenido al hacer scroll
          bg="blue.500" // Fondo para que no quede transparente
        >
          No.
        </Th>
        <Th color="white" textAlign="center">Nombre</Th>
        <Th color="white" textAlign="center">Teléfono</Th>
        <Th color="white" textAlign="center">Fecha Nacimiento</Th>
        <Th color="white" textAlign="center">Dirección</Th>
        <Th color="white" textAlign="center">DPI</Th>
        <Th color="white" textAlign="center">IGSS</Th>
        <Th color="white" textAlign="center">NIT</Th>
        <Th color="white" textAlign="center">Cargo</Th>
        <Th color="white" textAlign="center">Banco</Th>
        <Th color="white" textAlign="center">Cuenta</Th>
        <Th color="white" textAlign="center">Sueldo</Th>
        <Th color="white" textAlign="center">Bonificación</Th>
        <Th color="white" textAlign="center">Fecha Inicio</Th>
        <Th color="white" textAlign="center">Fecha Finalización</Th>
        <Th color="white" textAlign="center">Contrato No.</Th>
        <Th color="white" textAlign="center">Renglón</Th>
        <Th color="white" textAlign="center">Acciones</Th>
      </Tr>
    </Thead>
    <Tbody>
      {paginatedEmpleados.map((empleado, index) => (
        <Tr key={empleado._id}>
          <Td
            textAlign="center"
            position="sticky"
            left="0" // Mantiene fija la celda en el lado izquierdo
            bg="white" // Fondo blanco para coincidir con la fila
            zIndex="1"
          >
            {startIndex + index + 1}
          </Td>
          <Td>{empleado.nombre}</Td>
          <Td>
            <a
              href={`https://wa.me/${empleado.telefono}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "green", textDecoration: "underline" }}
            >
              {empleado.telefono}
            </a>
          </Td>
          <Td textAlign="center">{moment(empleado.fechaNacimiento).format("DD-MM-YYYY")}</Td>
          <Td>{empleado.direccion}</Td>
          <Td textAlign="center">{empleado.dpi}</Td>
          <Td textAlign="center">{empleado.igss}</Td>
          <Td textAlign="center">{empleado.nit}</Td>
          <Td>{empleado.cargo}</Td>
          <Td>{empleado.banco}</Td>
          <Td>{empleado.cuenta}</Td>
          <Td textAlign="center">{empleado.sueldo.toFixed(2)}</Td>
          <Td textAlign="center">{empleado.bonificacion.toFixed(2)}</Td>
          <Td textAlign="center">{moment(empleado.fechaInicio).format("YYYY-MM-DD")}</Td>
          <Td textAlign="center">{moment(empleado.fechaFinalizacion).format("YYYY-MM-DD")}</Td>
          <Td>{empleado.contratoNo}</Td>
          <Td>{empleado.renglon}</Td>
          <Td>
            <Popover>
              <PopoverTrigger>
                <Button size="sm" colorScheme="blue">
                  Acciones
                </Button>
              </PopoverTrigger>
              <PopoverContent width="150px">
                <PopoverArrow />
                <PopoverBody display="flex" flexDirection="column" alignItems="center" gap="2">
                  <Button
                    size="sm"
                    colorScheme="blue"
                    width="100px"
                    onClick={() => handleEditEmpleado(empleado)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    width="100px"
                    onClick={() => generarInformeEmpleadoPDF(empleado)}
                  >
                    PDF
                  </Button>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </Td>
        </Tr>
      ))}
      {Array.from({ length: emptyRows }).map((_, index) => (
        <Tr key={`empty-${index}`}>
          <Td colSpan={18}>&nbsp;</Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
</TableContainer>

              <HStack justify="space-between" mt={4}>
                <Button onClick={() => setPage(page > 1 ? page - 1 : page)} isDisabled={page === 1}>
                  Anterior
                </Button>
                <Text>
                  Página {page} de {Math.ceil(filteredEmpleados.length / pageSize) || 1}
                </Text>
                <Button
                  onClick={() =>
                    setPage(
                      page < Math.ceil(filteredEmpleados.length / pageSize)
                        ? page + 1
                        : page
                    )
                  }
                  isDisabled={page === Math.ceil(filteredEmpleados.length / pageSize)}
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
