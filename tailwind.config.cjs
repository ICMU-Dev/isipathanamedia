/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "hsl(var(--primary))",
          light: "#90ee90",
          neon: "#4bc433",
          foreground: "hsl(var(--primary-foreground))",
        },
        dark: "#000000",
        white: "#ffffff",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        // ─── Admin theme tokens (CSS var–driven) ───
        "admin-bg": "var(--admin-bg, #000)",
        "admin-card": "var(--admin-card-bg, #111)",
        "admin-border": "var(--admin-border, rgba(255,255,255,0.08))",
        "admin-input": "var(--admin-input-bg, #0a0a0a)",
        "admin-text": "var(--admin-text-primary, #fff)",
        "admin-muted": "var(--admin-text-secondary, #a1a1aa)",
        "theme-accent": "rgba(var(--accent-rgb, 75, 196, 51), <alpha-value>)",
      },
      fontFamily: {
        sans: ["Montserrat", "sans-serif"],
        palingu: ["Palingu", "sans-serif"],
        palingu2: ["Palingu2", "sans-serif"],
        konexy: ["Konexy", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      keyframes: {
        fadeIn: {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
        fadeInUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        fadeInRight: {
          "0%": {
            opacity: "0",
            transform: "translateX(-20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        fadeInLeft: {
          "0%": {
            opacity: "0",
            transform: "translateX(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        reveal: {
          "0%": {
            clipPath: "inset(0 100% 0 0)",
          },
          "100%": {
            clipPath: "inset(0 0 0 0)",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-20px)",
          },
        },
        marquee: {
          "0%": {
            transform: "translateX(0%)",
          },
          "100%": {
            transform: "translateX(-50%)",
          },
        },
        bgShift: {
          "0%, 100%": {
            backgroundColor: "#000000",
          },
          "25%": {
            backgroundColor: "#010a01",
          },
          "50%": {
            backgroundColor: "#001400",
          },
          "75%": {
            backgroundColor: "#010a01",
          },
        },
        haloFloat: {
          "0%": {
            transform: "translate(-50%, -50%) scale(1)",
            opacity: "0.04",
          },
          "33%": {
            transform: "translate(-40%, -60%) scale(1.4)",
            opacity: "0.08",
          },
          "66%": {
            transform: "translate(-60%, -40%) scale(0.8)",
            opacity: "0.05",
          },
          "100%": {
            transform: "translate(-50%, -50%) scale(1)",
            opacity: "0.04",
          },
        },
        haloFloat2: {
          "0%": {
            transform: "translate(50%, 50%) scale(1)",
            opacity: "0.03",
          },
          "33%": {
            transform: "translate(35%, 70%) scale(1.2)",
            opacity: "0.07",
          },
          "66%": {
            transform: "translate(65%, 30%) scale(0.85)",
            opacity: "0.04",
          },
          "100%": {
            transform: "translate(50%, 50%) scale(1)",
            opacity: "0.03",
          },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-4px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(4px)" },
        },
        slideDown: {
          "from": { height: 0, opacity: 0 },
          "to": { height: "var(--radix-accordion-content-height, auto)", opacity: 1 }
        }
      },
      animation: {
        "fade-in": "fadeIn 0.8s ease-out forwards",
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
        "fade-in-right": "fadeInRight 0.8s ease-out forwards",
        "fade-in-left": "fadeInLeft 0.8s ease-out forwards",
        reveal: "reveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        float: "float 6s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
        "bg-shift": "bgShift 8s ease-in-out infinite",
        "halo-float": "haloFloat 12s ease-in-out infinite",
        "halo-float-2": "haloFloat2 16s ease-in-out infinite",
        shake: "shake 0.5s ease-in-out",
        "slide-down": "slideDown 0.3s ease-out forwards",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography"), require("daisyui")],
};

