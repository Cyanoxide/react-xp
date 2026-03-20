import { useRef } from "react";
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
    const lastClickTimeRef = useRef<number>(0);
    
    const onDoubleClickHandler = (event: React.MouseEvent<HTMLElement>) => {
        const card = event.currentTarget;
        const rank = Number(card.dataset.rank);
        const suit = card.dataset.suit;

        if (!card || card.parentElement!.nextElementSibling) return;

        
        setBoardState(prev => {
            const newBoard = structuredClone(prev.board);
            const newFoundations = structuredClone(prev.foundations);
            const inFoundations = newFoundations.find(foundation => (foundation[foundation.length - 1] && foundation[foundation.length - 1].rank === rank && foundation[foundation.length - 1].suit === suit));
            if (inFoundations) return prev;

            const validFoundationPlacement = newFoundations.find(foundation => (foundation[foundation.length - 1] && foundation[foundation.length - 1].rank === rank - 1 && foundation[foundation.length - 1].suit === suit) || (!foundation[foundation.length - 1] && rank === 1));

            if (validFoundationPlacement) {
                validFoundationPlacement.push({
                    id: `${suit}-${rank}`,
                    suit: suit as Suit,
                    rank: rank as Rank,
                    isFaceUp: true,
                });

                newBoard.forEach((col, i) => {
                    newBoard[i] = col.filter(card => !(card.rank === rank && card.suit === suit));
                });
                const newWaste = prev.waste.filter(card => !(card.rank === rank && card.suit === suit));


                return {...prev, foundations: newFoundations, board: newBoard, waste: newWaste};
            }

            return prev;
        });
    };

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
        const cardWrapper = event.currentTarget.parentElement;
        if (!card || !cardWrapper) return;

        const rank = Number(card.dataset.rank);
        const suit = card.dataset.suit as Suit;

        if (!rank || !suit || !isFaceUp) return;

        const currentTime = Date.now();
        const timeSinceLastClick = currentTime - lastClickTimeRef.current;

        if (timeSinceLastClick < 300) {
            onDoubleClickHandler(event);
            lastClickTimeRef.current = 0;
            return;
        }

        lastClickTimeRef.current = currentTime;
        
        const rect = card.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;

        const stack = Array.from(card.parentElement!.parentElement!.children).slice(
            Array.from(card.parentElement!.parentElement!.children).indexOf(card.parentElement!)
        );

        const parent = cardWrapper.parentElement!;
        const stackToMove = (Array.from(parent.children) as HTMLElement[]).slice(
            Array.from(parent.children).indexOf(cardWrapper)
        );

        const cardOffsetValue = 2;

        stack.forEach((card, index) => {
            const cardOffset =  index * cardOffsetValue;
            Object.assign((card.childNodes[0] as HTMLElement).style, {
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                position: "fixed",
                pointerEvents: "none",
                zIndex: 1001,
                left: `${event.clientX - offsetX}px`,
                top: `calc(${event.clientY - offsetY}px + ${cardOffset}cqw)`,
            });
        });

        const handlePointerMove = (moveEvent: PointerEvent) => {
            stack.forEach((card, index) => {
                const cardOffset =  index * cardOffsetValue;
                (card.childNodes[0] as HTMLElement).style.left = `${moveEvent.clientX - offsetX}px`;
                (card.childNodes[0] as HTMLElement).style.top = `calc(${moveEvent.clientY - offsetY}px + ${cardOffset}cqw)`;
            });
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

            if (isFoundationPlacement  && !card.parentElement!.nextElementSibling) {
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
                setBoardState?.((previousState) => {
                    if (!previousState?.board) return previousState;
        
                    const newBoard = structuredClone(previousState.board);
                    const newFoundations = structuredClone(previousState.foundations);

                    const cardsToMove = stackToMove.map((container) => {
                        const cardElement = container.firstElementChild as HTMLElement;
                        return {
                            id: `${cardElement.dataset.suit}-${cardElement.dataset.rank}`,
                            suit: cardElement.dataset.suit as Suit,
                            rank: Number(cardElement.dataset.rank) as Rank,
                            isFaceUp: true,
                        };
                    });

                    const idsToMove = cardsToMove.map((card) => card.id);

                    newBoard.forEach((column, index) => {
                        newBoard[index] = column.filter((card) => !idsToMove.includes(card.id));
                    });

                    const newWaste = previousState.waste.filter((card) => !idsToMove.includes(card.id));

                    newFoundations.forEach((foundation, index) => {
                        newFoundations[index] = foundation.filter((card) => !idsToMove.includes(card.id));
                    });

                    const targetColumnIndex = Number(dropTarget.dataset.column);

                    if (Number.isNaN(targetColumnIndex)) return previousState;

                    newBoard[targetColumnIndex].push(...cardsToMove);

                    return { 
                        ...previousState, 
                        board: newBoard, 
                        waste: newWaste, 
                        foundations: newFoundations 
                    };
                });

                document.body.style.userSelect = "";
            }

            if ((targetRank && targetSuit) && stackToMove.length > 0) {
                const initialCard = stackToMove[0].childNodes[0] as HTMLElement;
                const initialCardRank = Number(initialCard.dataset.rank);
                const initialCardSuit = initialCard.dataset.suit as Suit;

                const getColor = (suit: string) => (suit === "hearts" || suit === "diamonds" ? "red" : "black");
                const isOppositeColor = getColor(initialCardSuit) !== getColor(targetSuit);
                const isSequential = (initialCardRank + 1) === targetRank;

                if (isOppositeColor && isSequential) {
                    setBoardState?.((prev) => {
                        if (!prev?.board) return prev;
                        const newBoard = structuredClone(prev.board);

                        const cardsToMoveData = stackToMove.map(container => {
                            const card = container.childNodes[0] as HTMLElement;
                            return {
                                id: `${card.dataset.suit}-${card.dataset.rank}`,
                                suit: card.dataset.suit as Suit,
                                rank: Number(card.dataset.rank) as Rank,
                                isFaceUp: true
                            };
                        });

                        const idsToMove = cardsToMoveData.map(c => c.id);

                        newBoard.forEach((col, i) => {
                            newBoard[i] = col.filter(card => !idsToMove.includes(card.id));
                        });

                        const newWaste = prev.waste.filter(card => !idsToMove.includes(card.id));

                        const newFoundations = prev.foundations.map(found => 
                            found.filter(card => !idsToMove.includes(card.id))
                        );

                        const targetCol = newBoard.find((column) => {
                            const lastCard = column[column.length - 1];
                            return lastCard?.rank === targetRank && lastCard?.suit === targetSuit;
                        });

                        if (!targetCol) return prev;

                        targetCol.push(...cardsToMoveData);

                        return { ...prev, board: newBoard, waste: newWaste, foundations: newFoundations };
                    });
                }
            }

            stack.forEach((card) => {
                (card.childNodes[0] as HTMLElement).style.cssText = "";
            });
        };

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);
    };

    let card = (<div data-suit={suit} data-rank={rank} onPointerDown={(e) => onPointerDown(e)} onDoubleClick={(e) => onDoubleClickHandler(e)}></div>);

    if (!isFaceUp) card = (<div className={styles.faceDown} data-face-down onClick={onClickHandler}></div>);
    if (!suit && !rank && !isFaceUp) card = (<div data-empty></div>);

    return (
        <div className={styles.card}>{card}</div>
    );
};

export default Card;
