import React from "react";
import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "252624407283";
const DEFAULT_MESSAGE = "Hi, I need help with Sahel";

export function buildWhatsAppLink(message = DEFAULT_MESSAGE) {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
}

// Floating button, fixed to the bottom-right corner, sits above the mobile bottom nav.
export default function WhatsAppSupportButton({ message }) {
  return (
    <a
      href={buildWhatsAppLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_rgba(37,211,102,0.4)] transition hover:scale-105 hover:shadow-[0_16px_36px_rgba(37,211,102,0.5)] lg:bottom-6 lg:right-6"
      title="Chat with us on WhatsApp"
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" fill="white" />
    </a>
  );
}
