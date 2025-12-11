import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const page = async ({ params }: { params: { lang: string } }) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/${params.lang}/auth/login`);
  }

  redirect(`/${params.lang}/dashboard`);
};

export default page;
