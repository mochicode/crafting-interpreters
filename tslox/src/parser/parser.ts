import { ScannerIter, Token, TokenType } from "../scanner/scanner";

type Kind<T, K extends string> = Extract<T, { kind: K }>; 

export type Expr =
	| { kind: "assign"; name: Token; value: Expr }
	| { kind: "binary"; left: Expr; operator: Token; right: Expr }
	| { kind: "call";  callee: Expr; paren: Token; arguments: Array<Expr> }
	| { kind: "get"; object: Expr; name: Token }
	| { kind: "grouping"; expression: Expr }
	| { kind: "literal"; value: Record<string, unknown> }
	| { kind: "logical"; left: Expr; operator: Token; right: Expr }
	| { kind: "set"; object: Expr; name: Token; value: Expr }
	| { kind: "super"; keyword: Token; method: Token }
	| { kind: "this"; keyword: Token }
	| { kind: "unary"; operator: Token; right: Expr }
	| { kind: "variable"; name: Token }

export type Stmt =
	| { kind: "block"; statements: Array<Stmt> }
	| { kind: "function", name: Token; params: Array<Token>; body?: Array<Stmt> }
	| { kind: "expression"; expression: Expr }
	| { kind: "class"; name: Token; superclass: Kind<Expr, "variable"> | null, methods: Array<Kind<Stmt, "function">> }
	| { kind: "if"; condition: Expr; thenBranch: Stmt; elseBranch: Stmt }
	| { kind: "print"; expression: Expr }
	| { kind: "return"; keyword: Token; value: Expr }
	| { kind: "var"; name: Token; initializer: Expr }
	| { kind: "while"; condition: Expr; body: Stmt }



/*
	program        → declaration* EOF ;

	
	declaration    → classDecl
	               | funDecl
	               | varDecl
	               | statement ;

	classDecl      → "class" IDENTIFIER ( "<" IDENTIFIER )?
	                 "{" function* "}" ;
	funDecl        → "fun" function ;
	varDecl        → "var" IDENTIFIER ( "=" expression )? ";" ;


	statement      → exprStmt
	               | forStmt
	               | ifStmt
	               | printStmt
	               | returnStmt
	               | whileStmt
	               | block ;

	exprStmt       → expression ";" ;
	forStmt        → "for" "(" ( varDecl | exprStmt | ";" )
	                           expression? ";"
	                           expression? ")" statement ;
	ifStmt         → "if" "(" expression ")" statement
	                 ( "else" statement )? ;
	printStmt      → "print" expression ";" ;
	returnStmt     → "return" expression? ";" ;
	whileStmt      → "while" "(" expression ")" statement ;
	block          → "{" declaration* "}" ;


	expression     → assignment ;

	assignment     → ( call "." )? IDENTIFIER "=" assignment
	               | logic_or ;

	logic_or       → logic_and ( "or" logic_and )* ;
	logic_and      → equality ( "and" equality )* ;
	equality       → comparison ( ( "!=" | "==" ) comparison )* ;
	comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
	term           → factor ( ( "-" | "+" ) factor )* ;
	factor         → unary ( ( "/" | "*" ) unary )* ;

	unary          → ( "!" | "-" ) unary | call ;
	call           → primary ( "(" arguments? ")" | "." IDENTIFIER )* ;
	primary        → "true" | "false" | "nil" | "this"
	               | NUMBER | STRING | IDENTIFIER | "(" expression ")"
	               | "super" "." IDENTIFIER ;


	function       → IDENTIFIER "(" parameters? ")" block ;
	parameters     → IDENTIFIER ( "," IDENTIFIER )* ;
	arguments      → expression ( "," expression )* ;


	NUMBER         → DIGIT+ ( "." DIGIT+ )? ;
	STRING         → "\"" <any char except "\"">* "\"" ;
	IDENTIFIER     → ALPHA ( ALPHA | DIGIT )* ;
	ALPHA          → "a" ... "z" | "A" ... "Z" | "_" ;
	DIGIT          → "0" ... "9" ;
*/

