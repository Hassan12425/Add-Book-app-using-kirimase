import { db } from "@/lib/db/index";
import { and, eq } from "drizzle-orm";
import { 
  AurthorId, 
  NewAurthorParams,
  UpdateAurthorParams, 
  updateAurthorSchema,
  insertAurthorSchema, 
  aurthors,
  aurthorIdSchema 
} from "@/lib/db/schema/aurthors";
import { getUserAuth } from "@/lib/auth/utils";

export const createAurthor = async (aurthor: NewAurthorParams) => {
  const { session } = await getUserAuth();
  const newAurthor = insertAurthorSchema.parse({ ...aurthor, userId: session?.user.id! });
  try {
    const [a] =  await db.insert(aurthors).values(newAurthor).returning();
    return { aurthor: a };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updateAurthor = async (id: AurthorId, aurthor: UpdateAurthorParams) => {
  const { session } = await getUserAuth();
  const { id: aurthorId } = aurthorIdSchema.parse({ id });
  const newAurthor = updateAurthorSchema.parse({ ...aurthor, userId: session?.user.id! });
  try {
    const [a] =  await db
     .update(aurthors)
     .set({...newAurthor, updatedAt: new Date() })
     .where(and(eq(aurthors.id, aurthorId!), eq(aurthors.userId, session?.user.id!)))
     .returning();
    return { aurthor: a };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deleteAurthor = async (id: AurthorId) => {
  const { session } = await getUserAuth();
  const { id: aurthorId } = aurthorIdSchema.parse({ id });
  try {
    const [a] =  await db.delete(aurthors).where(and(eq(aurthors.id, aurthorId!), eq(aurthors.userId, session?.user.id!)))
    .returning();
    return { aurthor: a };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

