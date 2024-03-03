import { describe, it } from 'node:test'
import assert from 'node:assert';

import { TokenType, scan } from "../scanner/scanner";
import { parse } from "./parser";


describe("parser: class", () => {
	it("can parse empty class", () => {
		let code = `
			class fuu {

			}
		`

		let parser = parse(scan(code));
		assert.deepEqual(parser.next().value, {
		  kind: "class",
		  name: {
		    type: TokenType.IDENTIFIER,
		    lexeme: "fuu",
		    line: 2
		  },
		  superclass: null,
		  methods: []
		});
	});

	it("can parse class with methods", () => {
		let code = `
			class fuu {
				bar() {

				}

				baz(a, b) {

				}

				dangling_comma(a, b,) {

				}
			}
		`

		let parser = parse(scan(code));
		assert.deepEqual(parser.next().value, {
			kind: "class",
			name: {
				type: TokenType.IDENTIFIER,
				lexeme: "fuu",
				line: 2
			},
			superclass: null,
			methods: [
			{
				kind: "function",
				body: [],
				name: {
					type: TokenType.IDENTIFIER,
					lexeme: "bar",
					line: 3
				},
				params: []
			},
			{
				kind: "function",
				body: [],
				name: {
					type: TokenType.IDENTIFIER,
					lexeme: "baz",
					line: 7
				},
				params: [
				{
					type: TokenType.IDENTIFIER,
					lexeme: "a",
					line: 7
				},
				{
					type: TokenType.IDENTIFIER,
					lexeme: "b",
					line: 7
				}
				]
			},
			{
				kind: "function",
				body: [],
				name: {
					type: TokenType.IDENTIFIER,
					lexeme: "dangling_comma",
					line: 11
				},
				params: [
				{
					type: TokenType.IDENTIFIER,
					lexeme: "a",
					line: 11
				},
				{
					type: TokenType.IDENTIFIER,
					lexeme: "b",
					line: 11
				}
				]
			}
			]
		})
	})

	it("can parse empty class with superclass", () => {
		let code = `
			class fuu < bar {
				
			}
		`

		let parser = parse(scan(code));
		assert.deepEqual(parser.next().value, {
		  kind: "class",
		  name: {
		    type: TokenType.IDENTIFIER,
		    lexeme: "fuu",
		    line: 2
		  },
		  superclass: {
		    kind: "variable",
		    name: {
		      type: TokenType.IDENTIFIER,
		      lexeme: "bar",
		      line: 2
		    }
		  },
		  methods: []
		});
	})
})