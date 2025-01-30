import type { NextConfig } from 'next';
import inicializar from './src/app/lib/inicializar';

const nextConfig: NextConfig = {
    reactStrictMode: true,
    async redirects() {
        // Aquí puedes forzar cualquier lógica adicional de redirección.
        return [];
    },
};

inicializar() // Llamada directa a la inicialización

export default nextConfig;
