module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      host: "192.168.33.10",
      port: 8546,
      network_id: "3",
      from: "0x7e09736cb91a1c04591990418e0ed26573fefd33"
    }
  }
};
