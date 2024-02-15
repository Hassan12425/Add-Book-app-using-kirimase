import { Suspense } from "react";

import Loading from "@/app/loading";
import AurthorList from "@/components/aurthors/AurthorList";
import { getAurthors } from "@/lib/api/aurthors/queries";

import { checkAuth } from "@/lib/auth/utils";

export const revalidate = 0;

export default async function AurthorsPage() {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Aurthors</h1>
        </div>
        <Aurthors />
      </div>
    </main>
  );
}

const Aurthors = async () => {
  await checkAuth();

  const { aurthors } = await getAurthors();
  
  return (
    <Suspense fallback={<Loading />}>
      <AurthorList aurthors={aurthors}  />
    </Suspense>
  );
};
