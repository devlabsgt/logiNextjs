"use client";
import { useState } from "react";
import {
  Box,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  Heading,
  Image,
  FormControl,
  FormErrorMessage,
  useToast,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

const handleLogin = async () => {
  setError("");
  setEmailError("");
  setPasswordError("");

  let valid = true;

  if (!email) {
    setEmailError("El correo electrónico es requerido");
    valid = false;
  } else if (!validateEmail(email)) {
    setEmailError("Formato de correo electrónico inválido");
    valid = false;
  }

  if (!password) {
    setPasswordError("La contraseña es requerida");
    valid = false;
  }

  if (!valid) return;

  setIsLoading(true);

  try {
    const res = await fetch("/api/auth/iniciarSesion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();

      toast({
        title: "Inicio de sesión exitoso",
        description: "Has iniciado sesión correctamente.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Redirigir según el rol
      console.log(data);
      if (data.rol === "Super" || data.rol === "Administrador") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } else {
      const data = await res.json();
      setError(data.message || "Error en el inicio de sesión");
      toast({
        title: "Error",
        description: data.message || "Error en el inicio de sesión",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  } catch (error) {
    setError("Ocurrió un error durante el inicio de sesión");
    toast({
      title: "Error",
      description: "Ocurrió un error durante el inicio de sesión " + error,
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  } finally {
    setIsLoading(false);
  }
};

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bg="gray.50" p={4}>
      <VStack spacing={6} width="100%" maxWidth="400px" textAlign="center">
        <Image src="/logo.webp" alt="Logo" mb={4} />
        <Heading as="h2" size="lg">
          Iniciar Sesión
        </Heading>
        {error && <Box color="red.500">{error}</Box>}

        <FormControl isInvalid={!!emailError}>
          <Input
            placeholder="Correo Electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            borderColor={emailError ? "red.500" : "gray.200"}
          />
          {emailError && <FormErrorMessage>{emailError}</FormErrorMessage>}
        </FormControl>

        <FormControl isInvalid={!!passwordError}>
          <InputGroup size="md">
            <Input
              pr="4.5rem"
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              borderColor={passwordError ? "red.500" : "gray.200"}
            />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <ViewOffIcon /> : <ViewIcon />}
              </Button>
            </InputRightElement>
          </InputGroup>
          {passwordError && <FormErrorMessage>{passwordError}</FormErrorMessage>}
        </FormControl>

        <Button colorScheme="blue" width="full" onClick={handleLogin} isLoading={isLoading} isDisabled={isLoading}>
          Iniciar Sesión
        </Button>
      </VStack>
    </Box>
  );
};

export default LoginPage;
