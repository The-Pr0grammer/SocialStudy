const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:3000", // Assuming your backend is running on port 3000
      changeOrigin: true,
    })
  );
};
