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
  Box,
  Text,
  Select,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { PasswordInput } from "@/app/components/ui/password-input";

interface Role {
  _id: string;
  nombre: string;
}

interface NuevoUsuarioProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void; // Nueva prop para refrescar VerUsuarios
}

const NuevoUsuario = ({ isOpen, onClose, onUserCreated }: any) => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [rol, setRol] = useState("");
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
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    fetch("/api/roles")
      .then((response) => response.json())
      .then((data) => setRoles(data))
      .catch((error) => console.error("Error al cargar roles:", error));
  }, []);

  useEffect(() => {
    if (isOpen) {
      setNombre("");
      setEmail("");
      setTelefono("");
      setFechaNacimiento("");
      setRol("");
      setPassword("");
      setConfirmPassword("");
      setPasswordValid({
        minLength: false,
        uppercase: false,
        lowercase: false,
        number: false,
        specialChar: false,
        match: false,
      });
      setErrors({ nombre: "", email: "", telefono: "" });
      setAlertMessage("");
    }
  }, [isOpen]);

  const validateFields = () => {
    const newErrors = {
      nombre: nombre.trim() ? "" : "El nombre es requerido.",
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "El email debe ser válido.",
      telefono: telefono.trim() ? "" : "El teléfono es requerido.",
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

  const handleCreateUser = async () => {
    if (!validateFields() || !passwordValid.match) return;

    const newUser = {
      nombre,
      email,
      telefono,
      fechaNacimiento,
      rol,
      password,
    };

    try {
      const response = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        await response.json(); // Opcional: Maneja el usuario creado si es necesario
        onUserCreated(); // Llama a la función para refrescar VerUsuarios
        onClose(); // Cierra el modal
        setAlertMessage("");
      } else {
        const errorData = await response.json();
        if (response.status === 400 && errorData.message === "Usuario ya existe") {
          setAlertMessage("El usuario con este correo ya existe.");
        } else {
          setAlertMessage("Error al crear el usuario.");
        }
      }
    } catch (error) {
      console.error("Error al crear usuario:", error);
      setAlertMessage("Ocurrió un error inesperado al crear el usuario.");
    }
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Crear Nuevo Usuario</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {alertMessage && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{alertMessage}</AlertDescription>
            </Alert>
          )}
          <FormControl isInvalid={!!errors.nombre} mt={4}>
            <FormLabel>Nombre</FormLabel>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
            {errors.nombre && <Text color="red.500">{errors.nombre}</Text>}
          </FormControl>
          <FormControl isInvalid={!!errors.email} mt={4}>
            <FormLabel>Email</FormLabel>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            {errors.email && <Text color="red.500">{errors.email}</Text>}
          </FormControl>
          <FormControl isInvalid={!!errors.telefono} mt={4}>
            <FormLabel>Teléfono</FormLabel>
            <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
            {errors.telefono && <Text color="red.500">{errors.telefono}</Text>}
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Fecha de Nacimiento</FormLabel>
            <Input type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Rol</FormLabel>
            <Select
              value={rol}
              onChange={(e) => {
                const selectedRole = roles.find((role) => role.nombre === e.target.value);
                if (selectedRole) setRol(selectedRole.nombre);
              }}
            >
              <option value="">Seleccione un rol</option>
              {roles.map((role) => (
                <option key={role._id} value={role.nombre}>{role.nombre}</option>
              ))}
            </Select>
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Contraseña</FormLabel>
            <PasswordInput placeholder="Contraseña" value={password} onChange={(e) => handlePasswordChange(e.target.value)} />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Confirmar Contraseña</FormLabel>
            <PasswordInput placeholder="Confirmar contraseña" value={confirmPassword} onChange={(e) => handleConfirmPasswordChange(e.target.value)} />
          </FormControl>
          <Box mt={4}>
            <Text color={passwordValid.minLength ? "green" : "red"}>Longitud mínima de 8 caracteres</Text>
            <Text color={passwordValid.uppercase ? "green" : "red"}>Al menos una letra mayúscula</Text>
            <Text color={passwordValid.lowercase ? "green" : "red"}>Al menos una letra minúscula</Text>
            <Text color={passwordValid.number ? "green" : "red"}>Al menos un número</Text>
            <Text color={passwordValid.specialChar ? "green" : "red"}>Al menos un carácter especial</Text>
            <Text color={passwordValid.match ? "green" : "red"}>Las contraseñas coinciden</Text>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleCreateUser}>Crear Usuario</Button>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NuevoUsuario;
