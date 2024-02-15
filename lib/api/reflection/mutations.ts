import { db } from "@/lib/db/index";
import { and, eq } from "drizzle-orm";
import { 
  ReflectionId, 
  NewReflectionParams,
  UpdateReflectionParams, 
  updateReflectionSchema,
  insertReflectionSchema, 
  reflection,
  reflectionIdSchema 
} from "@/lib/db/schema/reflection";
import { getUserAuth } from "@/lib/auth/utils";

export const createReflection = async (reflection: NewReflectionParams) => {
  const { session } = await getUserAuth();
  const newReflection = insertReflectionSchema.parse({ ...reflection, userId: session?.user.id! });
  try {
    const [r] =  await db.insert(reflection).values(newReflection).returning();
    return { reflection: r };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updateReflection = async (id: ReflectionId, reflection: UpdateReflectionParams) => {
  const { session } = await getUserAuth();
  const { id: reflectionId } = reflectionIdSchema.parse({ id });
  const newReflection = updateReflectionSchema.parse({ ...reflection, userId: session?.user.id! });
  try {
    const [r] =  await db
     .update(reflection)
     .set({...newReflection, updatedAt: new Date() })
     .where(and(eq(reflection.id, reflectionId!), eq(reflection.userId, session?.user.id!)))
     .returning();
    return { reflection: r };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deleteReflection = async (id: ReflectionId) => {
  const { session } = await getUserAuth();
  const { id: reflectionId } = reflectionIdSchema.parse({ id });
  try {
    const [r] =  await db.delete(reflection).where(and(eq(reflection.id, reflectionId!), eq(reflection.userId, session?.user.id!)))
    .returning();
    return { reflection: r };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

