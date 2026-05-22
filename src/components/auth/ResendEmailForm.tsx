import { resendConfirmationEmail } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ResendEmailForm({ defaultEmail }: { defaultEmail?: string }) {
  return (
    <form
      action={resendConfirmationEmail}
      className="relative z-10 mt-3 space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3"
    >
      <p className="text-xs text-amber-900">
        注册已成功，但需先验证邮箱才能登录。没收到邮件可点击下方重发。
      </p>
      <Input
        name="email"
        type="email"
        defaultValue={defaultEmail}
        placeholder="注册邮箱"
        required
      />
      <Button type="submit" variant="outline" size="sm" className="w-full">
        重新发送验证邮件
      </Button>
    </form>
  );
}
