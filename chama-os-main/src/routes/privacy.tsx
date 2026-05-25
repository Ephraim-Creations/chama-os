import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { PageFooter } from "@/components/PageFooter";

export const Route = createFileRoute("/privacy")({
  component: Privacy,
  head: () => ({
    meta: [
      { title: "Privacy Policy – Chama-OS" },
      { name: "description", content: "Chama-OS Privacy Policy. We respect your privacy and are transparent about how we use your data." },
    ],
  }),
});

function Privacy() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navbar />
      {/* Header */}
      <section className="border-b border-border pt-20 pb-12 md:pt-28 md:pb-16 px-4 md:px-0">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground text-lg">Last updated: May 25, 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24 px-4 md:px-0">
        <div className="mx-auto max-w-3xl">
          <div className="space-y-12">
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">1. Introduction</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Ephraim Creations ("we", "us", "our", or "Company") operates the Chama-OS application. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service and the choices you have associated with that data.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We use your data to provide and improve our service. By using Chama-OS, you agree to the collection and use of information in accordance with this policy. Unless otherwise defined in this Privacy Policy, terms used in this Privacy Policy have the same meanings as in our Terms of Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">2. Information Collection and Use</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">We collect different types of information for various purposes to provide and improve our service to you.</p>

              <h3 className="text-xl font-semibold mt-8 mb-4 text-foreground">Types of Data Collected:</h3>
              <ul className="space-y-4 text-muted-foreground mb-6">
                <li className="flex gap-3">
                  <span className="text-primary font-bold shrink-0">•</span>
                  <span className="leading-relaxed">
                    <strong className="text-foreground">Personal Data:</strong> While using our service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). This may include, but is not limited to:
                    <ul className="ml-4 mt-3 space-y-2">
                      <li>• Email address</li>
                      <li>• First name and last name</li>
                      <li>• Phone number</li>
                      <li>• Address, State, Province, ZIP/Postal code, City</li>
                      <li>• Chama group information</li>
                      <li>• Financial transaction records (within your chama)</li>
                    </ul>
                  </span>
                </li>
              </ul>

              <ul className="space-y-4 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-bold shrink-0">•</span>
                  <span className="leading-relaxed">
                    <strong className="text-foreground">Usage Data:</strong> We may also collect information on how the service is accessed and used ("Usage Data"). This may include information such as:
                    <ul className="ml-4 mt-3 space-y-2">
                      <li>• Your computer's Internet Protocol address (e.g. IP address)</li>
                      <li>• Browser type, version and time zone setting</li>
                      <li>• Browser plug-in types and versions</li>
                      <li>• Operating system and platform</li>
                      <li>• The pages of our service that you visit, the time and date of your visit, the time spent on those pages and other statistics</li>
                    </ul>
                  </span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">3. Use of Data</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">Chama-OS uses the collected data for various purposes:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-bold shrink-0">•</span>
                  <span>To provide and maintain our service</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold shrink-0">•</span>
                  <span>To notify you about changes to our service</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold shrink-0">•</span>
                  <span>To allow you to participate in interactive features of our service when you choose to do so</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold shrink-0">•</span>
                  <span>To provide customer support</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold shrink-0">•</span>
                  <span>To gather analysis or valuable information so that we can improve our service</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold shrink-0">•</span>
                  <span>To monitor the usage of our service</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold shrink-0">•</span>
                  <span>To detect, prevent and address technical issues and fraud</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">4. Security of Data</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard encryption (SSL/TLS), regular security audits, and best practices to protect your data. All financial transaction data is encrypted end-to-end and stored securely.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">5. Data Retention</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Chama-OS will retain your Personal Data only for as long as necessary for the purposes set out in this Privacy Policy. We will retain and use your Personal Data to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws).
              </p>
              <p className="text-muted-foreground leading-relaxed">
                If you request deletion of your account, we will delete or anonymize your data within 30 days, except where we are required by law to retain it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">6. Third-Party Links</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service may contain links to other sites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies or practices of any third-party sites or services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">7. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">8. Contact Us</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-bold shrink-0">•</span>
                  <span>By email: privacy@ephraimcreations.co.ke</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold shrink-0">•</span>
                  <span>By phone: +254 700 000 000</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold shrink-0">•</span>
                  <span>By visiting our contact page: <a href="/contact" className="text-primary hover:underline">Contact Us</a></span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </section>
      <PageFooter />
    </div>
  );
}
