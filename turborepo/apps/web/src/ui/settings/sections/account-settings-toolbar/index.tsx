"use client";

import type { User } from "next-auth";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label
} from "@t3-chat-clone/ui";
import { UserProfileCard } from "@/ui/settings/user-profile-card";

export function AccountSettingsSection({ user }: { user?: User }) {
  return (
    <div className="space-y-6">
      <UserProfileCard
        className="bg-brand-component border-brand-border"
        user={user}
      />
      <Card className="bg-brand-component border-brand-border text-brand-text">
        <CardHeader>
          <CardTitle className="text-brand-text-emphasis">
            Profile Details
          </CardTitle>
          <CardDescription className="text-brand-text-muted">
            Update your personal information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-brand-text-muted">
              Full Name
            </Label>
            <Input
              id="name"
              defaultValue={user?.name ?? "Andrew Ross"}
              className="bg-brand-background border-brand-border focus:ring-brand-ring text-brand-text"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email" className="text-brand-text-muted">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              defaultValue={user?.email ?? "andrew@windycitydevs.io"}
              className="bg-brand-background border-brand-border focus:ring-brand-ring text-brand-text"
            />
          </div>
          <Button className="bg-brand-primary text-brand-primaryForeground hover:bg-brand-primary/90">
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
