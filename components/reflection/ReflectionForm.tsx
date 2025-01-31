import { z } from "zod";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useValidatedForm } from "@/lib/hooks/useValidatedForm";

import { type Action, cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBackPath } from "@/components/shared/BackButton";


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { type TAddOptimistic } from "@/app/(app)/reflection/useOptimisticReflection";
import {
  createReflectionAction,
  deleteReflectionAction,
  updateReflectionAction,
} from "@/lib/actions/reflection";
import { type Book, type BookId } from "@/lib/db/schema/books";
import { Reflection, insertReflectionParams } from "@/lib/db/schema/reflection";

const ReflectionForm = ({
  books,
  bookId,
  reflection,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  reflection?: Reflection | null;
  books: Book[];
  bookId?: BookId
  openModal?: (reflection?: Reflection) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<Reflection>(insertReflectionParams);
  const { toast } = useToast();
  const editing = !!reflection?.id;
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();
  const backpath = useBackPath("reflections");


  const onSuccess = (
    action: Action,
    data?: { error: string; values: Reflection },
  ) => {
    const failed = Boolean(data?.error);
    if (failed) {
      openModal && openModal(data?.values);
    } else {
      router.refresh();
      postSuccess && postSuccess();
    }

    toast({
      title: failed ? `Failed to ${action}` : "Success",
      description: failed ? data?.error ?? "Error" : `Reflection ${action}d!`,
      variant: failed ? "destructive" : "default",
    });
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const reflectionParsed = await insertReflectionParams.safeParseAsync({ bookId, ...payload });
    if (!reflectionParsed.success) {
      setErrors(reflectionParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = reflectionParsed.data;
    const pendingReflection: Reflection = {
      updatedAt: reflection?.updatedAt ?? new Date(),
      createdAt: reflection?.createdAt ?? new Date(),
      id: reflection?.id ?? "",
      userId: reflection?.userId ?? "",
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic && addOptimistic({
          data: pendingReflection,
          action: editing ? "update" : "create",
        });

        const error = editing
          ? await updateReflectionAction({ ...values, id: reflection.id })
          : await createReflectionAction(values);

        const errorFormatted = {
          error: error ?? "Error",
          values: pendingReflection 
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
            errors?.content ? "text-destructive" : "",
          )}
        >
          Content
        </Label>
        <Input
          type="text"
          name="content"
          className={cn(errors?.content ? "ring ring-destructive" : "")}
          defaultValue={reflection?.content ?? ""}
        />
        {errors?.content ? (
          <p className="text-xs text-destructive mt-2">{errors.content[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>

      {bookId ? null : <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.bookId ? "text-destructive" : "",
          )}
        >
          Book
        </Label>
        <Select defaultValue={reflection?.bookId} name="bookId">
          <SelectTrigger
            className={cn(errors?.bookId ? "ring ring-destructive" : "")}
          >
            <SelectValue placeholder="Select a book" />
          </SelectTrigger>
          <SelectContent>
          {books?.map((book) => (
            <SelectItem key={book.id} value={book.id.toString()}>
              {book.id}{/* TODO: Replace with a field from the book model */}
            </SelectItem>
           ))}
          </SelectContent>
        </Select>
        {errors?.bookId ? (
          <p className="text-xs text-destructive mt-2">{errors.bookId[0]}</p>
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
              addOptimistic && addOptimistic({ action: "delete", data: reflection });
              const error = await deleteReflectionAction(reflection.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? "Error",
                values: reflection,
              };

              onSuccess("delete", error ? errorFormatted : undefined);
            });
            router.push(backpath);
          }}
        >
          Delet{isDeleting ? "ing..." : "e"}
        </Button>
      ) : null}
    </form>
  );
};

export default ReflectionForm;

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