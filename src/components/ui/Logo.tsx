import Image from "next/image";

interface LogoProps {
  readonly size?: number;
  readonly className?: string;
}

export function Logo({ size = 32, className }: LogoProps) {
  return (
    <Image
      src="/logo.svg"
      alt="CronoCaps"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
