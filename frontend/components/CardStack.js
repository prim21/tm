"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

let interval;

export const CardStack = ({
    items,
    offset,
    scaleFactor,
}) => {
    const CARD_OFFSET = offset || 10;
    const SCALE_FACTOR = scaleFactor || 0.06;
    const [cards, setCards] = useState(items);

    useEffect(() => {
        startFlipping();

        return () => clearInterval(interval);
    }, []);

    const startFlipping = () => {
        interval = setInterval(() => {
            setCards((prevCards) => {
                const newArray = [...prevCards];
                newArray.push(newArray.shift()); // Move front to back
                return newArray;
            });
        }, 4000);
    };

    return (
        <div className="relative h-60 w-60 md:h-60 md:w-96">
            {cards.map((card, index) => {
                return (
                    <motion.div
                        key={card.id}
                        className="absolute dark:bg-black bg-gray-900 h-60 w-60 md:h-60 md:w-96 rounded-3xl p-4 shadow-xl border border-white/[0.1] shadow-black/[0.1] flex flex-col justify-between"
                        style={{
                            transformOrigin: "top center",
                            display: index > 2 ? "none" : "flex", // Only show top 3
                        }}
                        animate={{
                            top: index * -CARD_OFFSET,
                            scale: 1 - index * SCALE_FACTOR,
                            zIndex: cards.length - index,
                        }}
                        transition={{
                            duration: 0.7, // Slower, smoother transition
                            ease: "easeInOut"
                        }}
                    >
                        <div className="font-normal text-neutral-200">
                            {card.content}
                        </div>
                        <div>
                            <p className="text-white font-medium">
                                {card.name}
                            </p>
                            <p className="text-neutral-400 font-normal">
                                {card.designation}
                            </p>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};
