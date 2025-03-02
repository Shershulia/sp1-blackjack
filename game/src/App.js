import React, { useState, useEffect } from "react";
import "./App.css";
import { Card, CardValuePanel } from "./components";
import GlitchText from 'react-glitch-effect/core/GlitchText';
import Sound from "react-sound";
import { ToastContainer, toast, Bounce } from 'react-toastify';
import init, { verify_groth16, verify_plonk } from "./wasm/sp1_wasm_verifier";


const suits = ["crab_black", "crab_red", "succ_red", "succ_black"];
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const createDeck = () => {
  let deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ value, suit });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
};

const calculateScore = (hand) => {
  let score = 0;
  let aceCount = 0;
  
  hand.forEach(({ value }) => {
    if (value === "A") {
      aceCount += 1;
      score += 11;
    } else if (["J", "Q", "K"].includes(value)) {
      score += 10;
    } else {
      score += parseInt(value);
    }
  });

  while (score > 21 && aceCount > 0) {
    score -= 10;
    aceCount -= 1;
  }
  return score;
};

function App() {
  const [deck, setDeck] = useState([]);
  const [isHit, setIsHit] = useState(false);
  const [isStand, setIsStand] = useState(false);

  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  const [balance, setBalance] = useState(500);
  const [bet, setBet] = useState(50);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const [isSoundDeck, setIsSoundDeck] = useState(false);
  const [isSoundCard, setIsSoundCard] = useState(false);
  const [proofData, setProofData] = useState(null);
  const [proofDataLoading, setProofDataLoading] = useState(false);


  const dealInitialCards = () => {
    if (bet > balance || balance === 0) {
      toast.warn("Not enough funds to place a bet! Top up your balance or restart page", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
        style: { width: "250px", fontSize: "14px", padding: "10px" }
        });
      return;
    }
    const newDeck = createDeck(); // Создание новой колоды при каждой раздаче
    setDeck(newDeck);
    setIsSoundPlaying(true);
    setIsSoundDeck(true);
    setBalance(balance - bet);
    setGameOver(false);
    setIsHit(false);
    setIsStand(false);
    setShowOverlay(false);
    setPlayerHand([newDeck.pop(), newDeck.pop()]);
    setDealerHand([newDeck.pop(), newDeck.pop()]);
    setTimeout(() => {
      setIsSoundDeck(false);
    }, 500);
  };
  

  const hit = () => {
    setIsHit(true);
    setIsSoundCard(true)
    if (!gameOver && deck.length > 0) {
      const delay =  500; // 500 мс
      let newDeck = [...deck];
      let newHand = [...playerHand];
      
      const drawCard = () => {
        if (newDeck.length === 0) return; // Проверяем, есть ли карты в колоде
  
        const nextCard = newDeck.pop();
        if (!nextCard) return; // Еще одна проверка безопасности
        newHand.push(nextCard);
        setPlayerHand([...newHand]);
        setDeck(newDeck);
        if (calculateScore(newHand) > 21) {
          setTimeout(() => {
            setGameOver(true);
            setShowOverlay(true);
          }
          , delay);
        }
        setTimeout(() => {
          setIsSoundCard(false);
        }, 500);
      };
      drawCard();
    }
  };
  useEffect(() => {
    if (gameOver) {
      const playerScore = calculateScore(playerHand);
      const dealerScore = calculateScore(dealerHand);
  
      setBalance(prevBalance => {
        if (playerScore>21){
          return prevBalance; // Проигрыш
        }
        else if (
          (playerScore === 21 && dealerScore !== 21) || 
          (dealerScore > 21) || 
          (playerScore > dealerScore)
        ) {
          return prevBalance + bet * 2; // Выигрыш
        } else if (playerScore === dealerScore) {
          return prevBalance + bet; // Возврат ставки при ничьей
        }
        return prevBalance;
      });
    }
  }, [gameOver]);
  
  const fromHexString = (hexString) =>
    Uint8Array.from(
      hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
    );


  const stand = () => {
    setIsStand(true);
    let newDeck = [...deck];
    let newDealerHand = [...dealerHand];
    let dealerScore = calculateScore(newDealerHand);
    let playerScore = calculateScore(playerHand);
    setIsSoundCard(true)
    // Дилер берет только одну карту, если у него меньше 17 после двух карт
    while (dealerScore<playerScore && dealerScore < 17) { 
        newDealerHand.push(newDeck.pop());
        setDealerHand([...newDealerHand]);
        setDeck(newDeck);
        dealerScore = calculateScore(newDealerHand);
    }
    setTimeout(() => {
      setIsSoundCard(false);
    }, 500);
    setGameOver(true);
    setShowOverlay(true);
};

  
  const generateProof = async () => {
    setProofDataLoading(true)
  if (playerHand.length === 0) {
    console.error("Player hand is empty. Cannot generate proof.");
    return;
  }

    const data = { "player_hand": calculateScore(playerHand) };
    console.log("Data being sent:", data);
  
    try {
      const response = await fetch("http://localhost:3000/generate_proof", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Proof generated successfully:", result);

      // Можно сохранить в состояние или вывести пользователю
      setProofDataLoading(false)
      setProofData(result);
    } catch (error) {
      console.error("Failed to generate proof:", error);
    }
  };

  const verifyProof = async () => {
    if (!proofData) {
      console.error("No proof data available for verification.");
      return;
    }
  
    await init(); // Инициализация WebAssembly модуля
  
    const { proof, public_inputs, vkey_hash } = proofData;
  
    // Преобразуем данные в формат Uint8Array
    const proofBytes = fromHexString(proof);
    const publicInputsBytes = fromHexString(public_inputs);
  
    try {
      const isValid = verify_groth16(proofBytes, publicInputsBytes, vkey_hash);
      console.log("Proof verification result:", isValid);
      
      if (isValid) {
        toast.success("Proof is valid!", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
      } else {
        toast.error("Proof verification failed!", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Error verifying proof!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    }
  };
  

  const buttonText = playerHand.length === 0 ? "Start Game" : "Restart Game";
  const buttonClass = playerHand.length === 0 ? "start-button start" : "start-button restart";

  return (
    <div className="App">
      <div className="glitch-overlay"></div> 
      <Sound
        url="/background.mp3"
        playStatus={isSoundPlaying ? Sound.status.PLAYING : Sound.status.STOPPED}
        autoLoad={true}
        loop={true}
        volume={30}
      />
      <Sound
        url="/deck.mp3"
        playStatus={isSoundDeck ? Sound.status.PLAYING : Sound.status.STOPPED}
        autoLoad={true}
        loop={true}
        volume={50}
      />
      <Sound
        url="/card.mp3"
        playStatus={isSoundCard ? Sound.status.PLAYING : Sound.status.STOPPED}
        autoLoad={true}
        volume={50}
      />
      {showOverlay && (
        <div className="overlay">
          <GlitchText component='h1' disabled={false} className="result-text">
            {playerHand.length === 0 ? "Welcome to Succinct Blackjack!" :
              calculateScore(playerHand) === 21 && calculateScore(dealerHand) !== 21 ? "Player Wins!" :
              calculateScore(playerHand) > 21 ? "Player Busts! Dealer Wins!" :
              calculateScore(dealerHand) > 21 ? "Player Wins!" :
              calculateScore(playerHand) === calculateScore(dealerHand) && calculateScore(playerHand) < 21 ? "It's a Tie!" :
              calculateScore(playerHand) > calculateScore(dealerHand) ? "Player Wins!" :
              "Dealer Wins!"}
          </GlitchText>

          <div className="balance-container">
              
              <button className="balance-button decrease-button" onClick={() => setBet(Math.max(bet - 10, 10))}>-</button>
              <div className="star-container">
                <p className="balance-text">Bet: {bet}</p>
                <img src={"/images/star.png"} className="star" />
              </div>
              <button className="balance-button increase-button" onClick={() => setBet(Math.min(bet + 10, balance))}>+</button>
            </div>
            <button className={buttonClass} onClick={dealInitialCards}>
              {buttonText}
            </button>
            {
          calculateScore(playerHand) > 21 && (
            <div>
              <button className={buttonClass} onClick={generateProof}>Generate proof</button>
              {proofData && (
                <button className={buttonClass} onClick={verifyProof}>{proofDataLoading ? "Verification is loading" : "Verify"}</button>
              )}
            </div>
          )
        }

            <ToastContainer
              position="top-center"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick={false}
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
              transition={Bounce}
              />        
            </div>
      )}
      <div className="balance-wrapper">
        <p className="balance-text"> Balance: {balance}</p>
        <img src={"/images/star.png"} className="star" />
      </div>
      <div className="header-container">
        <GlitchText component='h1' disabled={false} className="header">Succinct Blackjack</GlitchText>
      </div>
          <div className="background">
        {playerHand.length !== 0 && (
            <div className="main">
              <h2 className="score">Dealer: {calculateScore(dealerHand)}</h2>
              <div>
                {dealerHand.map((card, index) => (
                  <Card key={index} value={card.value} suit={card.suit} index={index} isDealer={true} />
                ))}
              </div>
              <img src={"/images/deck.png"} className="deck" />
              <h2 className="score">Player: {calculateScore(playerHand)}</h2>
              <div>
                {playerHand.map((card, index) => (
                  <Card key={index} value={card.value} suit={card.suit} index={index} isDealer={false} />
                ))}
              </div>
              <div className="button-container-upper"> 
                  <div className="button-container">
                    <button className="game-button hit-button" onClick={hit} disabled={gameOver}>
                      <p className="button-text">Hit</p>
                      <img src="/images/hand.svg" className="button-img" />
                    </button>

                    <button className="game-button stand-button" onClick={stand} disabled={gameOver}> 
                      <p className="button-text">Stand</p>
                      <img src="/images/hold.svg" className="button-img" />
                    </button>


                  </div>
                </div>
            </div>
          )}
            <CardValuePanel></CardValuePanel>

        </div>
    </div>
  );
}

export default App;