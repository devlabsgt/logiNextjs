import { useState, useEffect, useMemo  } from "react";
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
  isOpen: boolean; // Si el modal está abierto o cerrado
  onClose: () => void; // Función para cerrar el modal
  onUserCreated: () => void; // Función que se ejecuta después de crear un usuario
}


const errorMessages = {
  required: "El campo es requerido.",
  invalidEmail: "El email debe ser válido.",
  userExists: "El usuario con este correo ya existe.",
  unexpectedError: "Ocurrió un error inesperado al crear el usuario.",
};



const NuevoUsuario = ({ isOpen, onClose, onUserCreated }: NuevoUsuarioProps) => {
    const initialFields = useMemo(() => ({
      nombre: "",
      email: "",
      telefono: "",
      fechaNacimiento: "",
      rol: "",
      password: "",
      confirmPassword: "",
    }), []);



    const initialPasswordValid = useMemo(() => ({
      minLength: false,
      uppercase: false,
      lowercase: false,
      number: false,
      specialChar: false,
      match: false,
    }), []);

  const [fields, setFields] = useState(initialFields);
  const [passwordValid, setPasswordValid] = useState(initialPasswordValid);
  const [roles, setRoles] = useState<Role[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alertMessage, setAlertMessage] = useState("");

  const { nombre, email, telefono, fechaNacimiento, rol, password, confirmPassword } = fields;

  useEffect(() => {
    fetch("/api/roles")
      .then((response) => response.json())
      .then((data) => setRoles(data))
      .catch((error) => console.error("Error al cargar roles:", error));
  }, []);

useEffect(() => {
  if (isOpen) {
    setFields(initialFields);
    setPasswordValid(initialPasswordValid);
    setErrors({});
    setAlertMessage("");
  }
}, [isOpen, initialFields, initialPasswordValid]);



  const validateFields = () => {
    const newErrors = {
      nombre: nombre.trim() ? "" : errorMessages.required,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : errorMessages.invalidEmail,
      telefono: telefono.trim() ? "" : errorMessages.required,
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleInputChange = (field: string, value: string) => {
    setFields((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordChange = (value: string) => {
    setFields((prev) => ({ ...prev, password: value }));
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
    setFields((prev) => ({ ...prev, confirmPassword: value }));
    setPasswordValid((prev) => ({
      ...prev,
      match: value === password,
    }));
  };

  const handleRoleChange = (value: string) => {
    const selectedRole = roles.find((role) => role.nombre === value);
    setFields((prev) => ({ ...prev, rol: selectedRole?.nombre || "" }));
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
          setAlertMessage(errorMessages.userExists);
        } else {
          setAlertMessage(errorMessages.unexpectedError);
        }
      }
    } catch (error) {
      console.error("Error al crear usuario:", error);
      setAlertMessage(errorMessages.unexpectedError);
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
          {[
            { label: "Nombre", value: nombre, field: "nombre", error: errors.nombre },
            { label: "Email", value: email, field: "email", error: errors.email },
            { label: "Teléfono", value: telefono, field: "telefono", error: errors.telefono },
          ].map(({ label, value, field, error }) => (
            <FormControl isInvalid={!!error} mt={4} key={field}>
              <FormLabel>{label}</FormLabel>
              <Input value={value} onChange={(e) => handleInputChange(field, e.target.value)} />
              {error && <Text color="red.500">{error}</Text>}
            </FormControl>
          ))}
          <FormControl mt={4}>
            <FormLabel>Fecha de Nacimiento</FormLabel>
            <Input
              type="date"
              value={fechaNacimiento}
              onChange={(e) => handleInputChange("fechaNacimiento", e.target.value)}
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Rol</FormLabel>
            <Select value={rol} onChange={(e) => handleRoleChange(e.target.value)}>
              <option value="">Seleccione un rol</option>
              {roles.map((role) => (
                <option key={role._id} value={role.nombre}>
                  {role.nombre}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Contraseña</FormLabel>
            <PasswordInput
              placeholder="Contraseña"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Confirmar Contraseña</FormLabel>
            <PasswordInput
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
            />
          </FormControl>
          <Box mt={4}>
            {[
              { text: "Longitud mínima de 8 caracteres", valid: passwordValid.minLength },
              { text: "Al menos una letra mayúscula", valid: passwordValid.uppercase },
              { text: "Al menos una letra minúscula", valid: passwordValid.lowercase },
              { text: "Al menos un número", valid: passwordValid.number },
              { text: "Al menos un carácter especial", valid: passwordValid.specialChar },
              { text: "Las contraseñas coinciden", valid: passwordValid.match },
            ].map(({ text, valid }) => (
              <Text key={text} color={valid ? "green" : "red"}>
                {text}
              </Text>
            ))}
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleCreateUser}>
            Crear Usuario
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NuevoUsuario;
