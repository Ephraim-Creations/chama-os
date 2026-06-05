import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { PageFooter } from "@/components/PageFooter";
import logoImage from "@/assets/chama-OS-logo.png";
import ephFounderImage from "@/assets/Eph-Founder.png";
import { ArrowRight, CheckCircle2, Heart, Zap, Users, Globe } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: "About Chama-OS – Transparent Records for Every Chama" },
      { name: "description", content: "Learn about Chama-OS and Ephraim Creations. We're on a mission to digitize the world and empower communities with transparent, people-first financial systems." },
    ],
  }),
});

function About() {
  const values = [
    { icon: Heart, title: "People First", description: "Every decision prioritizes user needs and community well-being over profit." },
    { icon: Globe, title: "Digital Inclusion", description: "We build for everyone, in Kenya and beyond, making finance transparent and accessible." },
    { icon: Zap, title: "Innovation", description: "We challenge the status quo with thoughtful, elegant solutions to age-old problems." },
    { icon: Users, title: "Trust", description: "Transparency and accountability are built into everything we create." },
  ];

  const team = [
    { name: "Ephraim", role: "Founder & Visionary", image: ephFounderImage },
    { name: "Evans", role: "Co-Founder & Developer", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=600&fit=crop" },
  ];

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navbar />
      {/* Header Section */}
      <section className="border-b border-border pt-20 pb-12 md:pt-28 md:pb-16 px-4 md:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            Our Story
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Digitizing finance for communities across <span className="text-primary">Kenya</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl">
            Chama-OS is built on a simple belief: financial transparency should be the default, not the exception. We're on a mission to eliminate manual bookkeeping and empower communities to thrive together.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 md:py-28 px-4 md:px-8 border-b border-border bg-muted/30">
        <div className="mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-4">
                We believe that every chama, every group, and every community deserves access to transparent, tamper-proof financial systems. Traditional record-keeping—whether on paper or WhatsApp—breeds distrust and inefficiency.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                Chama-OS changes this. By making every transaction, approval, and decision visible to all members, we restore trust and empower communities to make better financial decisions together.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground">Transparent, append-only audit logs</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground">Real-time financial visibility for all members</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground">Role-based access control and approvals</span>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 border border-border aspect-square flex items-center justify-center p-12">
              <img
                src={logoImage}
                alt="Chama-OS logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 md:py-28 px-4 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These principles guide every decision we make, every line of code we write, and every interaction with our community.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border border-border bg-card p-8 text-center hover:shadow-lg transition-shadow">
                <div className="inline-block rounded-xl bg-primary/10 p-3 mb-4">
                  <v.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{v.title}</h3>
                <p className="text-muted-foreground">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 md:py-28 px-4 md:px-8 border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet the Team</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A dedicated team of builders and visionaries committed to transforming finance in Kenya and beyond.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className="rounded-2xl overflow-hidden mb-4 aspect-square bg-card border border-border">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-semibold">{member.name}</h3>
                <p className="text-sm text-primary font-medium">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 md:py-28 px-4 md:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Why We Started</h2>
          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              Every chama in Kenya faces the same challenge: trust. Members contribute their hard-earned money to group savings, loans, and investments, but records are often scattered across WhatsApp, notebooks, or stored only with the treasurer.
            </p>
            <p>
              This leads to disputes, mistrust, and groups falling apart. We've seen it happen too many times. Strong groups with genuine potential fail not because of a bad idea, but because of poor record-keeping and lack of transparency.
            </p>
            <p>
              That's why Ephraim Creations built Chama-OS. We wanted to create a system where every member, no matter their technical skill, could see the same truth in real-time. A system where money is tracked transparently, approvals are logged, and trust is rebuilt through transparency—not hope.
            </p>
            <p>
              Today, Chama-OS is trusted by hundreds of chamas across Kenya, managing millions of shillings in savings and loans. We're just getting started.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 px-4 md:px-8 border-t border-border bg-gradient-to-b from-primary/10 to-background">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Digitize Your Chama?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join hundreds of chamas already using Chama-OS to manage their finances transparently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/#"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 font-semibold text-foreground hover:bg-muted"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
      <PageFooter />
    </div>
  );
}
