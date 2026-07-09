import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Signature visual: a wireframe geodesic form with a slow vertical
 * "scan" plane sweeping through it — a nod to identity/liveness
 * verification, rendered with a transparent background so it sits
 * directly on the page's own gradient.
 */
export const ScanOrb: React.FC<{ className?: string }> = ({ className }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Wireframe geodesic sphere
    const geo = new THREE.IcosahedronGeometry(2.1, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#4CC9F0"),
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireMesh = new THREE.Mesh(geo, wireMat);
    group.add(wireMesh);

    // Vertex points, glowing
    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute("position", geo.getAttribute("position").clone());
    const pointsMat = new THREE.PointsMaterial({
      color: new THREE.Color("#8FE3FF"),
      size: 0.045,
      transparent: true,
      opacity: 0.9,
    });
    const points = new THREE.Points(pointsGeo, pointsMat);
    group.add(points);

    // Inner faint violet core
    const coreGeo = new THREE.IcosahedronGeometry(1.15, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#7C5CFC"),
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // Scan plane (sweeps vertically)
    const scanGeo = new THREE.PlaneGeometry(5.2, 0.02);
    const scanMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#4CC9F0"),
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
    });
    const scanPlane = new THREE.Mesh(scanGeo, scanMat);
    group.add(scanPlane);

    // Outer ring accents
    const ringGeo = new THREE.TorusGeometry(2.75, 0.006, 8, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: "#2A7EA0", transparent: true, opacity: 0.4 });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 2.3;
    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.rotation.x = Math.PI / 2.3;
    ring2.rotation.y = Math.PI / 3;
    group.add(ring1, ring2);

    let raf = 0;
    let t = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const dt = clock.getDelta();
      t += dt;

      group.rotation.y += dt * 0.18;
      group.rotation.x = Math.sin(t * 0.15) * 0.15;

      scanPlane.position.y = Math.sin(t * 0.6) * 2.0;
      const scanOpacity = 0.35 + Math.abs(Math.sin(t * 0.6)) * 0.35;
      scanMat.opacity = scanOpacity;

      wireMat.opacity = 0.28 + Math.sin(t * 0.8) * 0.06;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      geo.dispose();
      coreGeo.dispose();
      scanGeo.dispose();
      ringGeo.dispose();
      pointsGeo.dispose();
      wireMat.dispose();
      coreMat.dispose();
      scanMat.dispose();
      ringMat.dispose();
      pointsMat.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className={className} />;
};
