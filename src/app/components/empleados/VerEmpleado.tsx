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
  VStack,
} from "@chakra-ui/react";

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

interface VerEmpleadoProps {
  isOpen: boolean;
  onClose: () => void;
  onEmpleadoUpdated: () => void;
  empleado?: Empleado | null; // Empleado existente o null para crear uno nuevo
}

const VerEmpleado = ({
  isOpen,
  onClose,
  onEmpleadoUpdated,
  empleado = null,
}: VerEmpleadoProps) => {
  const [formData, setFormData] = useState<Empleado>({
    nombre: empleado?.nombre || "",
    telefono: empleado?.telefono || "",
    fechaNacimiento: empleado?.fechaNacimiento || "",
    direccion: empleado?.direccion || "",
    dpi: empleado?.dpi || "",
    igss: empleado?.igss || "",
    nit: empleado?.nit || "",
    cargo: empleado?.cargo || "",
    banco: empleado?.banco || "",
    cuenta: empleado?.cuenta || "",
    sueldo: empleado?.sueldo || 0,
    bonificacion: empleado?.bonificacion || 0,
    fechaInicio: empleado?.fechaInicio || "",
    fechaFinalizacion: empleado?.fechaFinalizacion || "",
    contratoNo: empleado?.contratoNo || "",
    renglon: empleado?.renglon || "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEmpleado = async () => {
    setLoading(true);
    try {
      const updatedEmpleado = {
        ...formData,
        sueldo: formData.sueldo,
        bonificacion: formData.bonificacion,
        fechaInicio: new Date(formData.fechaInicio),
        fechaFinalizacion: new Date(formData.fechaFinalizacion),
      };

      const endpoint = empleado
        ? `/api/empleados/${empleado._id}`
        : "/api/empleados";

      const method = empleado ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEmpleado),
      });

      if (response.ok) {
        onEmpleadoUpdated();
        onClose();
      } else {
        console.error("Error al guardar empleado");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && empleado) {
      setFormData({
        nombre: empleado.nombre || "",
        telefono: empleado.telefono || "",
        fechaNacimiento: empleado.fechaNacimiento || "",
        direccion: empleado.direccion || "",
        dpi: empleado.dpi || "",
        igss: empleado.igss || "",
        nit: empleado.nit || "",
        cargo: empleado.cargo || "",
        banco: empleado.banco || "",
        cuenta: empleado.cuenta || "",
        sueldo: empleado.sueldo || 0,
        bonificacion: empleado.bonificacion || 0,
        fechaInicio: empleado.fechaInicio || "",
        fechaFinalizacion: empleado.fechaFinalizacion || "",
        contratoNo: empleado.contratoNo || "",
        renglon: empleado.renglon || "",
      });
    }
  }, [isOpen, empleado]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{empleado ? "Editar Empleado" : "Nuevo Empleado"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {/* Mostrar el usuario asignado */}
            <FormControl>
              <FormLabel>Usuario Asignado</FormLabel>
              <Input
                value={empleado?.usuario?.email || "Sin usuario asignado"}
                isReadOnly
                placeholder="Usuario no asignado"
              />
            </FormControl>

            {/* Campos del empleado */}
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
            onClick={handleSaveEmpleado}
            isLoading={loading}
            disabled={!formData.dpi}
          >
            {empleado ? "Guardar Cambios" : "Crear Empleado"}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default VerEmpleado;
