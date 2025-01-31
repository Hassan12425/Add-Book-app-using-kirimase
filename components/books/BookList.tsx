"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { type Book, CompleteBook } from "@/lib/db/schema/books";
import Modal from "@/components/shared/Modal";
import { type Aurthor, type AurthorId } from "@/lib/db/schema/aurthors";
import { useOptimisticBooks } from "@/app/(app)/books/useOptimisticBooks";
import { Button } from "@/components/ui/button";
import BookForm from "./BookForm";
import { PlusIcon } from "lucide-react";

type TOpenModal = (book?: Book) => void;

export default function BookList({
  books,
  aurthors,
  aurthorId 
}: {
  books: CompleteBook[];
  aurthors: Aurthor[];
  aurthorId?: AurthorId 
}) {
  const { optimisticBooks, addOptimisticBook } = useOptimisticBooks(
    books,
    aurthors 
  );
  const [open, setOpen] = useState(false);
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const openModal = (book?: Book) => {
    setOpen(true);
    book ? setActiveBook(book) : setActiveBook(null);
  };
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={activeBook ? "Edit Book" : "Create Book"}
      >
        <BookForm
          book={activeBook}
          addOptimistic={addOptimisticBook}
          openModal={openModal}
          closeModal={closeModal}
          aurthors={aurthors}
        aurthorId={aurthorId}
        />
      </Modal>
      <div className="absolute right-0 top-0 ">
        <Button onClick={() => openModal()} variant={"outline"}>
          +
        </Button>
      </div>
      {optimisticBooks.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul>
          {optimisticBooks.map((book) => (
            <Book
              book={book}
              key={book.id}
              openModal={openModal}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

const Book = ({
  book,
  openModal,
}: {
  book: CompleteBook;
  openModal: TOpenModal;
}) => {
  const optimistic = book.id === "optimistic";
  const deleting = book.id === "delete";
  const mutating = optimistic || deleting;
  const pathname = usePathname();
  const basePath = pathname.includes("books")
    ? pathname
    : pathname + "/books/";


  return (
    <li
      className={cn(
        "flex justify-between my-2 border border-collapse",
        mutating ? "opacity-30 animate-pulse" : "",
        deleting ? "text-destructive" : "",
      )}
    >
      <div className="w-full p-2">
        <div>{book.title}</div>
      </div>
      <Button variant={"link"} asChild>
        <Link href={ basePath + "/" + book.id }>
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
        No books
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new book.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Books </Button>
      </div>
    </div>
  );
};
