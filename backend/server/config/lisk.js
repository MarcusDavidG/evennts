import { ethers } from 'ethers';
import EventManagerABI from '../../frontend/lib/abi/EventManagerABI.json' assert { type: 'json' };

const liskProvider = new ethers.providers.JsonRpcProvider(process.env.LISK_SEPOLIA_RPC);
const liskContractAddress = process.env.LISK_EVENTMANAGER_ADDRESS;

// Initialize wallet for Lisk contract interactions
const liskWallet = process.env.PRIVATE_KEY 
  ? new ethers.Wallet(process.env.PRIVATE_KEY, liskProvider)
  : null;

// Get Lisk contract instance
export function getEventManagerContract() {
  if (!liskContractAddress) {
    console.warn('Lisk EventManager contract address not configured. Using mock data fallback.');
    return null;
  }
  
  console.log('Using Lisk EventManager contract address:', liskContractAddress);
  
  return new ethers.Contract(
    liskContractAddress,
    EventManagerABI,
    liskProvider
  );
}

// Get Lisk contract instance with signer
export function getEventManagerContractWithSigner() {
  if (!liskWallet) {
    throw new Error('Lisk wallet not configured');
  }
  
  const contract = getEventManagerContract();
  if (!contract) {
    throw new Error('Lisk contract not available');
  }
  return contract.connect(liskWallet);
}

export default {
  getEventManagerContract,
  getEventManagerContractWithSigner
};
