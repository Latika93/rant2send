import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

const DEFAULT_CREDITS = 10;

export async function getOrCreateUser(email: string, name: string | null, image: string | null) {
  await connectDB();
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      email,
      name,
      image,
      credits: DEFAULT_CREDITS,
      totalUsage: 0,
    });
  }
  return user;
}

export async function getCredits(userId: string): Promise<number> {
  await connectDB();
  const user = await User.findById(userId).select("credits").lean() as { credits: number } | null;
  return user?.credits ?? 0;
}

export async function deductCredit(userId: string): Promise<{ success: boolean; remaining: number }> {
  await connectDB();
  const user = await User.findOneAndUpdate(
    { _id: userId, credits: { $gte: 1 } },
    { $inc: { credits: -1, totalUsage: 1 } },
    { new: true }
  );
  if (!user) {
    const current = await User.findById(userId).select("credits").lean() as { credits: number } | null;
    return { success: false, remaining: current?.credits ?? 0 };
  }
  return { success: true, remaining: (user as { credits: number }).credits };
}

export async function addCredits(userId: string, amount: number): Promise<number> {
  await connectDB();
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { credits: amount } },
    { new: true }
  ) as { credits: number } | null;
  return user?.credits ?? 0;
}
