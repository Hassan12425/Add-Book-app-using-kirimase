"use client";

import { useOptimistic, useState } from "react";
import { TAddOptimistic } from "@/app/(app)/aurthors/useOptimisticAurthors";
import { type Aurthor } from "@/lib/db/schema/aurthors";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import Modal from "@/components/shared/Modal";
import AurthorForm from "@/components/aurthors/AurthorForm";


export default function OptimisticAurthor({ 
  aurthor,
   
}: { 
  aurthor: Aurthor; 
  
  
}) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: Aurthor) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  const [optimisticAurthor, setOptimisticAurthor] = useOptimistic(aurthor);
  const updateAurthor: TAddOptimistic = (input) =>
    setOptimisticAurthor({ ...input.data });

  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <AurthorForm
          aurthor={optimisticAurthor}
          
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updateAurthor}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <h1 className="font-semibold text-2xl">{optimisticAurthor.name}</h1>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      <pre
        className={cn(
          "bg-secondary p-4 rounded-lg break-all text-wrap",
          optimisticAurthor.id === "optimistic" ? "animate-pulse" : "",
        )}
      >
        {JSON.stringify(optimisticAurthor, null, 2)}
      </pre>
    </div>
  );
}
