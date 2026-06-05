import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { PageFooter } from "@/components/PageFooter";

export const Route = createFileRoute("/terms")({
  component: Terms,
  head: () => ({
    meta: [
      { title: "Terms of Service – Chama-OS" },
      { name: "description", content: "Chama-OS Terms of Service. Please read these terms carefully before using our platform." },
    ],
  }),
});

function Terms() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navbar />
      {/* Header */}
      <section className="border-b border-border pt-20 pb-12 md:pt-28 md:pb-16 px-4 md:px-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">Terms of Service</h1>
          <p className="text-muted-foreground text-lg">Last updated: May 25, 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 md:py-28 px-4 md:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="space-y-12">
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">1. Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Ephraim Creations ("we," "us," "our," or "Company"), concerning your access to and use of the Chama-OS website and mobile application (the "Service").
              </p>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                YOU AGREE THAT BY ACCESSING THE SERVICE, YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY ALL OF THESE TERMS OF SERVICE. IF YOU DO NOT AGREE WITH OUR TERMS OF SERVICE, THEN YOU MAY NOT ACCESS AND USE THE SERVICE.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">2. Intellectual Property Rights</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Unless otherwise indicated, the Service is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Service (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights and unfair competition laws of Kenya, international copyright laws, and international conventions.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Except as expressly provided in these Terms of Service, no part of the Service and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">3. User Representations</h2>
              <p className="text-muted-foreground mb-4">By using the Service, you represent and warrant that:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• All registration information you submit will be true, accurate, current, and complete</li>
                <li>• You will maintain the accuracy of such information and promptly update such registration information as necessary</li>
                <li>• You have the legal capacity and you agree to comply with these Terms of Service and all applicable laws and regulations</li>
                <li>• You are not a minor in the jurisdiction in which you reside</li>
                <li>• You will not access the Service through automated or non-human means, whether through a bot, script or otherwise</li>
                <li>• You will not use the Service for any illegal or unauthorized purpose, nor will you, in the use of the Service, violate any laws in your jurisdiction</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">4. User Registration</h2>
              <p className="text-muted-foreground mb-4">
                If the Service requires you to register, you agree to register only once per person or entity, and to provide information that is true, accurate, current, and complete. You are responsible for maintaining the confidentiality of your account and password and for restricting access to your account. You agree to accept responsibility for all activities that occur under your account or password.
              </p>
              <p className="text-muted-foreground">
                If you believe your account has been accessed without permission, you should immediately notify us. You agree not to share your account credentials or allow anyone else to use your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">5. Prohibited Activities</h2>
              <p className="text-muted-foreground mb-4">You may not access or use the Service for any purpose other than that for which we make the Service available. The Service may not be used in connection with any commercial endeavors except those specifically endorsed or approved by us.</p>
              <p className="text-muted-foreground mb-4">As a user of the Service, you agree not to:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Systematically retrieve data or content from the Service to create or compile, directly or indirectly, in single or multiple downloads, a collection, compilation, database, or directory without written permission from us</li>
                <li>• Make any unauthorized use of the Service, including collecting usernames and/or email addresses of users by electronic or other means for the purpose of sending unsolicited email</li>
                <li>• Circumvent, disable, or otherwise interfere with security-related features of the Service</li>
                <li>• Engage in unauthorized framing of or linking to the Service</li>
                <li>• Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information</li>
                <li>• Make improper use of our support services or submit false reports of abuse or misconduct</li>
                <li>• Engage in any automated use of the system, such as using scripts to alter our content</li>
                <li>• Attempt to disrupt the proper operation of the Service through any means, technique, or process</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">6. Financial Data and Accuracy</h2>
              <p className="text-muted-foreground mb-4">
                You acknowledge that Chama-OS is a records-only system. We do not hold, transfer, or manage actual funds. You are solely responsible for the accuracy and completeness of all financial data entered into the Service. We are not liable for any financial errors, miscalculations, or disputes arising from inaccurate data entry.
              </p>
              <p className="text-muted-foreground">
                By using the Service to track financial transactions, you represent that you have the authority to do so on behalf of your chama or group and that all information you enter is accurate and authorized.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">7. Third-Party Links</h2>
              <p className="text-muted-foreground">
                The Service may contain links to third-party websites and applications that are not operated by us. This Terms of Service applies only to the Service. We are not responsible for the content, accuracy, legality, or any other aspect of third-party websites. Your use of third-party websites is governed by their terms and our responsibility ends when you leave the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">8. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground mb-4">
                THE SERVICE IS PROVIDED ON AN "AS-IS" AND "AS AVAILABLE" BASIS. WE MAKE NO WARRANTIES, EXPRESSED OR IMPLIED, REGARDING THE SERVICE. TO THE FULLEST EXTENT PERMISSIBLE PURSUANT TO APPLICABLE LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
              </p>
              <p className="text-muted-foreground">
                WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE; THAT THE RESULTS THAT MAY BE OBTAINED FROM THE SERVICE WILL BE ACCURATE OR RELIABLE; OR THAT ANY ERRORS IN THE SERVICE WILL BE CORRECTED.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">9. Limitation of Liability</h2>
              <p className="text-muted-foreground mb-4">
                IN NO EVENT SHALL THE COMPANY OR ITS SUPPLIERS BE LIABLE FOR ANY DAMAGES (INCLUDING, WITHOUT LIMITATION, DAMAGES FOR LOSS OF DATA OR PROFIT, OR DUE TO BUSINESS INTERRUPTION) ARISING OUT OF THE USE OR INABILITY TO USE THE MATERIALS ON CHAMA-OS, EVEN IF WE OR AN AUTHORIZED REPRESENTATIVE OF EPHRAIM CREATIONS HAS BEEN NOTIFIED ORALLY OR IN WRITING OF THE POSSIBILITY OF SUCH DAMAGE.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">10. Indemnification</h2>
              <p className="text-muted-foreground">
                You agree to defend, indemnify, and hold harmless the Company and its licensee, and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms of Service or your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">11. Modification and Interruptions</h2>
              <p className="text-muted-foreground mb-4">
                We reserve the right to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice. You agree that we will not be liable to you or to any third party for any modification, suspension, or discontinuance of the Service.
              </p>
              <p className="text-muted-foreground">
                We cannot guarantee that the Service will be available at all times. We may experience hardware, software, or other problems or need to perform maintenance related to the Service, resulting in interruptions, delays, or errors. We reserve the right to interrupt or suspend access to the Service at any time, for any reason.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">12. Governing Law</h2>
              <p className="text-muted-foreground">
                These terms and conditions are governed by and construed in accordance with the laws of the Republic of Kenya, and you irrevocably submit to the exclusive jurisdiction of the courts in Nairobi, Kenya.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">13. Contact Information</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Email: legal@ephraimcreations.co.ke</li>
                <li>• Phone: +254 700 000 000</li>
                <li>• Website: <a href="https://www.ephraimcreations.co.ke/" className="text-primary hover:underline">www.ephraimcreations.co.ke</a></li>
              </ul>
            </section>
          </div>
        </div>
      </section>
      <PageFooter />
    </div>
  );
}
