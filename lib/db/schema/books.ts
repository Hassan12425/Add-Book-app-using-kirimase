import { sql } from "drizzle-orm";
import { varchar, boolean, timestamp, pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { aurthors } from "./aurthors"
import { type getBooks } from "@/lib/api/books/queries";

import { nanoid, timestamps } from "@/lib/utils";


export const books = pgTable('books', {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => nanoid()),
  title: varchar("title", { length: 256 }).notNull(),
  completed: boolean("completed").notNull(),
  aurthorId: varchar("aurthor_id", { length: 256 }).references(() => aurthors.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),

});


// Schema for books - used to validate API requests
const baseSchema = createSelectSchema(books).omit(timestamps)

export const insertBookSchema = createInsertSchema(books).omit(timestamps);
export const insertBookParams = baseSchema.extend({
  completed: z.coerce.boolean(),
  aurthorId: z.coerce.string().min(1)
}).omit({ 
  id: true,
  userId: true
});

export const updateBookSchema = baseSchema;
export const updateBookParams = baseSchema.extend({
  completed: z.coerce.boolean(),
  aurthorId: z.coerce.string().min(1)
}).omit({ 
  userId: true
});
export const bookIdSchema = baseSchema.pick({ id: true });

// Types for books - used to type API request params and within Components
export type Book = typeof books.$inferSelect;
export type NewBook = z.infer<typeof insertBookSchema>;
export type NewBookParams = z.infer<typeof insertBookParams>;
export type UpdateBookParams = z.infer<typeof updateBookParams>;
export type BookId = z.infer<typeof bookIdSchema>["id"];
    
// this type infers the return from getBooks() - meaning it will include any joins
export type CompleteBook = Awaited<ReturnType<typeof getBooks>>["books"][number];

