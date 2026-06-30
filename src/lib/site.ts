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

// Link direto para escrever uma avaliação no Google Business Profile da Ryani.
export const GOOGLE_REVIEW_URL = "https://g.page/r/CVpkPbK0nEBUEBM/review";

export function qrCodeUrl(target: string, size = 240): string {
  const data = encodeURIComponent(target);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=0&data=${data}`;
}

export function whatsappLink(message: string): string {
  const text = encodeURIComponent(message);
  return `https://wa.me/${SITE.whatsappNumber}?text=${text}`;
}