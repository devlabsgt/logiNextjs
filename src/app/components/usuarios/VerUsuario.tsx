import { Dispatch, SetStateAction, useEffect, useState } from "react";
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
  Collapse,
  Box,
  Text,
  Select,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { PasswordInput } from "@/app/components/ui/password-input";
import moment from "moment";
import { jwtDecode } from "jwt-decode";

interface User {
  _id: string;
  nombre: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  rol: {
    _id: string;
    nombre: string;
  };
}

interface Role {
  _id: string;
  nombre: string;
}

interface DecodedToken {
  id: string;
  exp: number;
    rol: string;

}

const VerUsuario = ({ isOpen, onClose, userData, setUserData }: any) => {
  const [isPasswordSectionOpen, setIsPasswordSectionOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState({
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
    match: false,
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [errors, setErrors] = useState({
    nombre: "",
    email: "",
    telefono: "",
  });

  // Estado para manejar los datos del usuario
  const [localUserData, setLocalUserData] = useState<User>(userData);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    // Obtener el token del localStorage y decodificarlo
   const token = localStorage.getItem("token");
    if (token) {
      const decoded: DecodedToken = jwtDecode(token);
      setUserRole(decoded.rol); // Establecemos el rol desde el token decodificado
    }
  }, []);

  useEffect(() => {
    fetch("/api/roles")
      .then((response) => response.json())
      .then((data) => setRoles(data))
      .catch((error) => console.error("Error al cargar roles:", error));
  }, []);

  useEffect(() => {
    if (isOpen) {
      setLocalUserData(userData); // Restablecer datos del usuario en localUserData
      setPassword(""); // Limpiar las contraseñas
      setConfirmPassword(""); // Limpiar las contraseñas
      setPasswordValid({
        minLength: false,
        uppercase: false,
        lowercase: false,
        number: false,
        specialChar: false,
        match: false,
      });
      setErrors({
        nombre: "",
        email: "",
        telefono: "",
      });
    }
  }, [isOpen, userData]);

  const validateFields = () => {
    const newErrors = {
      nombre: localUserData.nombre.trim() ? "" : "El nombre es requerido.",
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localUserData.email) ? "" : "El email debe ser válido.",
      telefono: localUserData.telefono.trim() ? "" : "El teléfono es requerido.",
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordValid({
      minLength: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      specialChar: /[^A-Za-z0-9]/.test(value),
      match: value === confirmPassword,
    });
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    setPasswordValid((prev) => ({
      ...prev,
      match: value === password,
    }));
  };

  const handleSaveChanges = async () => {
    if (!validateFields()) return;

    try {
      const updatedData = {
        nombre: localUserData.nombre,
        email: localUserData.email,
        telefono: localUserData.telefono,
        fechaNacimiento: localUserData.fechaNacimiento,
        rol: localUserData.rol._id,
      };

      // Guardar los cambios en la base de datos
      const response = await fetch(`/api/usuarios/${localUserData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        // Actualizar los datos del usuario en el contexto o en el estado global si es necesario
        const updatedUser = await response.json();
        setUserData(updatedUser); // Actualizamos el estado global con los datos más recientes
        onClose(); // Cerrar el modal
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Perfil de Usuario</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isInvalid={!!errors.nombre} mt={4}>
            <FormLabel>Nombre</FormLabel>
            <Input
              value={localUserData.nombre}
              onChange={(e) => setLocalUserData({ ...localUserData, nombre: e.target.value })}
              borderColor={errors.nombre ? "red.500" : undefined}
            />
            {errors.nombre && <Text color="red.500" fontSize="sm">{errors.nombre}</Text>}
          </FormControl>

          <FormControl isInvalid={!!errors.email} mt={4}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={localUserData.email}
              onChange={(e) => setLocalUserData({ ...localUserData, email: e.target.value.trim() })}
              borderColor={errors.email ? "red.500" : undefined}
            />
            {errors.email && <Text color="red.500" fontSize="sm">{errors.email}</Text>}
          </FormControl>

          <FormControl isInvalid={!!errors.telefono} mt={4}>
            <FormLabel>Teléfono</FormLabel>
            <Input
              value={localUserData.telefono}
              onChange={(e) => setLocalUserData({ ...localUserData, telefono: e.target.value.trim() })}
              borderColor={errors.telefono ? "red.500" : undefined}
            />
            {errors.telefono && <Text color="red.500" fontSize="sm">{errors.telefono}</Text>}
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Fecha de Nacimiento</FormLabel>
            <Input
              type="date"
              value={localUserData.fechaNacimiento ? moment(localUserData.fechaNacimiento).format("YYYY-MM-DD") : ""}
              onChange={(e) =>
                setLocalUserData({
                  ...localUserData,
                  fechaNacimiento: e.target.value,
                })
              }
            />
          </FormControl>

          {(userRole === "Super" || userRole === "Administrador") && (
            <FormControl mt={4}>
              <FormLabel>Rol</FormLabel>
              <Select
                value={localUserData.rol._id}
                onChange={(e) => {
                  const selectedRole = roles.find((role) => role._id === e.target.value);
                  setLocalUserData({
                    ...localUserData,
                    rol: {
                      _id: e.target.value,
                      nombre: selectedRole ? selectedRole.nombre : "",
                    },
                  });
                }}
              >
                {roles
                  .filter((role) => role.nombre !== "Super") // Filtrar la opción "Super"
                  .map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.nombre}
                    </option>
                  ))}
              </Select>
            </FormControl>
          )}

          <Button
            onClick={() => setIsPasswordSectionOpen(!isPasswordSectionOpen)}
            mt={4}
            rightIcon={isPasswordSectionOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            variant="link"
            colorScheme="blue"
          >
            Cambiar Contraseña
          </Button>

          <Collapse in={isPasswordSectionOpen} animateOpacity>
            <Box mt={4} p={4} borderWidth="1px">
              <FormControl>
                <FormLabel>Nueva Contraseña</FormLabel>
                <PasswordInput
                  placeholder="Ingresa tu nueva contraseña"
                  size="xs"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                />
              </FormControl>

              <FormControl mt={4}>
                <FormLabel>Confirmar Contraseña</FormLabel>
                <PasswordInput
                  placeholder="Confirma tu nueva contraseña"
                  size="xs"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                />
              </FormControl>

              <Box mt={4}>
                <Text color={passwordValid.minLength ? "green" : "red"}>
                  Longitud mínima de 8 caracteres
                </Text>
                <Text color={passwordValid.uppercase ? "green" : "red"}>
                  Al menos una letra mayúscula
                </Text>
                <Text color={passwordValid.lowercase ? "green" : "red"}>
                  Al menos una letra minúscula
                </Text>
                <Text color={passwordValid.number ? "green" : "red"}>
                  Al menos un número
                </Text>
                <Text color={passwordValid.specialChar ? "green" : "red"}>
                  Al menos un carácter especial
                </Text>
                <Text color={passwordValid.match ? "green" : "red"}>
                  Las contraseñas coinciden
                </Text>
              </Box>
            </Box>
          </Collapse>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" onClick={handleSaveChanges}>
            Guardar cambios
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default VerUsuario;
