import { logger } from "@plop/logger";
import { createClient } from "@plop/supabase/server";
import type { TablesUpdate } from "../types";

export async function updateUser(userId: string, data: TablesUpdate<"users">) {
  const supabase = await createClient();

  try {
    const result = await supabase
      .from("users")
      .update(data as never)
      .eq("id", userId);

    return result;
  } catch (error) {
    logger.error(error);

    throw error;
  }
}
