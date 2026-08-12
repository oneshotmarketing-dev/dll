import { Hanken_Grotesk, Libre_Caslon_Text, Anton } from "next/font/google";

// Body / UI / headlines — the brand's APK Galeria web substitute (DESIGN.md §3).
export const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-hanken",
  display: "swap",
});

// Accent words inside headlines only — italic included.
export const caslon = Libre_Caslon_Text({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-caslon",
  display: "swap",
});

// Display face actually used for some headings in the home/about exports.
export const anton = Anton({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-anton",
  display: "swap",
});

export const fontVariables = `${hanken.variable} ${caslon.variable} ${anton.variable}`;
