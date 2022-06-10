import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Biconomy } from "@biconomy/mexa";
import { ethers } from "ethers";
import abi from "./abi";
import config from "./config";

function App() {
  const [userAddress, setUserAddress] = useState("");
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    async function changeValue() {
      var value = await contract.returnCounter();
      setValue(value);
    }
    const biconomy = new Biconomy(
      ethers.providers.JsonRpcProvider(config.rpc_url),
      {
        apiKey: process.env.api_key,
        debug: true,
      }
    );
    let ethersProvider = new ethers.providers.Web3Provider(biconomy);

    biconomy
      .onEvent(biconomy.READY, () => {
        // Initialize your dapp here like getting user accounts etc
        let walletSigner = ethersProvider.getSigner();

        let userAddress = walletSigner.getAddress();
        setUserAddress(userAddress);
        let contract = new ethers.Contract(
          config.address,
          abi,
          biconomy.getSignerByAddress(userAddress)
        );

        setContract(contract);

        let contractInterface = new ethers.utils.Interface(abi);

        let provider = biconomy.getEthersProvider();
        setProvider(provider);
      changeValue();
      })
      .onEvent(biconomy.ERROR, (error, message) => {
        // Handle error while initializing mexa
        console.log(error, message);
      });
  }, []);

  const handleClick = async (event) => {
    event.preventDefault();
    let { data } = await contract.populateTransaction.increment();
    let gasLimit = await provider.estimateGas({
      to: config.address,
      from: userAddress,
      data: data,
    });

    let txParams = {
      data: data,
      to: config.address,
      from: userAddress,
      gasLimit: gasLimit, // optional
      signatureType: "EIP712_SIGN",
    };

    let tx = await provider.send("eth_sendTransaction", [txParams]);
    console.log("Transaction hash : ", tx);

    //event emitter methods
    provider.once(tx, (transaction) => {
      alert("Incremented!");
      console.log(transaction);
    });
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
