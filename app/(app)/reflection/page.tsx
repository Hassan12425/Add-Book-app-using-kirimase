import { Suspense } from "react";

import Loading from "@/app/loading";
import ReflectionList from "@/components/reflection/ReflectionList";
import { getReflection } from "@/lib/api/reflection/queries";
import { getBooks } from "@/lib/api/books/queries";
import { checkAuth } from "@/lib/auth/utils";

export const revalidate = 0;

export default async function ReflectionPage() {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Reflection</h1>
        </div>
        <Reflection />
      </div>
    </main>
  );
}

const Reflection = async () => {
  await checkAuth();

  const { reflection } = await getReflection();
  const { books } = await getBooks();
  return (
    <Suspense fallback={<Loading />}>
      <ReflectionList reflection={reflection} books={books} />
    </Suspense>
  );
};
