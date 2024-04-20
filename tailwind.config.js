module.exports = {
  content: [
    "app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      height: {
        doc: "100svh",
      },
      width: {
        doc: "100svw",
      },
      backgroundSize: {
        l: "500% 500%",
      },
      keyframes: {
        gradient: {
          "0%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
          "100%": { "background-position": "0% 50%" },
        },
      },
      animation: {
        gradient: "gradient 60s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
