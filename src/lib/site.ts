export const SITE = {
  name: "Ryani Antonio",
  brand: "Nutrição Avançada",
  crn: "CRN-9 29813",
  whatsappNumber: "5527998223080",
  whatsappDisplay: "(27) 99822-3080",
  instagram: "https://www.instagram.com/ryaniantonio/",
  linkedin: "https://www.linkedin.com/in/ryani-antonio-987a0b179",
  instagramHandle: "@ryaniantonio",
};

export function whatsappLink(message: string): string {
  const text = encodeURIComponent(message);
  return `https://wa.me/${SITE.whatsappNumber}?text=${text}`;
}