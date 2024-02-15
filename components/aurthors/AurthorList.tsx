"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { type Aurthor, CompleteAurthor } from "@/lib/db/schema/aurthors";
import Modal from "@/components/shared/Modal";

import { useOptimisticAurthors } from "@/app/(app)/aurthors/useOptimisticAurthors";
import { Button } from "@/components/ui/button";
import AurthorForm from "./AurthorForm";
import { PlusIcon } from "lucide-react";

type TOpenModal = (aurthor?: Aurthor) => void;

export default function AurthorList({
  aurthors,
   
}: {
  aurthors: CompleteAurthor[];
   
}) {
  const { optimisticAurthors, addOptimisticAurthor } = useOptimisticAurthors(
    aurthors,
     
  );
  const [open, setOpen] = useState(false);
  const [activeAurthor, setActiveAurthor] = useState<Aurthor | null>(null);
  const openModal = (aurthor?: Aurthor) => {
    setOpen(true);
    aurthor ? setActiveAurthor(aurthor) : setActiveAurthor(null);
  };
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={activeAurthor ? "Edit Aurthor" : "Create Aurthor"}
      >
        <AurthorForm
          aurthor={activeAurthor}
          addOptimistic={addOptimisticAurthor}
          openModal={openModal}
          closeModal={closeModal}
          
        />
      </Modal>
      <div className="absolute right-0 top-0 ">
        <Button onClick={() => openModal()} variant={"outline"}>
          +
        </Button>
      </div>
      {optimisticAurthors.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul>
          {optimisticAurthors.map((aurthor) => (
            <Aurthor
              aurthor={aurthor}
              key={aurthor.id}
              openModal={openModal}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

const Aurthor = ({
  aurthor,
  openModal,
}: {
  aurthor: CompleteAurthor;
  openModal: TOpenModal;
}) => {
  const optimistic = aurthor.id === "optimistic";
  const deleting = aurthor.id === "delete";
  const mutating = optimistic || deleting;
  const pathname = usePathname();
  const basePath = pathname.includes("aurthors")
    ? pathname
    : pathname + "/aurthors/";


  return (
    <li
      className={cn(
        "flex justify-between my-2 border border-collapse",
        mutating ? "opacity-30 animate-pulse" : "",
        deleting ? "text-destructive" : "",
      )}
    >
      <div className="w-full p-2">
        <div>{aurthor.name}</div>
      </div>
      <Button variant={"link"} asChild>
        <Link href={ basePath + "/" + aurthor.id }>
          Edit
        </Link>
      </Button>
    </li>
  );
};

const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No aurthors
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new aurthor.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Aurthors </Button>
      </div>
    </div>
  );
};
