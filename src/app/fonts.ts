import { Nunito, Lora } from "next/font/google";

/**
 * Tazavera font loading (design.md Decision 11).
 * Nunito -> --font-nunito (sans), Lora -> --font-lora (serif).
 * Faces: Nunito 400, 400 italic, 600, 700; Lora 400 italic, 700, 700 italic.
 * The loader's weight × style grid also fetches Lora 400 normal, an accepted extra face.
 */
export const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});
