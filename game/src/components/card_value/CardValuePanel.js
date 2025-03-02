import React from "react";
import "./CardValuePanel.css";
import Card from "../card/Card";
import GlitchText from 'react-glitch-effect/core/GlitchText';

const CardValuePanel = () => {
  const cardValues = [
    { value: "A", points: "1 or 11", suit: "crab_black" },
    { value: "2", points: "2", suit: "crab_red" },
    { value: "3", points: "3", suit: "succ_red" },
    { value: "4", points: "4", suit: "succ_black" },
    { value: "5", points: "5", suit: "crab_black" },
    { value: "6", points: "6", suit: "crab_red" },
    { value: "7", points: "7", suit: "succ_red" },
    { value: "8", points: "8", suit: "succ_black" },
    { value: "9", points: "9", suit: "crab_black" },
    { value: "10", points: "10", suit: "crab_red" },
    { value: "J", points: "10", suit: "succ_red" },
    { value: "Q", points: "10", suit: "succ_black" },
    { value: "K", points: "10", suit: "crab_black" }
  ];

  return (
    <div className="card-value-panel">
      <GlitchText component='h1' disabled={false} className="card-text-value">
        Card Values
      </GlitchText>
      <div className="card-container">
        {cardValues.map((card, index) => (
          index % 2 === 0 ? (
            <div key={index} className="card-row">
              <div className="card-with-points">
                <Card value={card.value} suit={card.suit} index={index} isDealer={false} />
                <span className="card-points">{card.points} points</span>
              </div>
              {cardValues[index + 1] && (
                <div className="card-with-points">
                  <Card value={cardValues[index + 1].value} suit={cardValues[index + 1].suit} index={index + 1} isDealer={false} />
                  <span className="card-points">{cardValues[index + 1].points} points</span>
                </div>
              )}
            </div>
          ) : null
        ))}
      </div>
    </div>
  );
};

export default CardValuePanel;
