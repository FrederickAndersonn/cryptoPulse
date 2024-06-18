import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import fs from 'fs';
import path from 'path';

const infuraWsUrl = `wss://lb.drpc.org/ogws?network=sepolia&dkey=AqRyCM0BXENruOaWKbSha4reUuI0KSQR76FWhkHL9tz4`;
const web3 = new Web3(new Web3.providers.WebsocketProvider(infuraWsUrl));


const erc20Token = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'erc20Token.json'), 'utf-8'));
const erc20Abi: AbiItem[] = erc20Token.abi;
const erc20Bytecode = erc20Token.bytecode;

export const createERC20Token = async (name: string, symbol: string, initialSupply: number) => {
  try {
    const accounts = await web3.eth.getAccounts();
    console.log(accounts);
    const deployer = accounts[0];
    console.log(`Deploying ERC20 token from address: ${deployer}`);

    // Create ERC20 contract instance
    const erc20Contract = new web3.eth.Contract(erc20Abi);
    console.log('ERC20 contract instance created successfully');

    // Prepare deployment transaction
    const deployTx = erc20Contract.deploy({
      data: erc20Bytecode,
      arguments: [name, symbol, initialSupply]
    });
    console.log('Deployment transaction prepared successfully');

    const gasEstimate: bigint = await deployTx.estimateGas();
    const gasLimit: bigint = gasEstimate * BigInt(2); // Convert number to bigint explicitly
    
    const tokenInstance = await deployTx.send({
      from: deployer,
      gas: gasLimit.toString() 
    });

    // Log contract deployment information
    console.log(`ERC20 Token deployed successfully at address: ${tokenInstance.options.address}`);

    return tokenInstance.options.address;
  } catch (error) {
    console.error('Error creating ERC20 token:', error);
    throw error;
  }
};

export const transferERC20Token = async (tokenAddress: string, toAddress: string, amount: number) => {
  const accounts = await web3.eth.getAccounts();
  const sender = accounts[0];

  const erc20Contract = new web3.eth.Contract(erc20Abi, tokenAddress);

  const transaction = await erc20Contract.methods.transfer(toAddress, amount).send({
    from: sender
  });

  return transaction.transactionHash;
};
