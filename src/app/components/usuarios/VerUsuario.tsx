import { useEffect, useState } from "react";
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
  useToast,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { PasswordInput } from "@/app/components/ui/password-input";
import {jwtDecode} from "jwt-decode";

interface User {
  _id: string;
  email: string;
  rol: { _id: string; nombre: string }; // No opcional
  activo: boolean;
  sesion: boolean;
}

interface VerUsuarioProps {
  isOpen: boolean;
  onClose: () => void;
  userData: User; // Garantizamos que siempre tenga un rol
  setUserData: (user: User | null) => void;
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

const VerUsuario = ({ isOpen, onClose, userData, setUserData }: VerUsuarioProps) => {
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
    email: "",
  });
  const [localUserData, setLocalUserData] = useState<User>(userData);
  const [userRole, setUserRole] = useState<string>("");
  const toast = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: DecodedToken = jwtDecode(token);
      setUserRole(decoded.rol);
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
      setLocalUserData(userData);
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
      setErrors({ email: "" });
    }
  }, [isOpen, userData]);

  const validateFields = () => {
    const newErrors = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localUserData.email)
        ? ""
        : "El email debe ser válido.",
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
        email: localUserData.email,
        rol: localUserData.rol._id,
      };

      const response = await fetch(`/api/usuarios/${localUserData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUserData(updatedUser);
        toast({
          title: "Cambios guardados",
          description: "Los cambios del usuario han sido actualizados.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        onClose();
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
    }
  };

  const handleSavePassword = async () => {
    if (!passwordValid.match) return;

    try {
      const response = await fetch(`/api/usuarios/${localUserData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        toast({
          title: "Contraseña actualizada",
          description: "La contraseña se ha cambiado correctamente.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setIsPasswordSectionOpen(false);
      } else {
        toast({
          title: "Error al actualizar contraseña",
          description: "Hubo un problema al intentar cambiar la contraseña.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error al actualizar contraseña:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Perfil de Usuario</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isInvalid={!!errors.email} mt={4}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={localUserData.email}
              onChange={(e) =>
                setLocalUserData({ ...localUserData, email: e.target.value.trim() })
              }
              borderColor={errors.email ? "red.500" : undefined}
            />
            {errors.email && (
              <Text color="red.500" fontSize="sm">
                {errors.email}
              </Text>
            )}
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
                  .filter((role) => userRole === "Super" || role.nombre !== "Super")
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

              <Button
                colorScheme="blue"
                mt={4}
                onClick={handleSavePassword}
                isDisabled={!passwordValid.match}
              >
                Guardar Contraseña
              </Button>
            </Box>
          </Collapse>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" onClick={handleSaveChanges}>
            Guardar Cambios
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
