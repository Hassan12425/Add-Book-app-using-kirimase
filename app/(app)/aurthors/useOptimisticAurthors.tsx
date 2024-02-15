
import { type Aurthor, type CompleteAurthor } from "@/lib/db/schema/aurthors";
import { OptimisticAction } from "@/lib/utils";
import { useOptimistic } from "react";

export type TAddOptimistic = (action: OptimisticAction<Aurthor>) => void;

export const useOptimisticAurthors = (
  aurthors: CompleteAurthor[],
  
) => {
  const [optimisticAurthors, addOptimisticAurthor] = useOptimistic(
    aurthors,
    (
      currentState: CompleteAurthor[],
      action: OptimisticAction<Aurthor>,
    ): CompleteAurthor[] => {
      const { data } = action;

      

      const optimisticAurthor = {
        ...data,
        
        id: "optimistic",
      };

      switch (action.action) {
        case "create":
          return currentState.length === 0
            ? [optimisticAurthor]
            : [...currentState, optimisticAurthor];
        case "update":
          return currentState.map((item) =>
            item.id === data.id ? { ...item, ...optimisticAurthor } : item,
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

  return { addOptimisticAurthor, optimisticAurthors };
};
