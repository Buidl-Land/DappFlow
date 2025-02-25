import { defineChain } from "viem";

export const monadTestnet = defineChain({
  id: 10_143,
  name: "Monad Testnet",
  network: "monad-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Monad",
    symbol: "MON",
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.monad.xyz"],
      webSocket: ["wss://testnet-rpc.monad.xyz/ws"],
    },
    public: {
      http: ["https://testnet-rpc.monad.xyz"],
      webSocket: ["wss://testnet-rpc.monad.xyz/ws"],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: "https://testnet-explorer.monad.xyz",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 1234,
    },
  },
});

export const flowEvmTestnet = defineChain({
  id: 12_345, // Replace with actual Flow EVM testnet chain ID
  name: "Flow EVM Testnet",
  network: "flow-evm-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Flow",
    symbol: "FLOW",
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-evm.flow.com"], // Replace with actual Flow EVM RPC URL
      webSocket: ["wss://testnet-evm.flow.com/ws"], // Replace with actual Flow EVM WebSocket URL
    },
    public: {
      http: ["https://testnet-evm.flow.com"], // Replace with actual Flow EVM RPC URL
      webSocket: ["wss://testnet-evm.flow.com/ws"], // Replace with actual Flow EVM WebSocket URL
    },
  },
  blockExplorers: {
    default: {
      name: "Flow Explorer",
      url: "https://testnet-explorer.flow.com", // Replace with actual Flow EVM explorer URL
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11", // Replace with actual Flow EVM multicall address
      blockCreated: 1234,
    },
  },
  testnet: true,
});
