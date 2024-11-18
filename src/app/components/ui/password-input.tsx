// src/components/ui/password-input.tsx
import { InputGroup, Input, InputRightElement, IconButton } from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useState } from "react";

interface PasswordInputProps {
  placeholder?: string;
  size?: "xs" | "sm" | "md" | "lg";
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PasswordInput = ({ placeholder, size = "md", value, onChange }: PasswordInputProps) => {
  const [show, setShow] = useState(false);
  const toggleShow = () => setShow(!show);

  // Determina el tamaño del botón basado en el tamaño del Input
  const iconButtonSize = size === "xs" ? "xs" : "sm";

  return (
    <InputGroup size={size}>
      <Input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <InputRightElement>
        <IconButton
          icon={show ? <ViewOffIcon /> : <ViewIcon />}
          onClick={toggleShow}
          size={iconButtonSize}
          aria-label="Toggle Password Visibility"
          variant="ghost" // Hace que el botón se vea más limpio
        />
      </InputRightElement>
    </InputGroup>
  );
};
