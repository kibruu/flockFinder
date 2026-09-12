import Image from "next/image";

const SUNSET_FLOCK_URL =
  "https://images.pexels.com/photos/19255314/pexels-photo-19255314.jpeg?auto=compress&cs=tinysrgb&w=1920";

export function MountainPhotoScene() {
  return (
    <Image
      src={SUNSET_FLOCK_URL}
      alt="Flock of birds flying over the ocean at sunset in Santa Marta"
      fill
      priority
      sizes="100vw"
      className="pointer-events-none absolute inset-0 object-cover"
    />
  );
}