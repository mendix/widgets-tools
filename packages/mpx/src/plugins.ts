import image from "@rollup/plugin-image";
import url from "@rollup/plugin-url";
import { RolldownPlugin } from "rolldown";
import license from "rollup-plugin-license";

/** Note: Rollup has issue with exported types https://github.com/rollup/plugins/issues/1329 */
type RollupUrlFactory = typeof url.default;
export type RollupUrlOptions = Parameters<RollupUrlFactory>[0];
export type RollupImageOptions = Parameters<typeof image.default>[0];
export type RollupLicenseOptions = Parameters<typeof license.default>[0];

export const plugins = {
    url(options?: RollupUrlOptions): RolldownPlugin {
        const urlPlugin = (url as unknown as RollupUrlFactory)(options);
        return urlPlugin as RolldownPlugin;
    },
    image(options?: RollupImageOptions): RolldownPlugin {
        return (image as any)(options) as RolldownPlugin;
    },
    license(options?: RollupLicenseOptions): RolldownPlugin {
        return (license as any)(options) as RolldownPlugin;
    }
};
