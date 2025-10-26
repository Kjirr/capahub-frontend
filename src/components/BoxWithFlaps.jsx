import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const BoxWithFlaps = ({ width = 0, height = 0, depth = 0, topFlapsOpen = false, bottomFlapsOpen = false, color }) => {
    const top_front_ref = useRef();
    const top_back_ref = useRef();
    const top_left_ref = useRef();
    const top_right_ref = useRef();
    const bottom_front_ref = useRef();
    const bottom_back_ref = useRef();
    const bottom_left_ref = useRef();
    const bottom_right_ref = useRef();

    const flapThickness = 0.02;

    const [longFlapGeo, shortFlapGeo] = useMemo(() => [
        new THREE.BoxGeometry(width, flapThickness, depth / 2),
        new THREE.BoxGeometry(width / 2, flapThickness, depth)
    ], [width, depth]);

    useFrame(() => {
        const speed = 0.1;
        const topTargetAngle = topFlapsOpen ? Math.PI : 0;
        const bottomTargetAngle = bottomFlapsOpen ? Math.PI : 0;

        if (top_front_ref.current) top_front_ref.current.rotation.x = THREE.MathUtils.lerp(top_front_ref.current.rotation.x, -topTargetAngle, speed);
        if (top_back_ref.current) top_back_ref.current.rotation.x = THREE.MathUtils.lerp(top_back_ref.current.rotation.x, topTargetAngle, speed);
        if (top_left_ref.current) top_left_ref.current.rotation.z = THREE.MathUtils.lerp(top_left_ref.current.rotation.z, topTargetAngle, speed);
        if (top_right_ref.current) top_right_ref.current.rotation.z = THREE.MathUtils.lerp(top_right_ref.current.rotation.z, -topTargetAngle, speed);

        if (bottom_front_ref.current) bottom_front_ref.current.rotation.x = THREE.MathUtils.lerp(bottom_front_ref.current.rotation.x, bottomTargetAngle, speed);
        if (bottom_back_ref.current) bottom_back_ref.current.rotation.x = THREE.MathUtils.lerp(bottom_back_ref.current.rotation.x, -bottomTargetAngle, speed);
        if (bottom_left_ref.current) bottom_left_ref.current.rotation.z = THREE.MathUtils.lerp(bottom_left_ref.current.rotation.z, -bottomTargetAngle, speed);
        if (bottom_right_ref.current) bottom_right_ref.current.rotation.z = THREE.MathUtils.lerp(bottom_right_ref.current.rotation.z, bottomTargetAngle, speed);
    });

    const boxMaterial = <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} side={THREE.DoubleSide} />;
    const flapMaterial = <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.85} metalness={0.1} />;

    return (
        <group>
            <group>
                <mesh position={[0, 0, depth / 2]} castShadow receiveShadow>
                    <planeGeometry args={[width, height]} />
                    {boxMaterial}
                </mesh>
                <mesh position={[0, 0, -depth / 2]} rotation={[0, Math.PI, 0]} castShadow receiveShadow>
                    <planeGeometry args={[width, height]} />
                    {boxMaterial}
                </mesh>
                <mesh position={[-width / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} castShadow receiveShadow>
                    <planeGeometry args={[depth, height]} />
                    {boxMaterial}
                </mesh>
                <mesh position={[width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
                    <planeGeometry args={[depth, height]} />
                    {boxMaterial}
                </mesh>
            </group>
            
            <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(width, height, depth)]} />
                <lineBasicMaterial color="#333" />
            </lineSegments>

            <group ref={top_front_ref} position={[0, height / 2, depth / 2]}>
                <mesh castShadow position={[0, flapThickness / 2, depth / 4]} geometry={longFlapGeo}>{flapMaterial}</mesh>
            </group>
            <group ref={top_back_ref} position={[0, height / 2, -depth / 2]}>
                <mesh castShadow position={[0, flapThickness / 2, -depth / 4]} geometry={longFlapGeo}>{flapMaterial}</mesh>
            </group>
            <group ref={top_left_ref} position={[-width / 2, height / 2, 0]}>
                <mesh castShadow position={[-width / 4, flapThickness / 2, 0]} geometry={shortFlapGeo}>{flapMaterial}</mesh>
            </group>
            <group ref={top_right_ref} position={[width / 2, height / 2, 0]}>
                <mesh castShadow position={[width / 4, flapThickness / 2, 0]} geometry={shortFlapGeo}>{flapMaterial}</mesh>
            </group>
            <group ref={bottom_front_ref} position={[0, -height / 2, depth / 2]}>
                <mesh castShadow position={[0, -flapThickness / 2, depth / 4]} geometry={longFlapGeo}>{flapMaterial}</mesh>
            </group>
            <group ref={bottom_back_ref} position={[0, -height / 2, -depth / 2]}>
                <mesh castShadow position={[0, -flapThickness / 2, -depth / 4]} geometry={longFlapGeo}>{flapMaterial}</mesh>
            </group>
            <group ref={bottom_left_ref} position={[-width / 2, -height / 2, 0]}>
                <mesh castShadow position={[-width / 4, -flapThickness / 2, 0]} geometry={shortFlapGeo}>{flapMaterial}</mesh>
            </group>
            <group ref={bottom_right_ref} position={[width / 2, -height / 2, 0]}>
                <mesh castShadow position={[width / 4, -flapThickness / 2, 0]} geometry={shortFlapGeo}>{flapMaterial}</mesh>
            </group>
        </group>
    );
};

export default BoxWithFlaps;