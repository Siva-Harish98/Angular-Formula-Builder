import { CstNode, CstParser, IToken, TokenType } from 'chevrotain';
import {
    Aggregate,
    AlllogicalOperator,
    ArithmeticOperator,
    Count,
    FilterBy,
    Identifier,
    Instant,
    LParen,
    Max,
    Min,
    MultiOperator,
    NumberLiteral,
    On,
    RParen,
    Sum,
    ValidUntil,
    allTokens
} from './lexer';


const customErrors = {
    buildMismatchTokenMessage(options: {
        expected: TokenType;
        actual: IToken;
        previous: IToken;
        ruleName: string;
    }): string {
        return ``;
    },
    buildNotAllInputParsedMessage(options: { firstRedundant: IToken; ruleName: string }): string {
        return `Redundant input, expecting EOF but found: ${options.firstRedundant.image}`;
    },
    buildNoViableAltMessage(options: {
        expectedPathsPerAlt: TokenType[][][];
        actual: IToken[];
        previous: IToken;
        customUserDescription?: string;
        ruleName: string;
    }): string {
        return 'No viable alternative';
    },
    buildEarlyExitMessage(options: {
        expectedIterationPaths: TokenType[][];
        actual: IToken[];
        previous: IToken;
        customUserDescription?: string;
        ruleName: string;
    }): string {
        return 'Early exit';
    }
};

export class ArithmeticExpressionParser extends CstParser {
    Oncheck:boolean = false
    constructor() {
        super(
            allTokens
            //     {
            //     errorMessageProvider: customErrors
            // }
        );
        this.createRules();
    }

    // Example of a valid formula:
    // language 1: `on Employee validUntil instant filterBy(isActiveEmployee) aggregate count(Employee.EmployeeID)`
    // language 2: all types of arithmetic expression with addition, subtraction, multiplication, division, and parenthesis, age, salary keywords
    // language can start with language 1 or language 2
    // Arithmetic expression rules END
        /**
         *
         * language 1: `on Employee count(Employee.EmployeeID)`
         * Starts with `on` keyword
         * Followed by an identifier
         * Followed by an optional `validUntil` keyword
         * Followed by an optional `instant` keyword
         * Followed by an optional `filterBy` keyword
         * Followed by an optional `aggregate` keyword
         * Followed by an optional `count`, `sum`, `min`, `max` keyword
         * on employee aggregate count(Employee.EmployeeID)
         * on employee filterBy(isActiveEmployee)  aggregate count(Employee.EmployeeID)
         * on employee validUntil instant   aggregate count(Employee.EmployeeID) filterBy(isActiveEmployee)
         * on employee validUntil instant aggregate count(Employee.EmployeeID)
         * on employee validUntil instant filterBy(isActiveEmployee) aggregate count(Employee.EmployeeID)
         * on employee validUntil instant   aggregate count(Employee.EmployeeID) filterBy(isActiveEmployee) + 100
         * 110 + on employee validUntil instant   aggregate count(Employee.EmployeeID) filterBy(isActiveEmployee) + 100
         */






    declare expression: () => CstNode;

