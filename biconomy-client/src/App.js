import React, { useState, useEffect } from "react";
import detectEthereumProvider from '@metamask/detect-provider';

import logo from "./logo.svg";
import "./App.css";
import {Biconomy} from "@biconomy/mexa";
import {ethers} from "ethers";
import abi from "./abi";
import config from "./config";

function App() {
  const [userAddress, setUserAddress] = useState("");
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    // async function changeValue() {
    //   console.log("change")
     
    // }

    async function initialize(){
    let ethProvider = await detectEthereumProvider()
    const biconomy = new Biconomy(
      ethProvider,
      {
        walletProvider: ethProvider,
        apiKey:"6ZYnN55nk.c135f0a1-527e-485d-b04e-789099159386",
        debug: true,
        strictMode:true

      }
    );
    let ethersProvider = new ethers.providers.Web3Provider(biconomy);

    biconomy
      .onEvent(biconomy.READY, async () => {
        // Initialize your dapp here like getting user accounts etc
        let walletSigner =  await ethersProvider.getSigner();

        let userAddress = await walletSigner.getAddress();
        setUserAddress(userAddress);
        let contract = new ethers.Contract(
          "0xea93079EEC12D54cC0b5478154439ab884D567d5",
          abi,
          biconomy.getSignerByAddress(userAddress)
        );

        setContract(contract);
           var value = await contract.returnCounter();
           console.log("value: " + value.toNumber())
      setValue(value.toNumber());
        let contractInterface = new ethers.utils.Interface(abi);

        let provider = biconomy.getEthersProvider();
        setProvider(provider);
        // changeValue();
      })
      .onEvent(biconomy.ERROR, (error, message) => {
        // Handle error while initializing mexa
        console.log(error, message);
      });
    }

    initialize()
    // let ethProvider = new ethers.providers.JsonRpcProvider("https://speedy-nodes-nyc.moralis.io/4ed632e1419adca7fea61365/eth/rinkeby")
    
  }, []);

  const handleClick = async (event) => {
    event.preventDefault();
    
    let { data } = await contract.populateTransaction.increment();
    // let gasLimit = await provider.estimateGas({
    //   to: "0xF82986F574803dfFd9609BE8b9c7B92f63a1410E",
    //   from: userAddress,
    //   data: data,
    // });

    let txParams = {
      data: data,
      to: "0xea93079EEC12D54cC0b5478154439ab884D567d5",
      from: userAddress,
      // gasLimit: gasLimit, // optional
      signatureType: "EIP712_SIGN",
    };
    console.log("works till here")
    console.log("Address: " + userAddress);
    try {
        let tx = await provider.send("eth_sendTransaction", [txParams]);
    
    console.log("Transaction hash : ", tx);
     provider.once(tx, (transaction) => {
      alert("Incremented!");
      console.log(transaction);
    });
    } catch (error) {
      console.log(error);
    }
  

    //event emitter methods
   
  };

  return (
    <div className="App">
      <button type="button" onClick={handleClick}>
        Increment
      </button>
      <p>{value}</p>
    </div>
  );
}

export default App;
