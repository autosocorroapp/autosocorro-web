import Image from "next/image";

export default function Logo() {
  return (
    <Image
      src="/logo.png"
      alt="Auto Socorro"
      width={180}
      height={180}
      priority
    />
  );
}
