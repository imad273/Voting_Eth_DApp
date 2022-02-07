import './App.css';
import { useState, useEffect } from 'react';
import Web3 from 'web3';
import Navbar from './Components/Navbar';


function App() {

  const [Account, setAccount] = useState(0);
  const [Msg, setMsg] = useState(false);
  const contract_address = "0x58C345bB9eCe945100D2ec55DB3cE5d6F9c85C34";

  useEffect(() => {
    checkAccount();
    getProposals();
  }, [Account]);

  const connectToMetamask = async () => {
    var accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0]);
  }

  const checkAccount = async () => {
    const web3 = new Web3(Web3.givenProvider);
    const accounts = await web3.eth.getAccounts();
    setAccount(accounts[0]);
  }

  const getAbi = async () => {
    var request = await fetch("./Ballot.json", {
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json'
      }
    });
    var response = await request.json();
    return response;
  }

  const connectToContract = async () => {
    const web3 = new Web3(Web3.givenProvider);

    const abiJSON = await getAbi();

    const contract = new web3.eth.Contract(abiJSON.abi, contract_address);

    return contract;
  }

  const getProposals = async () => {
    const contract = await connectToContract();

    const proposals = await contract.methods.getAllProposals().call();

    const web3 = new Web3(Web3.givenProvider);

    const choisesDiv = document.getElementById("choises");
    choisesDiv.innerHTML = "";

    for (var i = 0; i < proposals.length; i++) {
      var div = document.createElement("div");
      div.className = "flex items-center flex-col shadow-mine p-2 my-4 rounded-xl bg-white/40 backdrop-blur-sm";
      div.innerHTML = `
        <h3 class='font-semibold my-1.5 text-xl text-slate-800'>${web3.utils.toAscii(proposals[i].name)}</h3>
        <span class='text-sm'>Vote: ${proposals[i].voteCount}</span>
        <button class='submit-vote w-4/6 py-1 my-2.5 rounded-md bg-gradient-to-r from-pink-500 to-violet-500 text-white px-4'>Vote</button>
      `;

      choisesDiv.appendChild(div);
    }

    var choises = document.getElementsByClassName("submit-vote");
    for (let i = 0; i < choises.length; i++) {
      choises[i].addEventListener('click', () => {
        sumbitVote(i, choises[i]);
      })
    }
  }

  const sumbitVote = async (_index, _btn) => {
    _btn.innerHTML = "Loading...";

    var errorMsg = document.getElementById('error');
    var sucMsg = document.getElementById('success');

    const setMsg = (_type, _msg) => {
      // Remove any recent error
      errorMsg.classList.remove('py-2');
      errorMsg.innerHTML = "";
      sucMsg.classList.remove('py-2');
      sucMsg.innerHTML = "";

      // Add new error
      _type.classList.add('py-2');
      _type.innerHTML = _msg;
    }

    if (Account === undefined) {
      setMsg(errorMsg, "Connect to a wallet! Please.");
      _btn.innerHTML = "Vote";
    } else {
      const contract = await connectToContract();

      try {
        const vote = await contract.methods.Vote(_index).send({ from: Account });
        const status = vote.status;
        console.log(vote);
        if (status === true) {
          setMsg(sucMsg, "Vote is submit succesfully");
          getProposals();
        } else {
          setMsg(errorMsg, "You are already voted or semthing happen");
          _btn.innerHTML = "Vote";
        }
      } catch (err) {
        setMsg(errorMsg, "You are already voted or semthing happen");
        _btn.innerHTML = "Vote";
      }
    }
    
  }

  return (
    <div className="bg-[url('./img/bg.png')] bg-cover h-screen">
      <div className='container'>

        <Navbar />

        <div className='flex justify-center'>
          {Account ?
            Account.slice(0, 6) + `...` + Account.slice(-5) :
            <button onClick={() => { connectToMetamask() }} className='py-1 rounded-md bg-gradient-to-r from-pink-500 to-violet-500 text-white px-4'>Connect to wallet</button>
          }
        </div>

        <div className='mx-2 my-3'>
          <div className='flex justify-center mx-1 shadow-mine text-sm text-red-500 font-semibold rounded-xl bg-white/40 backdrop-blur-sm' id='error'></div>
          <div className='flex justify-center mx-1 shadow-mine text-sm text-green-500 font-semibold rounded-xl bg-white/40 backdrop-blur-sm' id='success'></div>
        </div>

        <div className='m-2 lg:w-4/6 lg:m-auto' id='choises'>
          { /* <div className='flex items-center flex-col shadow-mine p-2 my-4 rounded-xl bg-white/40 backdrop-blur-sm'>
            <h3 className='font-semibold my-1.5 text-xl text-slate-800'>Choise One</h3>
            <span className='text-sm'>Vote: 0</span>
            <button className='w-4/6 py-1 my-2.5 rounded-md bg-gradient-to-r from-pink-500 to-violet-500 text-white px-4'>Vote</button>
          </div> */ }
        </div>
      </div>
    </div>
  );
}

export default App;
