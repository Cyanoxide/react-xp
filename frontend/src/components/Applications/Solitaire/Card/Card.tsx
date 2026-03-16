import styles from "./Card.module.scss";
import type {BoardState} from "../Solitaire";
import type { Dispatch, SetStateAction } from "react";

type Suit = "hearts" | "diamonds" | "clubs" | "spades";
type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

interface Card {
    suit?: Suit;
    rank?: Rank;
    isFaceUp?: boolean;
    setBoardState?: Dispatch<SetStateAction<BoardState>>;
}

const Card = ({ suit, rank, isFaceUp = false,  setBoardState = () => {} }: Card) => {

    const onClickHandler = (event: React.MouseEvent<HTMLElement>) => {
        const clickTarget = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement;
        
        if (clickTarget.dataset.faceDown && clickTarget.closest("[data-column]")) {
            const columnNumber = Number((clickTarget.closest("[data-column]") as HTMLElement)?.dataset.column);

            if (Number.isNaN(columnNumber)) return;

            setBoardState?.((prev) => {
                if (!prev?.board) return prev;
                const newBoard = structuredClone(prev.board);

                const column = newBoard[columnNumber];

                column[column.length - 1].isFaceUp = true;

                return { ...prev, board: newBoard };
            });
        }
    };

    const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
        const card = event.currentTarget;
        const rank = Number(card.dataset.rank);
        const suit = card.dataset.suit as Suit;

        if (!rank || !suit || !isFaceUp || card.nextElementSibling) return;
        
        const rect = card.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;

        Object.assign(card.style, {
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            position: "fixed",
            pointerEvents: "none",
            zIndex: 1001,
            left: `${event.clientX - offsetX}px`,
            top: `${event.clientY - offsetY}px`
        });

        const handlePointerMove = (moveEvent: PointerEvent) => {
            card.style.left = `${moveEvent.clientX - offsetX}px`;
            card.style.top = `${moveEvent.clientY - offsetY}px`;
            document.body.style.userSelect = "none";
        };

        const handlePointerUp = (upEvent: PointerEvent) => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
        
            const dropTarget = document.elementFromPoint(upEvent.clientX, upEvent.clientY) as HTMLElement;
            const targetRank = Number(dropTarget?.dataset?.rank);
            const targetSuit = dropTarget?.dataset?.suit;

            const isFoundationPlacement = (
                (dropTarget.dataset.foundation && dropTarget.childElementCount === 0 && rank === 1) ||
                (dropTarget.closest("[data-foundation]") && dropTarget.dataset.suit === suit && Number(dropTarget.dataset.rank) === rank - 1)
            );

            const isKingPlacement = (dropTarget.dataset.column && dropTarget.childElementCount === 0 && rank === 13);

            if (isFoundationPlacement) {
                setBoardState?.((prev) => {
                    if (!prev?.board) return prev;
                    const newBoard = structuredClone(prev.board);

                    newBoard.forEach((col, i) => {
                        newBoard[i] = col.filter(card => !(card.rank === rank && card.suit === suit));
                    });
                    const newWaste = prev.waste.filter(card => !(card.rank === rank && card.suit === suit));
                    
                    const newFoundations = prev.foundations.map(foundation => 
                        foundation.filter(card => !(card.rank === rank && card.suit === suit))
                    );

                    const targetFoundationNum = Number(dropTarget.dataset.foundation || (dropTarget.closest("[data-foundation]") as HTMLElement)?.dataset.foundation);

                    if (Number.isNaN(targetFoundationNum)) return prev;

                    newFoundations[targetFoundationNum].push({
                        id: `${suit}-${rank}`,
                        suit: suit,
                        rank: rank as Rank,
                        isFaceUp: true,
                    });

                    return { ...prev, board: newBoard, waste: newWaste, foundations: newFoundations };
                });

                document.body.style.userSelect = "";
            }

            if (isKingPlacement) {
                setBoardState?.((prev) => {
                    if (!prev?.board) return prev;
                    const newBoard = structuredClone(prev.board);

                    newBoard.forEach((col, i) => {
                        newBoard[i] = col.filter(card => !(card.rank === rank && card.suit === suit));
                    });
                    const newWaste = prev.waste.filter(card => !(card.rank === rank && card.suit === suit));

                    const newFoundations = prev.foundations.map(foundation => 
                        foundation.filter(card => !(card.rank === rank && card.suit === suit))
                    );

                    const targetColNum = Number(dropTarget.dataset.column);

                    if (Number.isNaN(targetColNum)) return prev;

                    newBoard[targetColNum].push({
                        id: `${suit}-${rank}`,
                        suit: suit,
                        rank: rank as Rank,
                        isFaceUp: true,
                    });

                    return { ...prev, board: newBoard, waste: newWaste, foundations: newFoundations };
                });

                document.body.style.userSelect = "";
            }

            if (targetRank && targetSuit) {
                const getColor = (suit: string) => (suit === "hearts" || suit === "diamonds" ? "red" : "black");
                const isOppositeColor = getColor(suit) !== getColor(targetSuit);
                const isSequential = (rank + 1) === targetRank;

                if (isOppositeColor && isSequential) {
                    setBoardState?.((prev) => {
                        if (!prev?.board) return prev;
                        const newBoard = structuredClone(prev.board);

                        newBoard.forEach((col, i) => {
                            newBoard[i] = col.filter(card => !(card.rank === rank && card.suit === suit));
                        });

                        const newWaste = prev.waste.filter(card => !(card.rank === rank && card.suit === suit));

                        const newFoundations = prev.foundations.map(foundation => 
                            foundation.filter(card => !(card.rank === rank && card.suit === suit))
                        );

                        const targetCol = newBoard.find((column) => {
                            const lastCard = column[column.length - 1];
                            return lastCard?.rank === targetRank && lastCard?.suit === targetSuit;
                        });

                        if (!targetCol) return prev;

                        targetCol.push({
                            id: `${suit}-${rank}`,
                            suit: suit,
                            rank: rank as Rank,
                            isFaceUp: true,
                        });

                        return { ...prev, board: newBoard, waste: newWaste, foundations: newFoundations };
                    });
                }
            }
            
            card.style.cssText = "";
        };

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);
    };

    let card = (<div data-suit={suit} data-rank={rank} onPointerDown={(e) => onPointerDown(e)}></div>);

    if (!isFaceUp) card = (<div className={styles.faceDown} data-face-down onClick={onClickHandler}></div>);
    if (!suit && !rank && !isFaceUp) card = (<div data-empty></div>);

    return (
        <div className={styles.card}>{card}</div>
    );
};

export default Card;
