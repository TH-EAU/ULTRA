// src/utils/RenderPixelatedPass.tsx
// import { PixelationPass } from 'three-stdlib';
import { useMemo } from 'react';
import { useThree } from '@react-three/fiber';

export function RenderPixelatedPass({ granularity = 5 }: { granularity?: number }) {
    const { gl, scene, camera, size } = useThree();

    const pixelationPass = useMemo(() => {
        const pass = new PixelShader(granularity, size.width, size.height);
        return pass;
    }, [granularity, size.width, size.height]);

    return pixelationPass;
}
