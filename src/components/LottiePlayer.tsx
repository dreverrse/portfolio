"use client";

import { useEffect, useRef } from "react";
import { DotLottie } from "@lottiefiles/dotlottie-web";

interface LottiePlayerProps {
  src: string;
  className?: string;
}

export default function LottiePlayer({ src, className }: LottiePlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    DotLottie.setWasmUrl("/lottie/dotlottie-player.wasm");
    const dotLottie = new DotLottie({
      canvas: canvasRef.current,
      src,
      autoplay: true,
      loop: true,
    });
    return () => {
      dotLottie.destroy();
    };
  }, [src]);

  return <canvas ref={canvasRef} className={className} />;
}
