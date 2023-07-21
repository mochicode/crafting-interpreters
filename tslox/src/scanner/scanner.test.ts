import { test } from '@japa/runner'

import * as Scanner from "./scanner";
import { type Token, TokenType } from "./scanner";


test('can scan Single Character tokens', ({ expect }) => {
	let source = `(
)
{
}
,.
	-
+
;

*
	`

	let tokens = Scanner.scan(source);

	let result: Array<Token> = [
		{ type: TokenType.LEFT_PAREN, lexeme: "(", line: 1 },
		{ type: TokenType.RIGHT_PAREN, lexeme: ")", line: 2 },
		{ type: TokenType.LEFT_BRACE, lexeme: "{", line: 3 },
		{ type: TokenType.RIGHT_BRACE, lexeme: "}", line: 4 },
		{ type: TokenType.COMMA, lexeme: ",", line: 5 },
		{ type: TokenType.DOT, lexeme: ".", line: 5 },
		{ type: TokenType.MINUS, lexeme: "-", line: 6 },
		{ type: TokenType.PLUS, lexeme: "+", line: 7 },
		{ type: TokenType.SEMICOLON, lexeme: ";", line: 8 },
		{ type: TokenType.STAR, lexeme: "*", line: 10 },
	]

	expect(tokens).toEqual(result);
})


test('can scan One or More Chars tokens', ({ expect }) => {
	let source = `= != ==
// this is a comment
< <=
/* This
 * is a multi line
 * comment
*/
> >=
	`

	let tokens = Scanner.scan(source);

	let result: Array<Token> = [
		{ type: TokenType.EQUAL, lexeme: "=", line: 1 },
		{ type: TokenType.BANG_EQUAL, lexeme: "!=", line: 1 },
		{ type: TokenType.EQUAL_EQUAL, lexeme: "==", line: 1 },

		{ type: TokenType.LESS, lexeme: "<", line: 3 },
		{ type: TokenType.LESS_EQUAL, lexeme: "<=", line: 3 },

		{ type: TokenType.GREATER, lexeme: ">", line: 8 },
		{ type: TokenType.GREATER_EQUAL, lexeme: ">=", line: 8 },
	]

	expect(tokens).toEqual(result);
})

test('can scan strings', ({ expect }) => {
	let multi = `this is
a multi line string`;

	let source = `"this is a string"
"${multi}"
`

	let tokens = Scanner.scan(source);

	let result: Array<Token> = [
		{ type: TokenType.STRING, lexeme: "this is a string", line: 1 },
		{ type: TokenType.STRING, lexeme: multi, line: 2 },
	]

	expect(tokens).toEqual(result);
})

test('can scan numbers', ({ expect }) => {
	let source = `123 12.3 0.1`

	let tokens = Scanner.scan(source);

	let result: Array<Token> = [
		{ type: TokenType.NUMBER, lexeme: "123", line: 1, literal: 123 },
		{ type: TokenType.NUMBER, lexeme: "12.3", line: 1, literal: 12.3  },
		{ type: TokenType.NUMBER, lexeme: "0.1", line: 1, literal: 0.1  },
	]

	expect(tokens).toEqual(result);
})


test('can scan reserved keywords', ({ expect }) => {
	let source = `and
class
else
false
for
fun
if
nil
or
print
return
super
this
true
var
while
th1s_is_an_identifier
_while_so_is_this`

	let tokens = Scanner.scan(source);

	let result: Array<Token> = [
		{ type: TokenType.AND, lexeme: "and", line: 1 },
		{ type: TokenType.CLASS, lexeme: "class", line: 2 },
		{ type: TokenType.ELSE, lexeme: "else", line: 3 },
		{ type: TokenType.FALSE, lexeme: "false", line: 4 },
		{ type: TokenType.FOR, lexeme: "for", line: 5 },
		{ type: TokenType.FUN, lexeme: "fun", line: 6 },
		{ type: TokenType.IF, lexeme: "if", line: 7 },
		{ type: TokenType.NIL, lexeme: "nil", line: 8 },
		{ type: TokenType.OR, lexeme: "or", line: 9 },
		{ type: TokenType.PRINT, lexeme: "print", line: 10 },
		{ type: TokenType.RETURN, lexeme: "return", line: 11 },
		{ type: TokenType.SUPER, lexeme: "super", line: 12 },
		{ type: TokenType.THIS, lexeme: "this", line: 13 },
		{ type: TokenType.TRUE, lexeme: "true", line: 14 },
		{ type: TokenType.VAR, lexeme: "var", line: 15 },
		{ type: TokenType.WHILE, lexeme: "while", line: 16 },
		{ type: TokenType.IDENTIFIER, lexeme: "th1s_is_an_identifier", line: 17 },
		{ type: TokenType.IDENTIFIER, lexeme: "_while_so_is_this", line: 18 },
	]

	expect(tokens).toEqual(result);
})

