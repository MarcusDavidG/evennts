import { ethers } from 'ethers';
import EventManagerABI from './abi/EventManagerABI.json';

// Chain configurations
export const CHAINS = {
  crossfi: {
    chainId: 4157,
    name: 'CrossFi Chain',
    rpcUrl: process.env.NEXT_PUBLIC_CROSSFI_RPC || 'https://testnet-rpc.crossfi.org',
    explorer: 'https://scan.testnet.ms',
    contractAddress: process.env.NEXT_PUBLIC_CROSSFI_EVENTMANAGER_ADDRESS || '',
  },
  lisk: {
    chainId: 4202,
    name: 'Lisk Sepolia',
    rpcUrl: process.env.NEXT_PUBLIC_LISK_RPC || 'https://rpc.sepolia.lisk.com',
    explorer: 'https://explorer.sepolia.lisk.com',
    contractAddress: process.env.NEXT_PUBLIC_LISK_EVENTMANAGER_ADDRESS || '',
  },
};

// Get provider for a specific chain
export function getProvider(chain: 'crossfi' | 'lisk') {
  const chainConfig = CHAINS[chain];
  return new ethers.providers.JsonRpcProvider(chainConfig.rpcUrl);
}

// Get contract instance for a specific chain
export function getEventManagerContract(chain: 'crossfi' | 'lisk') {
  const chainConfig = CHAINS[chain];
  const provider = getProvider(chain);

  if (!chainConfig.contractAddress) {
    console.warn(`${chainConfig.name} EventManager contract address not configured`);
    return null;
  }

  return new ethers.Contract(
    chainConfig.contractAddress,
    EventManagerABI,
    provider
  );
}

// Get contract instance with signer for a specific chain
export function getEventManagerContractWithSigner(chain: 'crossfi' | 'lisk', signer: ethers.Signer) {
  const contract = getEventManagerContract(chain);
  if (!contract) {
    throw new Error(`${CHAINS[chain].name} contract not available`);
  }
  return contract.connect(signer);
}

// Get chain configuration
export function getChainConfig(chain: 'crossfi' | 'lisk') {
  return CHAINS[chain];
}

// Get all available chains
export function getAvailableChains() {
  return Object.keys(CHAINS) as Array<'crossfi' | 'lisk'>;
}

// Check if a chain is configured (has contract address)
export function isChainConfigured(chain: 'crossfi' | 'lisk') {
  return Boolean(CHAINS[chain].contractAddress);
}

// Get configured chains only
export function getConfiguredChains() {
  return getAvailableChains().filter(chain => isChainConfigured(chain));
}

// Switch network in wallet
export async function switchToChain(chain: 'crossfi' | 'lisk') {
  const chainConfig = CHAINS[chain];

  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainConfig.chainId.toString(16)}` }],
      });
    } catch (switchError: unknown) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError && typeof switchError === 'object' && 'code' in switchError && switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${chainConfig.chainId.toString(16)}`,
                chainName: chainConfig.name,
                rpcUrls: [chainConfig.rpcUrl],
                blockExplorerUrls: [chainConfig.explorer],
                nativeCurrency: {
                  name: chain === 'crossfi' ? 'XFI' : 'ETH',
                  symbol: chain === 'crossfi' ? 'XFI' : 'ETH',
                  decimals: 18,
                },
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add network:', addError);
          throw addError;
        }
      } else {
        console.error('Failed to switch network:', switchError);
        throw switchError;
      }
    }
  } else {
    throw new Error('MetaMask not detected');
  }
}

export default {
  CHAINS,
  getProvider,
  getEventManagerContract,
  getEventManagerContractWithSigner,
  getChainConfig,
  getAvailableChains,
  isChainConfigured,
  getConfiguredChains,
  switchToChain,
};
