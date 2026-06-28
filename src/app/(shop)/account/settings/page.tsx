import type { Metadata } from "next";

import { auth } from "@/lib/auth";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { ProfileForm } from "@/components/account/profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Account Settings | NovaShop" };
export const dynamic = "force-dynamic";

export default async function AccountSettingsPage() {
  const session = await auth();

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Account Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm name={session!.user.name ?? ""} email={session!.user.email ?? ""} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Change your account password.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