    createRules() {
        let Oncheck = false
        const T: any = this;

        T.RULE('expression', () => {
            T.OR([
                {
                    ALT: () => {
                        T.SUBRULE(T.additionExpression);
                    }
                },
                {
                  
                    ALT: () => {
                        T.SUBRULE(T.onKey);
                    }
                }
            ]);
        });

        // Arithmetic expression rules START

        T.RULE('additionExpression', () => {
            T.SUBRULE(T.multiplicationExpression, { LABEL: 'lhs' });         
            T.MANY(() => {
                T.SUBRULE2(T.ArithOperator, { LABEL: 'arthmetics' })
                T.SUBRULE3(T.multiplicationExpression, { LABEL: 'rhs' }) 
            });
        });


        T.RULE('multiplicationExpression', () => {
            T.SUBRULE(T.atomicExpression, { LABEL: 'lhs' });
            T.MANY(() => {
                T.SUBRULE2(T.MultiplicationOperator, { LABEL: 'multioperator' })
                T.SUBRULE3(T.atomicExpression, { LABEL: 'rhs' })
            });
        });
 
        T.RULE('ArithOperator',()=>{
            T.CONSUME(ArithmeticOperator),
            T.OPTION(()=>{
                T.SUBRULE(T.onKey)
            })
        })

        T.RULE('MultiplicationOperator',()=>{
            T.CONSUME(MultiOperator),
            T.OPTION(()=>{
                T.SUBRULE(T.onKey)
            })
        })

        T.RULE('atomicExpression', () => {
            T.OR([
                { ALT: () => T.CONSUME(NumberLiteral) },
                { ALT: () => T.SUBRULE2(T.parenthesisExpression) }

            ]);
        });


        T.RULE('parenthesisExpression', () => {
            T.CONSUME(LParen);
            T.SUBRULE(T.expression);
            T.CONSUME(RParen);
        });
       

        T.RULE('onKey', () => {
            T.CONSUME(On);
            T.CONSUME(Identifier);
            
            T.MANY(() => { // Repeatingly call those function again and again 
                T.OPTION(() => {
                    T.SUBRULE(T.optionalRule, { LABEL: 'opt1' });
                });
                T.SUBRULE(T.minimumExpressionIsRequired, { LABEL: 'minExp' });

                T.OPTION2(() => {
                    T.SUBRULE2(T.optionalRule, { LABEL: 'opt2' });
                });
            })

            T.OPTION3(() => {
                T.SUBRULE3(T.checkArthmetics, { LABEL: 'checkarmsop' });
            });




        });

        T.RULE('minimumExpressionIsRequired', () => {
            T.SUBRULE(T.aggregateKey, { LABEL: 'aggregateKey' });

        });

        T.RULE('optionalRule', () => {
            T.OPTION(() => {
                T.SUBRULE(T.validUntilKey);
            });
            T.OPTION2(() => {
                T.SUBRULE(T.filterByFn);
            });
        });

        T.RULE('validUntilKey', () => {
            T.CONSUME(ValidUntil);
            T.CONSUME(Instant);
        });

        T.RULE('filterByFn', () => {
            T.CONSUME(FilterBy);
            T.CONSUME(LParen);
            T.CONSUME(Identifier);
            T.AT_LEAST_ONE(()=>{
                T.OPTION(()=>{
                    T.CONSUME(AlllogicalOperator)
                    T.OR([
                        {ALT:()=>T.CONSUME(NumberLiteral)},
                        {ALT:()=>T.CONSUME2(Identifier)}
                    ])
                })
               
            })        
            T.CONSUME(RParen);
        });

        





        T.RULE('aggregateKey', () => {
            T.CONSUME(Aggregate);
            T.SUBRULE(T.aggregateFns);
            T.CONSUME(LParen);
            T.CONSUME(Identifier);
            T.CONSUME(RParen);
        });

        T.RULE('checkArthmetics', () => {
            T.SUBRULE(T.checkop, { LABEL: 'checkOperator' })
            T.SUBRULE2(T.additionExpression, {LABEL:'Calladditionexp'})    
        })

        T.RULE('checkop', () => {
            T.OR([
                { ALT: () => T.CONSUME(ArithmeticOperator) },
                { ALT: () => T.CONSUME(MultiOperator) }
            ])


        })



        T.RULE('aggregateFns', () => {


            T.OR([
                {
                    ALT: () => {
                        T.CONSUME(Count);
                    }
                },
                {
                    ALT: () => {
                        T.CONSUME(Sum);
                    }
                },
                {
                    ALT: () => {
                        T.CONSUME(Min);
                    }
                },
                {
                    ALT: () => {
                        T.CONSUME(Max);
                    }
                }
            ]);
        })


        T.performSelfAnalysis();
    }
}

export const parserInstance = new ArithmeticExpressionParser();