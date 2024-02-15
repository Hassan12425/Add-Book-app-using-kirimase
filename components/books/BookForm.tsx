import { z } from "zod";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useValidatedForm } from "@/lib/hooks/useValidatedForm";

import { type Action, cn } from "@/lib/utils";
import { type TAddOptimistic } from "@/app/(app)/books/useOptimisticBooks";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBackPath } from "@/components/shared/BackButton";


import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { type Book, insertBookParams } from "@/lib/db/schema/books";
import {
  createBookAction,
  deleteBookAction,
  updateBookAction,
} from "@/lib/actions/books";
import { type Aurthor, type AurthorId } from "@/lib/db/schema/aurthors";

const BookForm = ({
  aurthors,
  aurthorId,
  book,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  book?: Book | null;
  aurthors: Aurthor[];
  aurthorId?: AurthorId
  openModal?: (book?: Book) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<Book>(insertBookParams);
  const editing = !!book?.id;
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();
  const backpath = useBackPath("books");


  const onSuccess = (
    action: Action,
    data?: { error: string; values: Book },
  ) => {
    const failed = Boolean(data?.error);
    if (failed) {
      openModal && openModal(data?.values);
      toast.error(`Failed to ${action}`, {
        description: data?.error ?? "Error",
      });
    } else {
      router.refresh();
      postSuccess && postSuccess();
      toast.success(`Book ${action}d!`);
      if (action === "delete") router.push(backpath);
    }
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const bookParsed = await insertBookParams.safeParseAsync({ aurthorId, ...payload });
    if (!bookParsed.success) {
      setErrors(bookParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = bookParsed.data;
    const pendingBook: Book = {
      updatedAt: book?.updatedAt ?? new Date(),
      createdAt: book?.createdAt ?? new Date(),
      id: book?.id ?? "",
      userId: book?.userId ?? "",
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic && addOptimistic({
          data: pendingBook,
          action: editing ? "update" : "create",
        });

        const error = editing
          ? await updateBookAction({ ...values, id: book.id })
          : await createBookAction(values);

        const errorFormatted = {
          error: error ?? "Error",
          values: pendingBook 
        };
        onSuccess(
          editing ? "update" : "create",
          error ? errorFormatted : undefined,
        );
      });
    } catch (e) {
      if (e instanceof z.ZodError) {
        setErrors(e.flatten().fieldErrors);
      }
    }
  };

  return (
    <form action={handleSubmit} onChange={handleChange} className={"space-y-8"}>
      {/* Schema fields start */}
              <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.title ? "text-destructive" : "",
          )}
        >
          Title
        </Label>
        <Input
          type="text"
          name="title"
          className={cn(errors?.title ? "ring ring-destructive" : "")}
          defaultValue={book?.title ?? ""}
        />
        {errors?.title ? (
          <p className="text-xs text-destructive mt-2">{errors.title[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
<div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.completed ? "text-destructive" : "",
          )}
        >
          Completed
        </Label>
        <br />
        <Checkbox defaultChecked={book?.completed} name={'completed'} className={cn(errors?.completed ? "ring ring-destructive" : "")} />
        {errors?.completed ? (
          <p className="text-xs text-destructive mt-2">{errors.completed[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>

      {aurthorId ? null : <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.aurthorId ? "text-destructive" : "",
          )}
        >
          Aurthor
        </Label>
        <Select defaultValue={book?.aurthorId} name="aurthorId">
          <SelectTrigger
            className={cn(errors?.aurthorId ? "ring ring-destructive" : "")}
          >
            <SelectValue placeholder="Select a aurthor" />
          </SelectTrigger>
          <SelectContent>
          {aurthors?.map((aurthor) => (
            <SelectItem key={aurthor.id} value={aurthor.id.toString()}>
              {aurthor.name}
            </SelectItem>
           ))}
          </SelectContent>
        </Select>
        {errors?.aurthorId ? (
          <p className="text-xs text-destructive mt-2">{errors.aurthorId[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div> }
      {/* Schema fields end */}

      {/* Save Button */}
      <SaveButton errors={hasErrors} editing={editing} />

      {/* Delete Button */}
      {editing ? (
        <Button
          type="button"
          disabled={isDeleting || pending || hasErrors}
          variant={"destructive"}
          onClick={() => {
            setIsDeleting(true);
            closeModal && closeModal();
            startMutation(async () => {
              addOptimistic && addOptimistic({ action: "delete", data: book });
              const error = await deleteBookAction(book.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? "Error",
                values: book,
              };

              onSuccess("delete", error ? errorFormatted : undefined);
            });
          }}
        >
          Delet{isDeleting ? "ing..." : "e"}
        </Button>
      ) : null}
    </form>
  );
};

export default BookForm;

const SaveButton = ({
  editing,
  errors,
}: {
  editing: Boolean;
  errors: boolean;
}) => {
  const { pending } = useFormStatus();
  const isCreating = pending && editing === false;
  const isUpdating = pending && editing === true;
  return (
    <Button
      type="submit"
      className="mr-2"
      disabled={isCreating || isUpdating || errors}
      aria-disabled={isCreating || isUpdating || errors}
    >
      {editing
        ? `Sav${isUpdating ? "ing..." : "e"}`
        : `Creat${isCreating ? "ing..." : "e"}`}
    </Button>
  );
};
