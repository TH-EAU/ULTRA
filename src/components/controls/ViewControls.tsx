import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";

export default function ViewControls() {
  const { camera, gl } = useThree();

  const controls = useMemo(
    () => new OrbitControls(camera, gl.domElement),
    [camera, gl]
  );

  useEffect(() => {
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;

    controls.minPolarAngle = THREE.MathUtils.degToRad(25);
    controls.maxPolarAngle = THREE.MathUtils.degToRad(88);

    // controls.minAzimuthAngle = THREE.MathUtils.degToRad(0);
    // controls.maxAzimuthAngle = THREE.MathUtils.degToRad(90);

    return () => controls.dispose();
  }, [controls]);

  useFrame(() => controls.update());

  return null;
}
