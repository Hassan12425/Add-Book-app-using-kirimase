import { type Aurthor } from "@/lib/db/schema/aurthors";
import { type Book, type CompleteBook } from "@/lib/db/schema/books";
import { OptimisticAction } from "@/lib/utils";
import { useOptimistic } from "react";

export type TAddOptimistic = (action: OptimisticAction<Book>) => void;

export const useOptimisticBooks = (
  books: CompleteBook[],
  aurthors: Aurthor[]
) => {
  const [optimisticBooks, addOptimisticBook] = useOptimistic(
    books,
    (
      currentState: CompleteBook[],
      action: OptimisticAction<Book>,
    ): CompleteBook[] => {
      const { data } = action;

      const optimisticAurthor = aurthors.find(
        (aurthor) => aurthor.id === data.aurthorId,
      )!;

      const optimisticBook = {
        ...data,
        aurthor: optimisticAurthor,
        id: "optimistic",
      };

      switch (action.action) {
        case "create":
          return currentState.length === 0
            ? [optimisticBook]
            : [...currentState, optimisticBook];
        case "update":
          return currentState.map((item) =>
            item.id === data.id ? { ...item, ...optimisticBook } : item,
          );
        case "delete":
          return currentState.map((item) =>
            item.id === data.id ? { ...item, id: "delete" } : item,
          );
        default:
          return currentState;
      }
    },
  );

  return { addOptimisticBook, optimisticBooks };
};
