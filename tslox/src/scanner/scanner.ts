import { LexicalError } from "../error";

export enum TokenType {
	// Single Character
	LEFT_PAREN, RIGHT_PAREN, LEFT_BRACE, RIGHT_BRACE,
	COMMA, DOT, MINUS, PLUS, SEMICOLON, SLASH, STAR,

	// One or More Chars
	BANG, BANG_EQUAL, EQUAL, EQUAL_EQUAL,
	GREATER, GREATER_EQUAL, LESS, LESS_EQUAL,

	// Literals
	IDENTIFIER, STRING, NUMBER,

	// Keywords
	AND, CLASS, ELSE, FALSE, FUN, FOR, IF, NIL, OR,
	PRINT, RETURN, SUPER, THIS, TRUE, VAR, WHILE,

	EOF,

}

type BaseToken = {
	lexeme: string,
	line: number;
}

export type Token =
	| BaseToken & { type: TokenType; }
	| BaseToken & { type: TokenType.NUMBER, literal: number }


export function scan(source: string): Array<Token> {
	let iter = new StringIterator(source);
	let tokens: Array<Token> = [];
	let line = 1;

	let push = (type: TokenType, lexeme: string) => {
		tokens.push({ type, lexeme, line })
	}

	let char = iter.next();
	while(!char.done) {
		switch(char.value) {
			case "\t": break;
			case " ": break;
			case "\r": break;

			case "\n": line = line + 1; break;

			case "(": push(TokenType.LEFT_PAREN, char.value); break;
			case ")": push(TokenType.RIGHT_PAREN, char.value); break;
			case "{": push(TokenType.LEFT_BRACE, char.value); break;
			case "}": push(TokenType.RIGHT_BRACE, char.value); break;
			case ",": push(TokenType.COMMA, char.value); break;
			case ".": push(TokenType.DOT, char.value); break;
			case "-": push(TokenType.MINUS, char.value); break;
			case "+": push(TokenType.PLUS, char.value); break;
			case ";": push(TokenType.SEMICOLON, char.value); break;
			case "*": push(TokenType.STAR, char.value); break;

			case "!":
				if (iter.peek() === "=") {
					push(TokenType.BANG_EQUAL, iter.consum(2));
				} else {
					push(TokenType.EQUAL, char.value);
				}
				break;

			case "=":
				if (iter.peek() === "=") {
					push(TokenType.EQUAL_EQUAL, iter.consum(2));
				} else {
					push(TokenType.EQUAL, char.value);
				}
				break;

			case "<":
				if (iter.peek() === "=") {
					push(TokenType.LESS_EQUAL, iter.consum(2));
				} else {
					push(TokenType.LESS, char.value);
				}
				break;

			case ">":
				if (iter.peek() === "=") {
					push(TokenType.GREATER_EQUAL, iter.consum(2));
				} else {
					push(TokenType.GREATER, char.value);
				}
				break;

			case "/":
				if (iter.peek() === "/") {
					iter.discardUntil(char => char === "\n");
				} else if (iter.peek() === "*") {
					let lines = 0;
					iter.discardUntil((char, self) => {
						if (char === "\n") {
							lines = lines + 1;
							return false;
						}

						return char === "*" && self.peek() === "/"
					})
					
					iter.consum(3);

					line = line + lines;
				} else {
					push(TokenType.SLASH, char.value);
				}
				break;

			case '"':
				let value = iter.takeUntil(char => char === '"');
				if (value === null) {
					throw new Error(`Unterminated String`);
				}

				push(TokenType.STRING, value.slice(0, - 1));
				break;

			default:
				if (isDigit(char.value)) {
					let num = iter.takeWhile(char => isDigit(char) || char === ".");

					if (num.startsWith("00")) {
						throw new Error(`Invalid number: ${num}`);
					}

					let token: Token = {
						type: TokenType.NUMBER,
						lexeme: num,
						line,
						literal: parseFloat(num)
					};

					tokens.push(token)
				} else if (isAlpha(char.value)) {
					let identifier = iter.takeWhile(char => isAlpha(char) || isDigit(char));
					let tokenType = ReservedKeywords.get(identifier) ?? TokenType.IDENTIFIER;
					push(tokenType, identifier)
				} else {
					throw new LexicalError(line, char.value);
				}
		}

		char = iter.next();
	}

	return tokens;
}


class StringIterator {
	private pos: number = 0;
	private source: string;

	constructor(source: string) {
		this.source = source;
	}

	next(): { done: true, value: null } | { done: false, value: string } {
		if (this.pos === this.source.length) {
			return { done: true, value: null }
		}

		let value = this.source[this.pos];
		this.pos = this.pos + 1;

		return { value, done: false };
	}

	peek(): string | undefined {
		return this.source.at(this.pos);
	}

	value(): { done: true, value: null } | { done: false, value: string } {
		let pos = this.pos - 1;
		if (pos === this.source.length) {
			return { done: true, value: null }
		}

		let value = this.source[pos];
		return { value, done: false };
	}

	consum(chars: number): string {
		let result = "";

		for(let i = 0; i < chars; i = i + 1) {
			let pos = this.pos + i;
			let char = this.source.at(pos - 1);

			if (char !== undefined) {
				result += char;
			}
		}

		this.pos = this.pos + chars - 1;

		return result;
	}

	takeUntil(fun: (char: string) => boolean): string | null {
		let result: string | null = "";

		let char = this.next();
		while(!char.done) {

			result += char.value;

			if (fun(char.value) === true) {
				break;
			}

			char = this.next();

			if (char.done) {
				result = null;
				break;
			}
		}

		return result;
	}

	takeWhile(fun: (char: string) => boolean): string {
		let result: string = "";

		let char = this.value();
		while(!char.done) {
			if (fun(char.value) === false) {
				break;
			}

			result += char.value;

			let next = this.peek();

			if (next === undefined) {
				break;
			}

			if (fun(next) === false) {
				break;
			} 

			char = this.next();
		}

		return result;
	}

	discardUntil(fun: (char: string, self: StringIterator) => boolean): void {
		let end = this.source.length;

		for(let i = 0; i < end; i = i + 1) {
			let char = this.value();

			if (char.done) {
				break;
			}

			if (fun(char.value, this) === true) {
				this.pos = this.pos - 1;
				break;
			}

			this.pos = this.pos + 1;
		}
	}
}

function isDigit(char: string): boolean {
	return char >= "0" && char <= "9";
}

function isAlpha(char: string): boolean {
	return (char >= "a" && char <= "z") ||
	       (char >= "A" && char <= "Z") ||
	       char === "_"
}

export let ReservedKeywords = new Map([
	["and", TokenType.AND],
	["class", TokenType.CLASS],
	["else", TokenType.ELSE],
	["false", TokenType.FALSE],
	["for", TokenType.FOR],
	["fun", TokenType.FUN],
	["if", TokenType.IF],
	["nil", TokenType.NIL],
	["or", TokenType.OR],
	["print", TokenType.PRINT],
	["return", TokenType.RETURN],
	["super", TokenType.SUPER],
	["this", TokenType.THIS],
	["true", TokenType.TRUE],
	["var", TokenType.VAR],
	["while", TokenType.WHILE],
]);
