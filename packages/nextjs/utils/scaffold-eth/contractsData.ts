import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { GenericContractsDeclaration, contracts } from "~~/utils/scaffold-eth/contract";
import externalContracts from "~~/contracts/externalContracts";

const DEFAULT_ALL_CONTRACTS: GenericContractsDeclaration[number] = {};

export function useAllContracts() {
  const { targetNetwork } = useTargetNetwork();
  const contractsData = contracts?.[targetNetwork.id];
  const externalContractsData = externalContracts?.[targetNetwork.id as keyof typeof externalContracts];
  
  // 合并内部合约和外部合约
  const allContracts = { ...contractsData } || DEFAULT_ALL_CONTRACTS;
  
  // 添加外部合约（如果存在）
  if (externalContractsData) {
    Object.entries(externalContractsData).forEach(([contractName, contractData]) => {
      allContracts[contractName] = {
        ...contractData,
        external: true // 标记为外部合约
      };
    });
  }
  
  return allContracts;
}
