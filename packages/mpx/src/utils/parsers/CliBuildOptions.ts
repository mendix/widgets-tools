import * as z from "zod";

export const CliBuildOptions = z.object({
    watch: z.boolean(),
    minify: z.boolean(),
    platform: z.enum(["web", "native"]),
    showConfig: z.boolean()
});

export type CliBuildOptions = z.infer<typeof CliBuildOptions>;
