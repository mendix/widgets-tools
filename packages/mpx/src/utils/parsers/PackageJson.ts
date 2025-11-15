import * as z from "zod";

export const PackageJson = z.object({
    name: z.string().min(1).trim(),
    version: z.string().refine(val => /^\d+\.\d+\.\d+$/.test(val), {
        message: "Invalid semver"
    }),
    widgetName: z.string().min(1).trim(),
    packagePath: z.string().regex(/^[a-zA-Z]+(\.[a-zA-Z]+)*$/, {
        message: "must be dot separated path like 'example.widget'"
    }),
    config: z.optional(
        z.object({
            projectPath: z.string().optional()
        })
    )
});

export type PackageJson = z.infer<typeof PackageJson>;
