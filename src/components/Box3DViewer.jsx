import React, { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import BoxWithFlaps from "./BoxWithFlaps";

export default function Box3DViewer({
  L_mm = 200,
  W_mm = 150,
  H_mm = 100,
  background = "#f5f7fb",
  topFlapsOpen = true,
  bottomFlapsOpen = true,
  color = "#d2b48c",
}) {

  const scale = 100;
  const width = L_mm / scale;
  const height = H_mm / scale;
  const depth = W_mm / scale;

  const cameraConfig = useMemo(() => {
    const maxDim = Math.max(width, height, depth);
    const dist = maxDim * 2.5; 
    return {
      fov: 50,
      position: [dist, dist * 0.8, dist]
    };
  }, [width, height, depth]);

  return (
    <div className="w-full h-80 rounded-lg overflow-hidden border">
      <Canvas
        shadows
        key={`${L_mm}-${W_mm}-${H_mm}`}
        camera={{ fov: cameraConfig.fov, position: cameraConfig.position }}
      >
        <color attach="background" args={[background]} />
        <ambientLight intensity={0.8} />
        <directionalLight
          castShadow
          position={[5, 10, 7.5]}
          intensity={1}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <hemisphereLight intensity={0.2} groundColor="white" />
        
        <Suspense fallback={<Html center>3D laden…</Html>}>
          <group>
            <BoxWithFlaps
              width={width}
              height={height}
              depth={depth}
              topFlapsOpen={topFlapsOpen}
              bottomFlapsOpen={bottomFlapsOpen}
              color={color}
            />
          </group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -height / 2 - 0.01, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <shadowMaterial opacity={0.2} />
          </mesh>
        </Suspense>

        <OrbitControls enablePan enableZoom enableRotate />
      </Canvas>
    </div>
  );
}