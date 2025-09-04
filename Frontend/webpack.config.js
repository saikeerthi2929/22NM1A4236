const path = require("path");

module.exports = {
  resolve: {
    alias: {
      "@store": path.resolve(__dirname, "src/store/"),
      "@api": path.resolve(__dirname, "src/api/"),
      "@utils": path.resolve(__dirname, "src/utils/"),
      "@pages": path.resolve(__dirname, "src/pages/"),
      "@components": path.resolve(__dirname, "src/components/"),
    },
  },
};
