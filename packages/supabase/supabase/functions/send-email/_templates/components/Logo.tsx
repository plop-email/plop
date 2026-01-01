import { Img } from "npm:@react-email/components@0.0.22";

export function Logo({
  baseUrl,
  size = 64,
}: {
  baseUrl: string;
  size?: number;
}) {
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
