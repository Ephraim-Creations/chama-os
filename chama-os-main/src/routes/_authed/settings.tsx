import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { chama, currentUser } from "@/lib/mock-data";
import { Copy } from "lucide-react";

export const Route = createFileRoute("/_authed/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [fontSize, setFontSize] = useState<"base" | "lg" | "xl">("base");
  const [language, setLanguage] = useState<"en" | "sw">("en");

  const applyFontSize = (size: "base" | "lg" | "xl") => {
    setFontSize(size);
    document.documentElement.dataset.fontSize = size === "base" ? "" : size;
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Settings" description="Tune the app for how you read and work best." />

      <Tabs defaultValue="accessibility" className="space-y-5">
        <TabsList className="h-12 rounded-xl bg-muted p-1">
          <TabsTrigger value="accessibility" className="h-10 rounded-lg px-4 text-[15px]">Accessibility</TabsTrigger>
          <TabsTrigger value="profile" className="h-10 rounded-lg px-4 text-[15px]">Profile</TabsTrigger>
          <TabsTrigger value="chama" className="h-10 rounded-lg px-4 text-[15px]">Chama</TabsTrigger>
          <TabsTrigger value="notifications" className="h-10 rounded-lg px-4 text-[15px]">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="accessibility">
          <Card title="Display & language" desc="Make the app comfortable to read.">
            <Field label="Font size">
              <RadioGroup value={fontSize} onValueChange={(v) => applyFontSize(v as "base" | "lg" | "xl")} className="flex gap-2">
                {(["base","lg","xl"] as const).map((s) => (
                  <Label key={s} htmlFor={`fs-${s}`}
                    className={`flex h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 ${fontSize === s ? "border-primary bg-primary/5" : "border-border"}`}>
                    <RadioGroupItem id={`fs-${s}`} value={s} />
                    <span className="font-medium">{s === "base" ? "Normal" : s === "lg" ? "Large" : "Extra large"}</span>
                  </Label>
                ))}
              </RadioGroup>
            </Field>

            <Field label="High contrast mode" hint="Higher contrast text and borders.">
              <Switch />
            </Field>

            <Field label="Language">
              <RadioGroup value={language} onValueChange={(v) => setLanguage(v as "en" | "sw")} className="flex gap-2">
                <Label htmlFor="lang-en" className={`flex h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 ${language === "en" ? "border-primary bg-primary/5" : "border-border"}`}>
                  <RadioGroupItem id="lang-en" value="en" /><span className="font-medium">English</span>
                </Label>
                <Label htmlFor="lang-sw" className={`flex h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 ${language === "sw" ? "border-primary bg-primary/5" : "border-border"}`}>
                  <RadioGroupItem id="lang-sw" value="sw" /><span className="font-medium">Kiswahili</span>
                </Label>
              </RadioGroup>
            </Field>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card title="Profile" desc="Manage your personal information.">
            <Field label="Full name"><Input className="h-11 rounded-xl" defaultValue={currentUser.name} /></Field>
            <Field label="Phone number"><Input className="h-11 rounded-xl" defaultValue="+254 712 345 678" /></Field>
            <Field label="Email"><Input className="h-11 rounded-xl" defaultValue="wanjiku@umoja.co.ke" /></Field>
            <div className="pt-2"><Button className="h-11 rounded-xl font-semibold">Save changes</Button></div>
          </Card>
        </TabsContent>

        <TabsContent value="chama">
          <Card title="Chama information" desc="Visible to all members of your chama.">
            <Field label="Chama name"><Input className="h-11 rounded-xl" defaultValue={chama.name} /></Field>
            <Field label="Location"><Input className="h-11 rounded-xl" defaultValue={chama.location} /></Field>
            <Field label="Monthly contribution (Ksh)"><Input className="h-11 rounded-xl" type="number" defaultValue={chama.monthlyContribution} /></Field>
            <Field label="Invite code" hint="Share this code with new members.">
              <div className="flex gap-2">
                <Input className="h-11 rounded-xl font-mono tracking-widest" defaultValue={chama.inviteCode} readOnly />
                <Button variant="outline" className="h-11 rounded-xl"><Copy className="mr-2 h-4 w-4" />Copy</Button>
              </div>
            </Field>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card title="Notification preferences" desc="Choose what reminders you receive.">
            <Field label="Contribution reminders"><Switch defaultChecked /></Field>
            <Field label="Loan due reminders"><Switch defaultChecked /></Field>
            <Field label="Meeting reminders"><Switch defaultChecked /></Field>
            <Field label="Announcements"><Switch defaultChecked /></Field>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Card({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-5 space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-2 border-t border-border pt-5 sm:grid-cols-[1fr_2fr] sm:items-center first:border-0 first:pt-0">
      <div>
        <div className="text-[15px] font-semibold text-foreground">{label}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}
