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

// Link direto para escrever uma avaliação no Google Business Profile.
// Substituir pelo link real "https://g.page/r/XXXX/review" ou
// "https://search.google.com/local/writereview?placeid=SEU_PLACE_ID"
// quando a profissional fornecer o Place ID do perfil do Google.
export const GOOGLE_REVIEW_URL =
  "https://www.google.com/search?q=Ryani+Antonio+Nutricionista+Vit%C3%B3ria";

export function qrCodeUrl(target: string, size = 240): string {
  const data = encodeURIComponent(target);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=0&data=${data}`;
}

export function whatsappLink(message: string): string {
  const text = encodeURIComponent(message);
  return `https://wa.me/${SITE.whatsappNumber}?text=${text}`;
}