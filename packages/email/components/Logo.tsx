import { Img } from "@react-email/components";

type LogoProps = {
  baseUrl: string;
  size?: number;
};

export function Logo({ baseUrl, size = 64 }: LogoProps) {
  const logoUrl = new URL("/logo.png", baseUrl).toString();

  return (
    <Img
      src={logoUrl}
      alt="Plop"
      className="mx-auto my-0 text-center"
      width={size}
      height={size}
    />
  );
}
