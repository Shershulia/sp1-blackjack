import React from "react";
import { motion } from "framer-motion";
import "./Card.css";

const Card = ({ value, suit, index, isDealer }) => {
  const suitImageUrl = `/images/${suit}.png`;
  const textColor = suit.includes("red") ? "#fe2bcc" : "black";

  // Определяем стартовую позицию X:
  let startX;
  if (index === 0) startX = -50; // Первая карта чуть справа
  else if (index === 1) startX = 0; // Вторая карта по центру
  else startX = 50; // Все остальные карты слева

  return (
    <motion.div
      className="card"
      initial={{
        opacity: 0,
        x: isDealer ? startX : -startX, // Дилерские карты в ту же сторону
        y: isDealer ? 200 : -200, // Дилерские карты снизу, игрока — сверху
        rotate: isDealer ? -10 : 10, // Легкий наклон карт
      }}
      animate={{
        opacity: 1,
        x: 0, // Карты сходятся в центр
        y: 0,
        rotate: 0,
      }}
      transition={{
        delay: index * 0.2, // Задержка появления
        duration: 0.5,
        type: "spring",
        stiffness: 100,
      }}
    >
      <span className="card-value" style={{ color: textColor }}>{value}</span>
      <img src={suitImageUrl} alt={suit} className="card-suit" />
    </motion.div>
  );
};

export default Card;
