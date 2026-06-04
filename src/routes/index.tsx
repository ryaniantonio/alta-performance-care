import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { AuthorityBar } from "@/components/site/AuthorityBar";
import { SpecialtiesTabs } from "@/components/site/SpecialtiesTabs";
import { About } from "@/components/site/About";
import { BlogPreview } from "@/components/site/BlogPreview";
import { ConversionFAQ } from "@/components/site/ConversionFAQ";
import { Testimonials } from "@/components/site/Testimonials";
import { GoogleReview } from "@/components/site/GoogleReview";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ryani Antonio — Nutrição Clínica, Esportiva e Pediátrica" },
      {
        name: "description",
        content:
          "Nutricionista CRN-9 29813. Atendimento clínico, esportivo e pediátrico com rigor científico e cuidado humanizado em Vitória/ES e online.",
      },
      { property: "og:title", content: "Ryani Antonio — Nutrição Clínica, Esportiva e Pediátrica" },
      {
        property: "og:description",
        content: "Do ambiente hospitalar ao consultório: ciência de ponta para sua saúde, performance e a nutrição do seu filho.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <AuthorityBar />
        <SpecialtiesTabs />
        <About />
        <Testimonials />
        <BlogPreview />
        <ConversionFAQ />
        <GoogleReview />
      </main>
      <Footer />
    </div>
  );
}
