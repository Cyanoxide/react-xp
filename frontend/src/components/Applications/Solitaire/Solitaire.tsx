import { useEffect, useState } from "react";
import WindowMenu from "../../WindowMenu/WindowMenu";
import Card from "./Card/Card";
import styles from "./Solitaire.module.scss";

type Suit = "hearts" | "diamonds" | "clubs" | "spades";
type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export interface CardType {
    id: string;
    suit: Suit;
    rank: Rank;
    isFaceUp: boolean;
}

export interface BoardState {
  deck: CardType[];
  waste: CardType[];
  foundations: CardType[][];
  board: CardType[][];
  win: boolean;
}

const shuffle = (array: CardType[]) => {
    const shuffled = [...array];
  
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
    
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
  
    return shuffled;
};

const suits = ["hearts", "diamonds", "clubs", "spades"] as const;
const deck: CardType[] = suits.flatMap((suit) =>
    Array.from({ length: 13 }, (_, i) => ({
        id: `${suit}-${i + 1}`,
        suit,
        rank: (i + 1) as Rank,
        isFaceUp: false,
    }))
);

const shuffledDeck = shuffle(deck);

const initialBoard: CardType[][] = Array.from({ length: 7 }, (_, i) => {
    const start = (i * (i + 1)) / 2;
    const end = start + (i + 1);
    
    return shuffledDeck.slice(start, end).map((card, index) => ({
        ...card,
        isFaceUp: index === i
    }));
});

console.log(initialBoard);

const Solitaire = () => {
    const [boardState, setBoardState] = useState<BoardState>({} as BoardState);

    useEffect(() => {
        const initalBoardState = {
            deck: shuffledDeck.slice(28),
            waste: [],
            foundations: [
                [],
                [],
                [],
                [],
            ],
            board: initialBoard,
            win: false
        };
        setBoardState(initalBoardState);
    }, []);

    if (!boardState.board) return;

    const handleDeckOnClick = () => {
        setBoardState((prev: BoardState) => {
            if (prev.deck.length) {
                return {
                    ...prev,
                    deck: prev.deck.slice(0, -1),
                    waste: [...prev.waste, prev.deck[prev.deck.length - 1]]
                };
            } 
    
            return {
                ...prev,
                deck: prev.waste.slice().reverse(),
                waste: []
            };
        });
    };

    return (
        <>
            <WindowMenu menuItems={["Game", "Help"]}/>
            <div className={`${styles.solitaire} w-full h-full p-3`}>
                <main className="flex flex-col">
                    <div className="flex justify-between">
                        <div className="flex">
                            <div className={`${styles.deck} flex`} onClick={handleDeckOnClick}>
                                {boardState.deck.slice(0, 3).map((card) => <Card key={card.id} {...card}/>)}
                            </div>
                            <div className={`${styles.waste} flex`}>
                                {boardState.waste.slice(-3).map((card) => <Card key={card.id} rank={card.rank} suit={card.suit} isFaceUp={true} setBoardState={setBoardState}/>)}
                            </div>
                        </div>
                        <div className={`${styles.foundations} flex`}>
                            {boardState.foundations.map((item, index) => (
                                <div key={index} data-foundation={index}>
                                    {item.map((card) => <Card key={card.id} setBoardState={setBoardState} {...card}/>)}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex">
                        {boardState.board.map((item, index) => { 
                            return (
                                <div className={styles.column} data-column={index}>
                                    {item.map((card) => <Card key={card.id} setBoardState={setBoardState} {...card}/>)}
                                </div>
                            );
                        })}
                    </div>
                </main>
            </div>
        </>
    );
};

export default Solitaire;
