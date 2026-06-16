const getHealth = (req, res) => {
  res.json({
    app: "Sahel",
    status: "ok",
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  getHealth
};
