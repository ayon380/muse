module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
 
    // Add any other content paths as needed
  ],
  theme: {
    extend: {
      fontFamily: {
        lucy: ["var(--font-lucy)"],
        rethink: ["var(--font-rethink)"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      // Extend other theme properties if necessary
    },
  },
  plugins: [
    // Add any other plugins as needed
   
  ],
};
