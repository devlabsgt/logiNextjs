import { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Collapse,
  Text,
  Select,
  Button,
  VStack,
  useToast,
  Tooltip,
  Switch,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { PasswordInput } from "@/app/components/ui/password-input";
import Swal from "sweetalert2";

interface User {
  _id: string;
  email: string;
  rol: string;
  activo: boolean;
}

interface Rol {
  _id: string;
  nombre: string;
}

interface VerUsuarioProps {
  userId: string; // ID del usuario que se está editando
}

const VerUsuario = ({ userId }: VerUsuarioProps) => {
  const [originalUserData, setOriginalUserData] = useState<User | null>(null);
  const [sessionRole, setSessionRole] = useState<string | null>(null); // Rol del usuario en sesión
  const [userData, setUserData] = useState<User | null>(null); // Datos del usuario que se está editando
  const [roles, setRoles] = useState<Rol[]>([]); // Lista de roles disponibles
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
  
  const [errors, setErrors] = useState({ email: "" });
  const toast = useToast();

  // Cargar datos del usuario en sesión
useEffect(() => {
  if (!userId) return;

  const fetchData = async () => {
    try {
      // 🔹 Obtener el rol del usuario en sesión
      const sessionRes = await fetch("/api/protected/auth/me");
      if (!sessionRes.ok) throw new Error("Error al obtener el rol del usuario en sesión.");
      const sessionData = await sessionRes.json();
      setSessionRole(sessionData.rol);

      // 🔹 Obtener los datos del usuario
      const userRes = await fetch(`/api/protected/usuarios/${userId}`);
      if (!userRes.ok) throw new Error("Error al cargar los datos del usuario.");
      const userData = await userRes.json();
      setUserData({
        ...userData,
        rol: typeof userData.rol === "object" && userData.rol.nombre ? userData.rol.nombre : userData.rol,
      });
      setOriginalUserData({
        ...userData,
        rol: typeof userData.rol === "object" && userData.rol.nombre ? userData.rol.nombre : userData.rol,
      });

      // 🔹 Obtener los roles disponibles
      const rolesRes = await fetch("/api/protected/catalogos/rol");
      if (!rolesRes.ok) throw new Error("Error al cargar los roles.");
      const rolesData = await rolesRes.json();
      setRoles(rolesData);
    } catch (error) {
      console.error("❌ Error al obtener datos:", error);
    }
  };

  fetchData();
}, [userId]);


  const validateFields = () => {
    const emailError = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData?.email || "")
      ? ""
      : "El email debe ser válido.";
    setErrors({ email: emailError });
    console.log(errors);
    return !emailError;
  };

const handleSaveChanges = async () => {
  if (!validateFields() || !userData || !userData._id || !originalUserData) {
    console.error("El ID del usuario no está definido o los campos no son válidos.");
    return;
  }

  // 🔹 Calcula los campos que han cambiado
  const payload: Record<string, unknown> = {};
  if (userData.email !== originalUserData.email) {
    payload.email = userData.email;
  }
  if (userData.rol !== originalUserData.rol) {
    payload.rol = userData.rol;
  }

  // 🔹 Si no hay cambios, mostrar un toast amarillo y salir
  if (Object.keys(payload).length === 0) {
    toast({
      title: "Sin cambios",
      description: "No se realizaron modificaciones en los campos.",
      status: "warning", // 🔹 Amarillo
      duration: 5000,
      isClosable: true,
    });
    return;
  }

  try {
    const response = await fetch(`/api/protected/usuarios/${userData._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      // 🔹 Actualizar `originalUserData` después de una actualización exitosa
      setOriginalUserData({ ...userData });

      toast({
        title: "Cambios guardados",
        description: "Los cambios del usuario han sido actualizados.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } else {
      const errorData = await response.json();
      console.error("Error del servidor:", errorData);
      toast({
        title: "Error al guardar",
        description: errorData.message || "Ocurrió un error inesperado.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    toast({
      title: "Error al guardar",
      description: "No se pudo guardar los cambios. Inténtalo de nuevo más tarde.",
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  }
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
    setPasswordValid((prev) => ({ ...prev, match: value === password }));
  };

  const handleSavePassword = async () => {
    if (!passwordValid.match || !userData) return;

    try {
      const response = await fetch(`/api/protected/usuarios/${userData._id}`, {
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

const toggleActivo = async () => {
  if (!userData) return;

  let timerInterval: NodeJS.Timeout;
  let confirmButton = false; // Estado para controlar el botón

  await Swal.fire({
    title: userData.activo
      ? "¿Estás seguro de desactivar este usuario?"
      : "¿Estás seguro de activar este usuario?",
    text: userData.activo
      ? "El usuario perderá acceso al sistema."
      : "El usuario podrá ingresar nuevamente.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Espera...",
    cancelButtonText: "Cancelar",
    didOpen: () => {
      const confirmBtn = Swal.getConfirmButton();
      confirmBtn!.disabled = true; // Desactiva el botón de confirmar
      confirmBtn!.style.backgroundColor = "#06c"; // Establece el color azul
      confirmBtn!.style.border = "none"; // Quita el borde
      confirmBtn!.style.color = "white"; // Texto blanco

      let timeLeft = 10; // Tiempo en segundos
      timerInterval = setInterval(() => {
        timeLeft--;
        confirmBtn!.innerText = `Confirmar (${timeLeft}s)`;

        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          confirmBtn!.disabled = false; // Habilita el botón después de 10 segundos
          confirmBtn!.innerText = "Sí, confirmar";
          confirmButton = true;
        }
      }, 1000);
    },
    willClose: () => {
      clearInterval(timerInterval);
    },
  });

  if (!confirmButton) {
    toast({
      title: "Operación cancelada",
      description: "No se realizaron cambios.",
      status: "warning", // Amarillo
      duration: 3000,
      isClosable: true,
    });

    return;
  }

  try {
    const response = await fetch(`/api/protected/usuarios/${userData._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !userData.activo }),
    });

    if (response.ok) {
      setUserData((prev) => prev && { ...prev, activo: !prev.activo });

    toast({
      title: userData.activo ? "Usuario desactivado" : "Usuario activado",
      description: userData.activo
        ? "El usuario ya no tiene acceso al sistema."
        : "El usuario ahora puede ingresar.",
      status: userData.activo 
        ? "error"
        : "success",
      duration: 5000,
      isClosable: true,
    });

    }
  } catch (error) {
    console.error("Error:", error);
  }
};



  return (
    <Box p={6}>
      {userData ? (
        <VStack spacing={4} align="start">
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={userData.email}
              onChange={(e) =>
                setUserData({ ...userData, email: e.target.value })
              }
            />
          </FormControl>

        <FormControl>
          {sessionRole === "Super" || sessionRole === "Administrador" ? (
            userData.rol === "Super" ? (
              <Text>
                <strong>Rol:</strong> {userData.rol}
              </Text>
            ) : (
              <>
                <FormLabel>Rol</FormLabel>
                <Select
                  value={userData.rol}
                  onChange={(e) =>
                    setUserData({ ...userData, rol: e.target.value })
                  }
                >
                  <option value="" disabled>
                    Selecciona un rol
                  </option>
                  {roles
                    .filter((role) => role.nombre !== "Super")
                    .map((role) => (
                      <option key={role._id} value={role.nombre}>
                        {role.nombre}
                      </option>
                    ))}
                </Select>
              </>
            )
          ) : (
            <></>
          )}
        </FormControl>

        {["Super", "Administrador"].includes(sessionRole || "") &&
            userData.rol !== "Super" && (
              <FormControl width="auto">
                <FormLabel>Estado</FormLabel>
                <Tooltip
                  label="Quitar acceso al sistema al usuario."
                  hasArrow
                  placement="top-end"
                >
                  <Box display="flex" alignItems="center">
                    <Switch
                      colorScheme="blue"
                      isChecked={userData.activo}
                      onChange={toggleActivo}
                      cursor="pointer"
                    />
                    <Text
                      ml={2}
                      color={userData.activo ? "green.500" : "red.500"}
                    >
                      {userData.activo ? "Activo" : "Inactivo"}
                    </Text>
                  </Box>
                </Tooltip>
              </FormControl>
            )}


          <Button colorScheme="blue" mt={4} onClick={handleSaveChanges}>
            Guardar Cambios
          </Button>

          <Button
            onClick={() => setIsPasswordSectionOpen(!isPasswordSectionOpen)}
            rightIcon={isPasswordSectionOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            variant="link"
            colorScheme="blue"
          >
            Cambiar Contraseña
          </Button>

          <Collapse in={isPasswordSectionOpen}>
            <Box mt={4}>
              <FormControl>
                <FormLabel>Nueva Contraseña</FormLabel>
                <PasswordInput
                  placeholder="Nueva contraseña"
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

              <Button
                mt={4}
                colorScheme="blue"
                onClick={handleSavePassword}
                isDisabled={!passwordValid.match}
              >
                Guardar Contraseña
              </Button>

              
            </Box>

          </Collapse>

        </VStack>
        
        
      ) : (
        <Text>Cargando datos del usuario...</Text>
      )}
    </Box>
  );
};

export default VerUsuario;
