
export class LexicalError extends Error {
	line: number;
	value: string;

	constructor(line: number, value: string) {
		let message = `[${line}] Unexpected character: "${value}"`
		super(message);

		this.line = line;
		this.value = value;
	}
}