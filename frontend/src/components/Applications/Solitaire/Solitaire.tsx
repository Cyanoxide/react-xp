import { useEffect, useState } from "react";
import WindowMenu from "../../WindowMenu/WindowMenu";
import Card from "./Card/Card";
import WinAnimation from "./WinAnimation/WinAnimation";
import styles from "./Solitaire.module.scss";

export type Suit = "hearts" | "diamonds" | "clubs" | "spades";
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
  wasteCount: number;
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

const createInitialBoardState = (): BoardState => {
    const shuffledDeck = shuffle(deck);

    const board: CardType[][] = Array.from({ length: 7 }, (_, i) => {
        const start = (i * (i + 1)) / 2;
        const end = start + (i + 1);

        return shuffledDeck.slice(start, end).map((card, index) => ({
            ...card,
            isFaceUp: index === i
        }));
    });

    return {
        deck: shuffledDeck.slice(28),
        waste: [],
        wasteCount: 3,
        foundations: [
            [],
            [],
            [],
            [],
        ],
        board,
        win: false
    };
};

const Solitaire = () => {
    const [boardState, setBoardState] = useState<BoardState>({} as BoardState);

    useEffect(() => {
        setBoardState(createInitialBoardState());
    }, []);

    useEffect(() => {
        if (!boardState.foundations || boardState.win) return;
        if (boardState.foundations.every((foundation) => foundation.length === 13)) {
            setBoardState((prev) => ({ ...prev, win: true }));
        }
    }, [boardState.foundations, boardState.win]);

    if (!boardState.board) return;

    const handleDeckOnClick = () => {
        setBoardState((prev: BoardState) => {
            if (prev.deck.length) {
                return {
                    ...prev,
                    deck: prev.deck.slice(0, -1),
                    waste: [...prev.waste, prev.deck[prev.deck.length - 1]],
                    wasteCount: 3,
                };
            }

            return {
                ...prev,
                deck: prev.waste.slice().reverse(),
                waste: []
            };
        });
    };

    const handleCardLaunch = (pileIndex: number) => {
        setBoardState((prev) => ({
            ...prev,
            foundations: prev.foundations.map((foundation, index) =>
                (index === pileIndex) ? foundation.slice(0, -1) : foundation
            ),
        }));
    };

    const handleNewGame = () => {
        setBoardState(createInitialBoardState());
    };

    // DEBUG: puts the game straight into a won state to preview the win animation
    const debugWin = () => {
        const winSuits = ["spades", "hearts", "clubs", "diamonds"] as const;
        setBoardState({
            deck: [],
            waste: [],
            wasteCount: 3,
            foundations: winSuits.map((suit) =>
                Array.from({ length: 13 }, (_, i) => ({
                    id: `${suit}-${i + 1}`,
                    suit,
                    rank: (i + 1) as Rank,
                    isFaceUp: true,
                }))
            ),
            board: Array.from({ length: 7 }, () => []),
            win: true,
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
                                {boardState.waste.slice(-Math.abs(boardState.wasteCount)).map((card) => <Card key={card.id} rank={card.rank} suit={card.suit} isFaceUp={true} setBoardState={setBoardState}/>)}
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
                                <div key={index} className={styles.column} data-column={index}>
                                    {item.map((card) => <Card key={card.id} setBoardState={setBoardState} {...card}/>)}
                                </div>
                            );
                        })}
                    </div>
                    <button onClick={debugWin}>DEBUG: Win</button>
                </main>
            </div>
            {boardState.win && <WinAnimation foundations={boardState.foundations} onCardLaunch={handleCardLaunch} onComplete={handleNewGame} />}
        </>
    );
};

export default Solitaire;
