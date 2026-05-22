import { Nunito } from "next/font/google";
import "@/styles/auth-theme.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-auth",
  weight: ["400", "600", "700", "800"],
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`auth-theme ${nunito.className}`}>{children}</div>
  );
}
