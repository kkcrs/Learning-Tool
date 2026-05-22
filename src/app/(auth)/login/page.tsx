import { LoginScreen } from "@/components/auth/login-screen";

export default function LoginPage({
  searchParams,
}: {
  searchParams: {
    error?: string;
    info?: string;
    email?: string;
    unconfirmed?: string;
  };
}) {
  return <LoginScreen {...searchParams} />;
}
