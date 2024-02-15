import { z } from "zod";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useValidatedForm } from "@/lib/hooks/useValidatedForm";

import { type Action, cn } from "@/lib/utils";
import { type TAddOptimistic } from "@/app/(app)/aurthors/useOptimisticAurthors";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBackPath } from "@/components/shared/BackButton";



import { type Aurthor, insertAurthorParams } from "@/lib/db/schema/aurthors";
import {
  createAurthorAction,
  deleteAurthorAction,
  updateAurthorAction,
} from "@/lib/actions/aurthors";


const AurthorForm = ({
  
  aurthor,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  aurthor?: Aurthor | null;
  
  openModal?: (aurthor?: Aurthor) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<Aurthor>(insertAurthorParams);
  const editing = !!aurthor?.id;
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();
  const backpath = useBackPath("aurthors");


  const onSuccess = (
    action: Action,
    data?: { error: string; values: Aurthor },
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
      toast.success(`Aurthor ${action}d!`);
      if (action === "delete") router.push(backpath);
    }
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const aurthorParsed = await insertAurthorParams.safeParseAsync({  ...payload });
    if (!aurthorParsed.success) {
      setErrors(aurthorParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = aurthorParsed.data;
    const pendingAurthor: Aurthor = {
      updatedAt: aurthor?.updatedAt ?? new Date(),
      createdAt: aurthor?.createdAt ?? new Date(),
      id: aurthor?.id ?? "",
      userId: aurthor?.userId ?? "",
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic && addOptimistic({
          data: pendingAurthor,
          action: editing ? "update" : "create",
        });

        const error = editing
          ? await updateAurthorAction({ ...values, id: aurthor.id })
          : await createAurthorAction(values);

        const errorFormatted = {
          error: error ?? "Error",
          values: pendingAurthor 
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
            errors?.name ? "text-destructive" : "",
          )}
        >
          Name
        </Label>
        <Input
          type="text"
          name="name"
          className={cn(errors?.name ? "ring ring-destructive" : "")}
          defaultValue={aurthor?.name ?? ""}
        />
        {errors?.name ? (
          <p className="text-xs text-destructive mt-2">{errors.name[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
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
              addOptimistic && addOptimistic({ action: "delete", data: aurthor });
              const error = await deleteAurthorAction(aurthor.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? "Error",
                values: aurthor,
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

export default AurthorForm;

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
