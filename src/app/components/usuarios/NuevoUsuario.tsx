"use client";

import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  Box,
  Text,
} from "@chakra-ui/react";
import { PasswordInput } from "@/app/components/ui/password-input";

interface NuevoUsuarioProps {
  isOpen: boolean;
  onClose: () => void;
}

const NuevoUsuario = ({ isOpen, onClose }: NuevoUsuarioProps) => {
  const [email, setEmail] = useState("prueba1@mail.com"); // 🔹 Preset Email
  const [emailError, setEmailError] = useState("");
  const [rol, setRol] = useState("Usuario"); // 🔹 Preset Rol
  const [password, setPassword] = useState("Hola1234*"); // 🔹 Preset Contraseña
  const [confirmPassword, setConfirmPassword] = useState("Hola1234*");
  const toast = useToast();

  const [passwordValid, setPasswordValid] = useState({
    minLength: true,
    uppercase: true,
    lowercase: true,
    number: true,
    specialChar: true,
    match: true,
  });

  // 🔹 Validar el formato del email
  const handleEmailChange = (value: string) => {
    setEmail(value);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("El correo electrónico no es válido.");
    } else {
      setEmailError("");
    }
  };

  // 🔹 Validar los requisitos de la contraseña
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
    setPasswordValid((prev) => ({ ...prev, match: value === password }));
  };

  const handleSave = async () => {
    if (!email || emailError || !rol || !passwordValid.match) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios y deben ser válidos.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch("/api/protected/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, rol, password }),
      });

      if (!response.ok) throw new Error("Error al crear el usuario");

      toast({
        title: "Usuario creado",
        description: "El usuario se ha registrado exitosamente.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el usuario.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Nuevo Usuario</ModalHeader>
        <ModalBody>
          {/* Email */}
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
            />
            {emailError && <Text color="red.500">{emailError}</Text>}
          </FormControl>

          {/* Rol */}
          <FormControl mt={4}>
            <FormLabel>Rol</FormLabel>
            <Select value={rol} onChange={(e) => setRol(e.target.value)}>
              <option value="" disabled>Selecciona un rol</option>
              <option value="Administrador">Administrador</option>
              <option value="Usuario">Usuario</option>
            </Select>
          </FormControl>

          {/* Contraseña */}
          <FormControl mt={4}>
            <FormLabel>Contraseña</FormLabel>
            <PasswordInput
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
            />
          </FormControl>

          {/* Confirmar Contraseña */}
          <FormControl mt={4}>
            <FormLabel>Confirmar Contraseña</FormLabel>
            <PasswordInput
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
            />
          </FormControl>

          {/* Indicadores de validación de contraseña */}
          <Box mt={4}>
            <Text color={passwordValid.minLength ? "green.500" : "red.500"}>
              Longitud mínima de 8 caracteres
            </Text>
            <Text color={passwordValid.uppercase ? "green.500" : "red.500"}>
              Al menos una letra mayúscula
            </Text>
            <Text color={passwordValid.lowercase ? "green.500" : "red.500"}>
              Al menos una letra minúscula
            </Text>
            <Text color={passwordValid.number ? "green.500" : "red.500"}>
              Al menos un número
            </Text>
            <Text color={passwordValid.specialChar ? "green.500" : "red.500"}>
              Al menos un carácter especial
            </Text>
            <Text color={passwordValid.match ? "green.500" : "red.500"}>
              Las contraseñas coinciden
            </Text>
          </Box>
        </ModalBody>

        {/* Botones de acción */}
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleSave} isDisabled={!passwordValid.match || !!emailError}>
            Guardar
          </Button>
          <Button ml={2} onClick={onClose}>
            Cancelar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NuevoUsuario;
