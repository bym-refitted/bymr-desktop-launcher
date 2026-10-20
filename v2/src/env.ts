import { defineEnvVars } from "@sveltejs/kit/env";
import { z } from "zod";

export const variables = defineEnvVars({
  VITE_BASE_URL: {
    public: true,
    static: true,
    schema: z.url(),
    description: "Base URL of the BYMR game API server, e.g. https://server.bymrefitted.com",
  },
});
