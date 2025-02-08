
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Avatar3DProps {
  isSpeaking?: boolean;
  onFinishSpeaking?: () => void;
}

export const Avatar3D = ({ isSpeaking = false, onFinishSpeaking }: Avatar3DProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const lipRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Enhanced lighting
    const ambientLight = new THREE.AmbientLight(0x6366f1, 0.5); // Indigo tint
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Head with gradient material
    const headGeometry = new THREE.SphereGeometry(1, 32, 32);
    const headMaterial = new THREE.MeshPhongMaterial({
      color: 0xf1c27d,
      shininess: 100,
      emissive: 0x6366f1,
      emissiveIntensity: 0.1
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    scene.add(head);

    // Enhanced lips with better material
    const lipGeometry = new THREE.TorusGeometry(0.2, 0.05, 16, 100);
    const lipMaterial = new THREE.MeshPhongMaterial({
      color: 0xe8968d,
      shininess: 100,
      emissive: 0xdb2777, // Pink glow
      emissiveIntensity: 0.2
    });
    const lips = new THREE.Mesh(lipGeometry, lipMaterial);
    lips.position.set(0, -0.5, 0.8);
    lips.rotation.x = Math.PI / 2;
    scene.add(lips);
    lipRef.current = lips;

    camera.position.z = 5;

    let lipAnimationFrame = 0;
    let isAnimatingLips = false;

    // Enhanced lip animation
    const animateLips = () => {
      if (!lipRef.current || !isAnimatingLips) return;

      lipAnimationFrame += 0.15; // Faster animation
      const scaleY = 1 + Math.sin(lipAnimationFrame) * 0.2; // More pronounced movement
      const scaleX = 1 + Math.cos(lipAnimationFrame) * 0.1; // Add horizontal movement

      lipRef.current.scale.y = scaleY;
      lipRef.current.scale.x = scaleX;

      if (lipAnimationFrame >= Math.PI * 2) {
        lipAnimationFrame = 0;
      }
    };

    // Interactive rotation
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    mountRef.current.addEventListener('mousedown', () => {
      isDragging = true;
    });

    mountRef.current.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const deltaMove = {
          x: e.clientX - previousMousePosition.x,
          y: e.clientY - previousMousePosition.y
        };

        head.rotation.y += deltaMove.x * 0.005;
        head.rotation.x += deltaMove.y * 0.005;
      }

      previousMousePosition = {
        x: e.clientX,
        y: e.clientY
      };
    });

    mountRef.current.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Animation loop with smooth head movement
    const animate = () => {
      requestAnimationFrame(animate);

      if (!isDragging) {
        head.rotation.y += 0.003;
        head.position.y = Math.sin(Date.now() * 0.001) * 0.1; // Subtle floating movement
      }

      animateLips();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Update lip animation based on isSpeaking prop
    if (isSpeaking) {
      isAnimatingLips = true;
    } else {
      isAnimatingLips = false;
      if (lipRef.current) {
        lipRef.current.scale.y = 1;
        lipRef.current.scale.x = 1;
      }
      if (onFinishSpeaking) {
        onFinishSpeaking();
      }
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [isSpeaking, onFinishSpeaking]);

  return <div ref={mountRef} className="w-full h-full" />;
};
