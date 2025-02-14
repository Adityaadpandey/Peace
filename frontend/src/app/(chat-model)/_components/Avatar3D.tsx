import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRMLoaderPlugin, VRMHumanBoneName } from "@pixiv/three-vrm";

interface VRMViewerProps {
  modelPath: string;
  isSpeaking?: boolean;
}

export function VRMViewer({ modelPath, isSpeaking = false }: VRMViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const vrmRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
    camera.position.set(0, 1.3, 3.5);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Enhanced lighting for better visual quality
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const frontLight = new THREE.DirectionalLight(0xffffff, 1);
    frontLight.position.set(0, 3, 5);
    scene.add(frontLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(0, 3, -5);
    scene.add(backLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 5;
    controls.minPolarAngle = Math.PI / 3; // Limit lower view
    controls.maxPolarAngle = Math.PI / 1.8; // Limit upper view
    controls.target.set(0, 1.3, 0);

    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    const setNaturalPose = (vrm: any) => {
      const humanoid = vrm.humanoid;

      // Natural arm positioning
      const setArmPose = (side: "Left" | "Right") => {
        const prefix = side === "Left" ? "Left" : "Right";
        const multiplier = side === "Left" ? 1 : -1;

        const upperArm = humanoid.getBoneNode(`${prefix}UpperArm`);
        const lowerArm = humanoid.getBoneNode(`${prefix}LowerArm`);
        const hand = humanoid.getBoneNode(`${prefix}Hand`);

        if (upperArm) {
          upperArm.rotation.z = 0.2 * multiplier;
          upperArm.rotation.x = -0.1;
        }
        if (lowerArm) {
          lowerArm.rotation.x = 0.4;
          lowerArm.rotation.z = 0.1 * multiplier;
        }
        if (hand) {
          hand.rotation.x = -0.2;
          hand.rotation.y = 0.1 * multiplier;
          hand.rotation.z = 0.05 * multiplier;
        }
      };

      setArmPose("Left");
      setArmPose("Right");

      // Natural finger poses
      const setFingerPose = (side: "Left" | "Right") => {
        const prefix = side;
        const fingers = ["Thumb", "Index", "Middle", "Ring", "Little"];
        const segments = ["Proximal", "Intermediate", "Distal"];

        fingers.forEach((finger, fingerIndex) => {
          segments.forEach((segment, segmentIndex) => {
            const bone = humanoid.getBoneNode(`${prefix}${finger}${segment}`);
            if (bone) {
              // Custom curl for each finger
              let curl = -0.1; // Base curl

              // Adjust curl based on finger and segment
              if (finger === "Thumb") {
                curl *= (segmentIndex + 1) * 0.8;
              } else {
                curl *= (fingerIndex * 0.2 + 1) * (segmentIndex + 1) * 0.5;
              }

              bone.rotation.x = curl;

              // Add slight spreading of fingers
              if (segment === "Proximal") {
                const spread = (fingerIndex - 2) * 0.05; // Middle finger as center
                bone.rotation.y = spread;
              }
            }
          });
        });
      };

      setFingerPose("Left");
      setFingerPose("Right");
    };

    loader.load(
      modelPath,
      (gltf) => {
        const vrm = gltf.userData.vrm;
        vrmRef.current = vrm;
        scene.add(vrm.scene);

        // Center and scale the model
        const box = new THREE.Box3().setFromObject(vrm.scene);
        const center = box.getCenter(new THREE.Vector3());
        vrm.scene.position.y = -center.y + 1.2;
        vrm.scene.rotation.y = Math.PI; // Face forward

        setNaturalPose(vrm);
      },
      undefined,
      console.error,
    );

    const clock = new THREE.Clock();
    let currentMouthOpening = 0;

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      if (vrmRef.current) {
        const vrm = vrmRef.current;

        // Subtle idle animation
        const head = vrm.humanoid.getBoneNode(VRMHumanBoneName.Head);
        if (head) {
          head.rotation.y = Math.sin(time * 0.5) * 0.02;
          head.rotation.x = Math.sin(time * 0.3) * 0.01;
        }

        // Enhanced speaking animation
        if (isSpeaking) {
          const targetOpening = Math.abs(Math.sin(time * 10)) * 0.3;
          currentMouthOpening +=
            (targetOpening - currentMouthOpening) * delta * 10;

          // Jaw movement
          const jaw = vrm.humanoid.getBoneNode("jaw");
          if (jaw) {
            jaw.rotation.x = currentMouthOpening;
          }

          // Blend shapes for more natural speaking
          if (vrm.blendShapeProxy) {
            vrm.blendShapeProxy.setValue("aa", currentMouthOpening * 0.5);
            vrm.blendShapeProxy.setValue("oh", currentMouthOpening * 0.3);
          }
        } else {
          currentMouthOpening *= 0.8; // Smooth closing

          const jaw = vrm.humanoid.getBoneNode("jaw");
          if (jaw) {
            jaw.rotation.x = currentMouthOpening;
          }

          if (vrm.blendShapeProxy) {
            vrm.blendShapeProxy.setValue("aa", 0);
            vrm.blendShapeProxy.setValue("oh", 0);
          }
        }

        vrm.update(delta);
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);
    handleResize();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationRef.current!);
      renderer.dispose();
      controls.dispose();
    };
  }, [modelPath, isSpeaking]);

  return (
    <div className="flex flex-col w-full h-full">
      <div ref={containerRef} className="relative w-full flex-grow">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
}
