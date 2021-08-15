import './App.css';
import { useState } from 'react';
import { ethers } from 'ethers'
import MyToken from './abi/MyToken.json'

// Update with the contract address logged out to the CLI when it was deployed 
const myTokenAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"

function App() {
  // store feePercent in local state
  const [feePercent, setFeePercentValue] = useState()
  const [transactionAmount, setTransactionAmount] = useState()
  const [to, setTo] = useState()
  

  // request access to the user's MetaMask account
  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  // call the smart contract, read the current feePercent value
  async function getFeePercent() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const contract = new ethers.Contract(myTokenAddress, MyToken.abi, provider)
      try {
        const feePercent = await contract.getFeePercent()
        console.log('Current fee percent: %s%', parseInt(feePercent))
      } catch (err) {
        console.log("Error: ", err)
      }
    }    
  }

  // call the smart contract, send an update
  async function setFeePercent() {
    if (!feePercent) return

    if (typeof window.ethereum !== 'undefined') {
      try {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(myTokenAddress, MyToken.abi, signer)
      const transaction = await contract.updateFeePercent(feePercent)
      await transaction.wait()
      getFeePercent()
      } catch (err) {
        console.log(err["data"]["message"]);
      }
    }
  }

  // get the current accumulated fees
  async function getAccumulatedFees() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const contract = new ethers.Contract(myTokenAddress, MyToken.abi, provider)
      try {
        const accumulatedFees = await contract.getAccumulatedFees()
        console.log('Current accumulated fees: %s', parseInt(accumulatedFees))
      } catch (err) {
        console.log("Error: ", err)
      }
    }
  }

  // transferWithFees
  async function transferWithFees() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(myTokenAddress, MyToken.abi, signer)
      try {
        // transactionAmount
        console.log("To: ", to);
        console.log("Amount: ", transactionAmount);
        await contract.transferWithFees(to, transactionAmount);
        // console.log('Current accumulated fees: %s', parseInt(accumulatedFees))
      } catch (err) {
        console.log("Error: ", err)
      }
    }
  }

  async function address() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(myTokenAddress, MyToken.abi, signer)
      const address = await signer.getAddress()
      console.log("Address: ", address)

      const balance = await signer.getBalance()
      console.log("Balance: ", parseInt(balance))

      const token = await signer.getChainId();
      console.log("Token: ", token);
    }
  }

  address();

  const textStyle = {
    textAlign: 'left'
  };

  return (
    <div className="App">
      <header className="App-header">
        <p style={textStyle}>To</p>
        <input onChange={e => setTo(e.target.value)} placeholder="Receiver's address" />

        <p style={textStyle}>Amount</p>
        <input onChange={e => setTransactionAmount(e.target.value)} placeholder="Enter transaction amount" />

        <button onClick={transferWithFees}>Send</button>
        
        <button onClick={getAccumulatedFees} class="mt-4">Get Accumulated Fees</button>
        <button onClick={getFeePercent}>Get Fee Percent</button>
        <input onChange={e => setFeePercentValue(e.target.value)} placeholder="Set fee percent" />
        <button onClick={setFeePercent}>Update Fee Percent</button>
      </header>
    </div>
  );
}

export default App;