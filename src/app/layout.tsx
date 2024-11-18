// src/app/layout.tsx
import { ChakraProvider } from "@chakra-ui/react";
import { ReactNode } from "react";
import type { Metadata } from 'next';

interface Props {
  children: ReactNode;
}

// Definición de los metadatos
export const metadata: Metadata = {
  title: 'APP Tu Muni CLM',
  icons: {
    icon: '/logo.ico',
  },
};

const RootLayout = ({ children }: Props) => {
  return (
    <html lang="es-GT">
      <body>
        <ChakraProvider>
          {children}
        </ChakraProvider>
      </body>
    </html>
  );
};

export default RootLayout;
