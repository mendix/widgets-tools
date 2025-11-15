import { createConsola } from "consola";
import { env } from "node:process";

const CI = !!env.CI;

export const createLogger = () =>
    createConsola({
        level: CI ? 2 : 3,
        fancy: true
    });
