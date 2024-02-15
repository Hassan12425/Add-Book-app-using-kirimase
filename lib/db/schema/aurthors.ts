import { sql } from "drizzle-orm";
import { varchar, timestamp, pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { type getAurthors } from "@/lib/api/aurthors/queries";

import { nanoid, timestamps } from "@/lib/utils";


export const aurthors = pgTable('aurthors', {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => nanoid()),
  name: varchar("name", { length: 256 }).notNull(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),

});


// Schema for aurthors - used to validate API requests
const baseSchema = createSelectSchema(aurthors).omit(timestamps)

export const insertAurthorSchema = createInsertSchema(aurthors).omit(timestamps);
export const insertAurthorParams = baseSchema.extend({}).omit({ 
  id: true,
  userId: true
});

export const updateAurthorSchema = baseSchema;
export const updateAurthorParams = baseSchema.extend({}).omit({ 
  userId: true
});
export const aurthorIdSchema = baseSchema.pick({ id: true });

// Types for aurthors - used to type API request params and within Components
export type Aurthor = typeof aurthors.$inferSelect;
export type NewAurthor = z.infer<typeof insertAurthorSchema>;
export type NewAurthorParams = z.infer<typeof insertAurthorParams>;
export type UpdateAurthorParams = z.infer<typeof updateAurthorParams>;
export type AurthorId = z.infer<typeof aurthorIdSchema>["id"];
    
// this type infers the return from getAurthors() - meaning it will include any joins
export type CompleteAurthor = Awaited<ReturnType<typeof getAurthors>>["aurthors"][number];

