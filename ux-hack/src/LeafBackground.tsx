import React, { useEffect, useRef } from "react";

interface Leaf {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  rotation: number;
  rotationSpeed: number;
  image: HTMLImageElement;
  opacity: number;
}

const LeafBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const leavesRef = useRef<Leaf[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set full screen size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Load images
    const greenLeaf = new Image();
    const autumnLeaf = new Image();
    greenLeaf.src = "/green_leaf.png";
    autumnLeaf.src = "/autumn_leaf.png";

    const leafImages = [greenLeaf, autumnLeaf];

    const createLeaf = (): Leaf => {
      const image =
        leafImages[Math.floor(Math.random() * leafImages.length)];

      const size = Math.random() * 40 + 20; // 20px – 60px

      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size,
        speed: Math.random() * 0.7 + 0.3, // slow fall
        drift: (Math.random() - 0.5) * 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.01,
        image,
        opacity: Math.random() * 0.4 + 0.3, // 0.3 – 0.7
      };
    };

    const leafCount = Math.floor(window.innerWidth / 15);

    leavesRef.current = Array.from({ length: leafCount }, createLeaf);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      leavesRef.current.forEach((leaf) => {
        leaf.y += leaf.speed;
        leaf.x += leaf.drift;
        leaf.rotation += leaf.rotationSpeed;

        // Reset when out of screen
        if (leaf.y > canvas.height) {
          leaf.y = -leaf.size;
          leaf.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.globalAlpha = leaf.opacity;

        ctx.translate(leaf.x, leaf.y);
        ctx.rotate(leaf.rotation);

        ctx.drawImage(
          leaf.image,
          -leaf.size / 2,
          -leaf.size / 2,
          leaf.size,
          leaf.size
        );

        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    const start = () => {
      animate();
    };

    greenLeaf.onload = start;

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  );
};

export default LeafBackground;