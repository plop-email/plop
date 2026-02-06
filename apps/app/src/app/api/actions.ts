"use server";

import { tasks } from "@trigger.dev/sdk";

export async function myTask() {
  try {
    const handle = await tasks.trigger("hello-world", "James");

    return { handle };
  } catch (error) {
    console.error(error);
    return {
      error: "something went wrong",
    };
  }
}
