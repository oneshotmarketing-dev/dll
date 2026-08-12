import type { Config } from "tailwindcss";

/**
 * Tokens are the LOCKED design system from DESIGN.md + the Antigravity kickoff
 * "Preserve exact tokens" clause — NOT the auto-generated Material palette that
 * Stitch baked into the raw HTML exports. The exports carried tokens like
 * primary:#e5c186 that conflict with the brand gold #C5A36B; the true intent is
 * the hardcoded hexes (#030712 / #0B1220 / #C5A36B) used inline in those files.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Canvas & surfaces
        canvas: "#030712", // Black Knight — page background
        surface: "#0B1220", // Raised Dark — cards, panels, inputs
        // Accents
        gold: {
          DEFAULT: "#C5A36B", // Champagne Gold — primary CTA, key numbers, winning path
          light: "#D4B57E", // top of the CTA vertical gradient
          cream: "#EFE0C6", // glowing accent-text fill
        },
        blue: "#0BA6DF", // Vanadyl Blue — sparse: tags, links, active icons
        periwinkle: "#96A9CE", // muted / "locked / losing" element, dividers
        // Text
        ink: "#FFFFFF", // primary text / headlines
        muted: "#8A93A3", // Cool Grey — sub-copy, captions
        bronze: "#241A0E", // footer gradient bottom (ember)
      },
      borderColor: {
        hairline: "rgba(255,255,255,0.08)",
      },
      backgroundColor: {
        hairline: "rgba(255,255,255,0.08)",
      },
      fontFamily: {
        // Hanken Grotesk = body/UI AND headlines (brand APK Galeria substitute).
        sans: ["var(--font-hanken)", "system-ui", "sans-serif"],
        // Libre Caslon Text italic = accent words only.
        serif: ["var(--font-caslon)", "Georgia", "serif"],
        // Anton = display face actually used in the home/about exports.
        display: ["var(--font-anton)", "Impact", "sans-serif"],
      },
      fontSize: {
        // Desktop guidance scale from DESIGN.md §3.
        eyebrow: ["13px", { lineHeight: "16px", letterSpacing: "0.12em", fontWeight: "700" }],
        h3: ["28px", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        h2: ["44px", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        h1: ["64px", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
      },
      borderRadius: {
        // DESIGN.md §5 radii tokens.
        pill: "9999px",
        card: "20px",
        input: "12px",
        icon: "10px",
      },
      spacing: {
        // 4·8·12·16·24·32·48·64·96 scale; section vertical padding ~96px desktop.
        section: "96px",
        "section-lg": "128px",
      },
      maxWidth: {
        container: "1200px",
        "container-wide": "1280px",
      },
      boxShadow: {
        // Signature gold glow system (DESIGN.md §7). Gold only, never orange.
        "glow-btn": "0 0 30px rgba(197,163,107,0.45)",
        "glow-btn-hover": "0 0 40px rgba(197,163,107,0.65)",
        "glow-card": "0 0 45px rgba(197,163,107,0.28)",
        "glow-nav": "0 0 40px rgba(197,163,107,0.15)",
        "glow-logo": "0 0 15px rgba(197,163,107,0.4)",
      },
      dropShadow: {
        "glow-accent": "0 0 15px rgba(197,163,107,0.6)",
      },
      backgroundImage: {
        "cta-gradient": "linear-gradient(180deg, #D4B57E 0%, #C5A36B 100%)",
        "footer-fade": "linear-gradient(180deg, #030712 0%, #241A0E 100%)",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        "pulse-dot": "pulse-dot 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
