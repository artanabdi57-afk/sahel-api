const app = require("./app");

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  const address = server.address();
  const actualPort = typeof address === "object" ? address.port : PORT;

  if (process.send) {
    process.send({ type: "sahel-api-ready", port: actualPort });
  }

  console.log(`Sahel API is running on port ${actualPort}`);
});
