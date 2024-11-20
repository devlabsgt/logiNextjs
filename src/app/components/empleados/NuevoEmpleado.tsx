import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
} from "@chakra-ui/react";

interface Usuario {
  _id: string;
  nombre: string;
  email: string;
  telefono: string;
}

interface NuevoEmpleadoProps {
  isOpen: boolean;
  onClose: () => void;
  onEmpleadoCreated: () => void;
}

const NuevoEmpleado = ({ isOpen, onClose, onEmpleadoCreated }: NuevoEmpleadoProps) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  const [selectedUsuario, setSelectedUsuario] = useState<string>("");
  const [formData, setFormData] = useState({
    direccion: "",
    dpi: "",
    igss: "",
    nit: "",
    cargo: "",
    banco: "",
    cuenta: "",
    sueldo: "",
    bonificacion: "",
    fechaInicio: "",
    fechaFinalizacion: "",
    contratoNo: "",
    renglon: "",
  });
  const [loading, setLoading] = useState(false);

  const fetchUsuarios = async () => {
    try {
      const response = await fetch("/api/usuarios");
      const data = await response.json();
      setUsuarios(data);
      setFilteredUsuarios(data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  const handleSearchUsuario = (searchTerm: string) => {
    const filtered = usuarios.filter(
      (user) =>
        user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsuarios(filtered);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateEmpleado = async () => {
    setLoading(true);
    try {
      const newEmpleado = {
        ...formData,
        usuario: selectedUsuario || undefined,
        sueldo: parseFloat(formData.sueldo),
        bonificacion: parseFloat(formData.bonificacion),
        fechaInicio: new Date(formData.fechaInicio),
        fechaFinalizacion: new Date(formData.fechaFinalizacion),
      };

      const response = await fetch("/api/empleados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmpleado),
      });

      if (response.ok) {
        onEmpleadoCreated();
        onClose();
      } else {
        console.error("Error al crear empleado");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsuarios();
      setFormData({
        direccion: "",
        dpi: "",
        igss: "",
        nit: "",
        cargo: "",
        banco: "",
        cuenta: "",
        sueldo: "",
        bonificacion: "",
        fechaInicio: "",
        fechaFinalizacion: "",
        contratoNo: "",
        renglon: "",
      });
      setSelectedUsuario("");
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Nuevo Empleado</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Buscar Usuario</FormLabel>
              <Input
                placeholder="Escribe el nombre o correo"
                onChange={(e) => handleSearchUsuario(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Seleccionar Usuario</FormLabel>
              <Select
                placeholder="Selecciona un usuario"
                value={selectedUsuario}
                onChange={(e) => setSelectedUsuario(e.target.value)}
              >
                {filteredUsuarios.map((usuario) => (
                  <option key={usuario._id} value={usuario._id}>
                    {usuario.nombre} - {usuario.email}
                  </option>
                ))}
              </Select>
            </FormControl>
            {Object.entries(formData).map(([key, value]) => (
              <FormControl key={key}>
                <FormLabel>{key.charAt(0).toUpperCase() + key.slice(1)}</FormLabel>
                <Input
                  value={value}
                  onChange={(e) => handleChange(key, e.target.value)}
                  type={key.includes("fecha") ? "date" : "text"}
                />
              </FormControl>
            ))}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            onClick={handleCreateEmpleado}
            isLoading={loading}
            disabled={!selectedUsuario && !formData.dpi}
          >
            Crear Empleado
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NuevoEmpleado;
