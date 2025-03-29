import { defineChain } from "viem";


export const lineaSepolia = defineChain({
  id: 59141,
  name: "Linea Sepolia Testnet",
  network: "linea-sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.sepolia.linea.build"],
    },
    public: {
      http: ["https://rpc.sepolia.linea.build"],
    },
  },
  blockExplorers: {
    default: {
      name: "Linea Explorer",
      url: "https://sepolia.lineascan.build",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 138793,
    },
  },
});
