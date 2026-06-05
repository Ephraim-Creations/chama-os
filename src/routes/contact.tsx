import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { PageFooter } from "@/components/PageFooter";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({
    meta: [
      { title: "Contact Us – Chama-OS" },
      { name: "description", content: "Get in touch with the Chama-OS team. We'd love to hear from you." },
    ],
  }),
});

function Contact() {
  const [formState, setFormState] = useState<"idle" | "submitting" | "success">("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("submitting");
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setFormState("success");
    setFormData({ name: "", email: "", mobile: "", subject: "", message: "" });
    setTimeout(() => setFormState("idle"), 3000);
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      description: "Send us a message anytime",
      value: "info@ephraimcreations.co.ke",
      href: "mailto:info@ephraimcreations.co.ke",
    },
    {
      icon: Phone,
      title: "Phone",
      description: "Call us during business hours",
      value: "+254 112 268 873",
      href: "tel:+254112268873",
    },
    {
      icon: MapPin,
      title: "Office",
      description: "Visit us in Nairobi",
      value: "Nairobi, Kenya",
      href: "#",
    },
  ];

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navbar />
      {/* Header Section */}
      <section className="border-b border-border pt-20 pb-12 md:pt-28 md:pb-16 px-4 md:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            Get in Touch
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            We'd love to hear from you
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl">
            Have questions about Chama-OS? Want to partner with us? Or just want to say hello? Reach out and let's chat.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 md:py-28 px-4 md:px-8 bg-muted/30 border-b border-border">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-6">
            {contactMethods.map((method) => (
              <a
                key={method.title}
                href={method.href}
                className="rounded-2xl border border-border bg-card p-8 hover:shadow-lg hover:border-primary transition-all"
              >
                <div className="inline-block rounded-xl bg-primary/10 p-3 mb-4">
                  <method.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{method.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{method.description}</p>
                <p className="font-semibold text-foreground">{method.value}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 md:py-28 px-4 md:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Send us a message</h2>
            <p className="text-lg text-muted-foreground">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>
          </div>

          {formState === "success" && (
            <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-6 flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-green-900">Message sent successfully!</h3>
                <p className="text-sm text-green-700">We'll get back to you shortly.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Mary M..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="johnexample@gmail.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Mobile Number</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="+254 712 345 678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="How can we help?"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Tell us more about your inquiry..."
              />
            </div>

            <Button
              type="submit"
              disabled={formState === "submitting"}
              className="w-full h-12 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              {formState === "submitting" ? (
                <>Sending...</>
              ) : (
                <>
                  Send Message <Send className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-28 px-4 md:px-8 border-t border-border bg-muted/30">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "How long does it take to set up Chama-OS?",
                a: "You can get started in under 5 minutes. Create your account, invite members via email, and start tracking your chama finances immediately.",
              },
              {
                q: "Is there a free trial?",
                a: "Yes! Our Essential plan is free forever. It includes up to 15 members and core features like savings tracking and meeting minutes.",
              },
              {
                q: "Can I migrate from my current system?",
                a: "Absolutely. We can help you import historical data. Contact our team for assistance with data migration.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept M-Pesa, bank transfers, and card payments. We're constantly adding more payment options for convenience.",
              },
              {
                q: "Is my data secure?",
                a: "Yes, we use enterprise-grade encryption and comply with international data protection standards. Your data is yours and is never shared.",
              },
            ].map((faq, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <PageFooter />
    </div>
  );
}
