import Image from "next/image";

const OCEAN_GULL_URL =
  "https://images.pexels.com/photos/36486217/pexels-photo-36486217.jpeg?auto=compress&cs=tinysrgb&w=1920";

export function HeroScene() {
  return (
    <Image
      src={OCEAN_GULL_URL}
      alt="Seagull soaring over deep blue ocean waves"
      fill
      priority
      sizes="100vw"
      className="pointer-events-none absolute inset-0 object-cover"
    />
  );
}
