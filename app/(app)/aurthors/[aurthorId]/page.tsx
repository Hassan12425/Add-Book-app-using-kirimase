import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getAurthorByIdWithBooks } from "@/lib/api/aurthors/queries";
import OptimisticAurthor from "./OptimisticAurthor";
import { checkAuth } from "@/lib/auth/utils";
import BookList from "@/components/books/BookList";

import { BackButton } from "@/components/shared/BackButton";
import Loading from "@/app/loading";


export const revalidate = 0;

export default async function AurthorPage({
  params,
}: {
  params: { aurthorId: string };
}) {

  return (
    <main className="overflow-auto">
      <Aurthor id={params.aurthorId} />
    </main>
  );
}

const Aurthor = async ({ id }: { id: string }) => {
  await checkAuth();

  const { aurthor, books } = await getAurthorByIdWithBooks(id);
  

  if (!aurthor) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <BackButton currentResource="aurthors" />
        <OptimisticAurthor aurthor={aurthor}  />
      </div>
      <div className="relative mt-8 mx-4">
        <h3 className="text-xl font-medium mb-4">{aurthor.name}&apos;s Books</h3>
        <BookList
          aurthors={[]}
          aurthorId={aurthor.id}
          books={books}
        />
      </div>
    </Suspense>
  );
};
