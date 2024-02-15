import { Suspense } from "react";

import Loading from "@/app/loading";
import BookList from "@/components/books/BookList";
import { getBooks } from "@/lib/api/books/queries";
import { getAurthors } from "@/lib/api/aurthors/queries";
import { checkAuth } from "@/lib/auth/utils";

export const revalidate = 0;

export default async function BooksPage() {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Books</h1>
        </div>
        <Books />
      </div>
    </main>
  );
}

const Books = async () => {
  await checkAuth();

  const { books } = await getBooks();
  const { aurthors } = await getAurthors();
  return (
    <Suspense fallback={<Loading />}>
      <BookList books={books} aurthors={aurthors} />
    </Suspense>
  );
};
