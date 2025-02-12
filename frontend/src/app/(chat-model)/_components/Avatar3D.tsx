'use client';

import { Environment, OrthographicCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { AmbientLight, DirectionalLight } from 'three';

// Dynamically import the AvatarModel component to prevent SSR issues
const AvatarModel = dynamic(() => import('./AvatarModel'), { ssr: false });

interface Avatar3DProps {
  isSpeaking?: boolean;
  onFinishSpeaking?: () => void;
}

export const Avatar3D = (props: Avatar3DProps) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Canvas>
        <OrthographicCamera
          makeDefault
          zoom={1400}
          position={[0, 1.65, 1]}
        />

        <Environment preset="studio" />

        <AvatarModel {...props} />

        <AmbientLight intensity={0.5} />
        <DirectionalLight
          intensity={1}
          position={[1, 1, 1]}
        />
      </Canvas>
    </Suspense>
  );
};
