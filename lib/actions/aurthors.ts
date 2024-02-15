"use server";

import { revalidatePath } from "next/cache";
import {
  createAurthor,
  deleteAurthor,
  updateAurthor,
} from "@/lib/api/aurthors/mutations";
import {
  AurthorId,
  NewAurthorParams,
  UpdateAurthorParams,
  aurthorIdSchema,
  insertAurthorParams,
  updateAurthorParams,
} from "@/lib/db/schema/aurthors";

const handleErrors = (e: unknown) => {
  const errMsg = "Error, please try again.";
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === "object" && "error" in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateAurthors = () => revalidatePath("/aurthors");

export const createAurthorAction = async (input: NewAurthorParams) => {
  try {
    const payload = insertAurthorParams.parse(input);
    await createAurthor(payload);
    revalidateAurthors();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateAurthorAction = async (input: UpdateAurthorParams) => {
  try {
    const payload = updateAurthorParams.parse(input);
    await updateAurthor(payload.id, payload);
    revalidateAurthors();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteAurthorAction = async (input: AurthorId) => {
  try {
    const payload = aurthorIdSchema.parse({ id: input });
    await deleteAurthor(payload.id);
    revalidateAurthors();
  } catch (e) {
    return handleErrors(e);
  }
};