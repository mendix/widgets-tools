import { env } from "node:process";
import pc from "picocolors";

// @see https://no-color.org
// @see https://www.npmjs.com/package/chalk
export const {
    bold,
    cyan,
    dim,
    gray,
    green,
    greenBright,
    red,
    underline,
    yellow,
    blue,
    blueBright,
    bgBlue,
    bgGreen,
    black,
    inverse,
    bgGreenBright,
    bgBlackBright,
    bgBlack,
    white,
    magenta,
    magentaBright
} = pc.createColors(env.FORCE_COLOR !== "0" && !env.NO_COLOR);