export function* parse(scanner: ScannerIter) {
	let peekable = new Peekable(scanner);

	while(!peekable.done()) {
		yield Declaration(peekable);
	}

	return null;
}

function Declaration(scanner: Peekable) {
	try {
		let value = scanner.value();

		if (value.type === TokenType.EOF) {
			return;
		}

		switch (value.type) {
			case TokenType.CLASS:
				return Class(scanner);

			case TokenType.FUN:
				throw new Error("unimplemented");

			case TokenType.VAR:
				throw new Error("unimplemented");

			default:
				throw new Error("unimplemented");
		}
	} catch(error) {
		console.error(error);

	}
}

function Class(scanner: Peekable): Stmt {
	scanner.advance();
	let name = scanner.consume(TokenType.IDENTIFIER, "Expect class name.");

	let superclass: Expr | null = null;
	if (scanner.value().type === TokenType.LESS) {
		scanner.advance();
		let name = scanner.consume(TokenType.IDENTIFIER, "Expect superclass name.");
		superclass = { kind: "variable", name };
	}

	scanner.consume(TokenType.LEFT_BRACE, "Expect '{' before class body.");
	
	let methods: Array<Kind<Stmt, "function">> = [];
	while(!scanner.done() && scanner.value().type !== TokenType.RIGHT_BRACE) {
		methods.push(Fun(scanner));
	}
	
	scanner.consume(TokenType.RIGHT_BRACE, "Expect '}' after class body.");

	return { kind: "class", name, superclass, methods }
}

function FunStmt(scanner: Peekable) {
	scanner.advance();
	
}

function Var(scanner: Peekable) {
	scanner.advance();
	
}

function Statement(scanner: Peekable) {
	scanner.advance();
	
}

function Fun(scanner: Peekable): Kind<Stmt, "function"> {
	let name = scanner.consume(TokenType.IDENTIFIER, "Expected function name");
	scanner.consume(TokenType.LEFT_PAREN, "Expected (");
	let params = Parameters(scanner);
	scanner.consume(TokenType.RIGHT_PAREN, "Expected )");
	let body = Block(scanner);
	return { kind: "function", body, name, params }
}

function Block(scanner: Peekable) {
	scanner.consume(TokenType.LEFT_BRACE, "Expected {");
	let stmt: Array<Stmt> = [];

	while(scanner.value().type !== TokenType.RIGHT_BRACE) {
		let value = Declaration(scanner);

		if (value) {
			stmt.push(value);
		}
	}

	scanner.consume(TokenType.RIGHT_BRACE, "Expected }");
	return stmt;
}

function Parameters(scanner: Peekable) {
	let parameters = [];

	while(scanner.value().type === TokenType.IDENTIFIER) {
		let param = scanner.consume(TokenType.IDENTIFIER, "Expected identifier");
		parameters.push(param);

		if (scanner.value().type === TokenType.COMMA) {
			scanner.next();
			continue;
		}

		break;
	}

	return parameters;
}

class Peekable {
	private iter: ScannerIter;
	private currentToken: IteratorResult<Token, Token>;	
	private nextToken: IteratorResult<Token, Token>;

	constructor(iter: ScannerIter) {
		this.iter = iter;
		this.currentToken = iter.next();
		this.nextToken = iter.next();
	}

	next() {
		let value = this.currentToken;
		this.currentToken = this.nextToken;
		this.nextToken = this.iter.next();
		return value;
	}

	advance() {
		this.currentToken = this.nextToken;
		this.nextToken = this.iter.next();
	}

	value() {
		return this.currentToken.value;
	}

	peek() {
		return this.nextToken;
	}

	done() {
		return this.currentToken.done === true;
	}

	consume(tokenType: TokenType, error: string) {
		let value = this.value();

		if (value.type === TokenType.EOF) {
			throw new Error("consume error");
		}

		if (value.type !== tokenType) {
			console.log("Current Value: ", value);
			throw new Error(error)
		}

		this.advance();

		return value;
	}
}
