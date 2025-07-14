import { bold, red } from "./colors.js";

export function printError(error: unknown): void {
    if (error instanceof Error) {
        const name = error.name;
        console.error(formatMessage(error.message));
    } else {
        console.error(red("Unknown error:"), bold(String(error)));
    }
}

const formatMessage = (message: string): string => {
    return bold(red(`[Error] ${bold(message)}`));
};
