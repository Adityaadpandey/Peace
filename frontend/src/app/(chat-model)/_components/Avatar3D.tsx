"use client";

import { Environment, OrthographicCamera } from "@react-three/drei";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { AmbientLight, DirectionalLight } from "three";

// Dynamically import both Canvas and AvatarModel to prevent SSR issues
const Canvas = dynamic(
  () => import("@react-three/fiber").then((mod) => mod.Canvas),
  { ssr: false },
);

const AvatarModel = dynamic(() => import("./AvatarModel"), { ssr: false });

interface Avatar3DProps {
  isSpeaking?: boolean;
  onFinishSpeaking?: () => void;
}

export const Avatar3D = (props: Avatar3DProps) => {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Suspense
        fallback={
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white/80">Loading 3D Avatar...</div>
          </div>
        }
      >
        <Canvas
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true,
          }}
        >
          <OrthographicCamera
            makeDefault
            zoom={1400}
            position={[0, 1.65, 1]}
            near={-100}
            far={100}
          />
          <Environment preset="studio" />
          <AvatarModel {...props} />
          <AmbientLight intensity={0.5} />
          <DirectionalLight intensity={1} position={[1, 1, 1]} castShadow />
        </Canvas>
      </Suspense>
    </div>
  );
};
