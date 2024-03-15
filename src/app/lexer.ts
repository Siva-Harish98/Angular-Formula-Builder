import { Lexer, createToken } from 'chevrotain';

/**
 * user can enter the identifiers (`Employee`, `Leave`, `Employee_Exit`) but it should be
 * after on keyword, not only Employee, it could be anything
 * so create a generic token for it
 */

// the identifier regex should have a-zA-Z as the first character and \w* as the rest
export const Identifier = createToken({
    name: 'Identifier',
    pattern: /[a-zA-Z]+(\.[a-zA-Z]+)?/
});

export const ArithmeticOperator = createToken({
    name: 'ArithmeticOperator',
    pattern: Lexer.NA
});

export const MultiOperator = createToken({
    name: 'MultiOperator',
    pattern: Lexer.NA
});

export const Add = createToken({
    name: 'Add',
    pattern: /\+/,
    categories: ArithmeticOperator
});

export const Subtract = createToken({
    name: 'Subtract',
    pattern: /-/,
    categories: ArithmeticOperator
});

export const Multiply = createToken({
    name: 'Multiply',
    pattern: /\*/,
    categories: MultiOperator
});

export const Divide = createToken({
    name: 'Divide',
    pattern: /\//,
    categories: MultiOperator
});

export const LParen = createToken({
    name: 'LParen',
    pattern: /\(/
});

export const RParen = createToken({
    name: 'RParen',
    pattern: /\)/
});

export const NumberLiteral = createToken({
    name: 'NumberLiteral',
    pattern: /[0-9]\d*/
});

export const WhiteSpace = createToken({
    name: 'WhiteSpace',
    pattern: /\s+/,
    group: Lexer.SKIPPED
});

export const Age = createToken({
    name: 'Age',
    pattern: /age/i,
    longer_alt: Identifier
});

export const Salary = createToken({
    name: 'Salary',
    pattern: /salary/i,
    longer_alt: Identifier
});

// language: `on Employee validUntil instant filterBy(isActiveEmployee) aggregate count(Employee.EmployeeID)`

export const On = createToken({
    name: 'On',
    pattern: /on/i,
    longer_alt: Identifier
});

export const ValidUntil = createToken({
    name: 'ValidUntil',
    pattern: /validUntil/i,
    longer_alt: Identifier
});

export const Instant = createToken({
    name: 'Instant',
    pattern: /instant/i,
    longer_alt: Identifier
});

export const FilterBy = createToken({
    name: 'FilterBy',
    pattern: /filterBy/i,
    longer_alt: Identifier
});

export const Aggregate = createToken({
    name: 'Aggregate',
    pattern: /aggregate/i,
    longer_alt: Identifier
});

export const Count = createToken({
    name: 'Count',
    pattern: /count/i,
    longer_alt: Identifier
});

export const Sum = createToken({
    name: 'Sum',
    pattern: /sum/i,
    longer_alt: Identifier
});

export const Max = createToken({
    name: 'Max',
    pattern: /max/i,
    longer_alt: Identifier
});

export const Min = createToken({
    name: 'Min',
    pattern: /min/i,
    longer_alt: Identifier
});

export const Avg = createToken({
    name: 'Avg',
    pattern: /avg/i,
    longer_alt: Identifier
});
export const AlllogicalOperator = createToken({
    name : 'Allogicalop',
    pattern: Lexer.NA
})

export const And = createToken({
    name: 'And',
    pattern: /and/i,
    categories: AlllogicalOperator
});

export const Or = createToken({
    name: 'Or',
    pattern: /or/i,
    categories: AlllogicalOperator
});

export const Logicalop = createToken({
    name: 'Logicalop',
    pattern: /\|\||&&|\^|==|!=|<=|>=|<|>/,
    categories: AlllogicalOperator
})




export const allTokens = [
    WhiteSpace,
    ArithmeticOperator,
    MultiOperator,
    Add,
    Subtract,
    Multiply,
    Divide,
    LParen,
    RParen,
    NumberLiteral,
    On,
    ValidUntil,
    Instant,
    FilterBy,
    Aggregate,
    Count,
    Sum,
    Max,
    Min,
    Avg,
    And,
    Or,
    Logicalop,
    AlllogicalOperator,
    Identifier
];

const OyVeyErrorMessageProvider = {
    buildUnexpectedCharactersMessage(
        fullText: string,
        startOffset: number,
        length: number,
        // eslint-disable-next-line  no-unused-vars -- template
        line: number,
        // eslint-disable-next-line  no-unused-vars -- template
        column: number
    ) {
        return (
            `Oy Vey!!! unexpected character:blah blah`
        );
    },

    buildUnableToPopLexerModeMessage() {
        return 'Oy Vey!!! unable to pop Lexer Mode';
    }
};

// {
//     errorMessageProvider: OyVeyErrorMessageProvider
// }
export const lexer = new Lexer(allTokens);
