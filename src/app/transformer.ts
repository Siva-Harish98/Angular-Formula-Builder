import { tokenMatcher } from 'chevrotain';
import { Add, Multiply, lexer } from './lexer';
import { parserInstance as parser } from './parser';


const CstVisitor = parser.getBaseCstVisitorConstructor();

interface IQueryOptions {
    select: boolean,
    table: String
    aggregate?: boolean | null,
    ValidUntil?: boolean | null,
    filter?:boolean | null,
    where?: boolean,
    aggregatePattern: AggregatePattern[]
    filterPattern: filpattern []
}

interface AggregateFunc {
    count: boolean;
    sum: boolean;
    max: boolean;
    min: boolean;
    avg: boolean;
}

interface AggregatePattern {
    aggregatefunct: AggregateFunc,
    aggregationColumn: String
}

interface filpattern {
    name : String,
    op: String
}

let queryOptions : IQueryOptions
export default class ArithmeticCstVisitor extends CstVisitor {

    constructor() {
        super();
        this.validateVisitor();
    }

    expression(ctx: any) {
        if (ctx.additionExpression) {
            return this.visit(ctx.additionExpression);
        } else {
            return this.visit(ctx.onKey);
        }

    }

    additionExpression(ctx: any) {
        let result = this.visit(ctx.lhs);
        if (ctx.rhs?.length) {
            ctx.rhs.forEach((rhs: any, index: number) => {
                const operator = ctx.ArithmeticOperator[index];
                const rhsValue = this.visit(rhs);
                if (tokenMatcher(operator, Add)) {
                    result += rhsValue;
                } else {
                    result -= rhsValue;
                }
            });
        }
        return result;
    }

    multiplicationExpression(ctx: any) {
        let result = this.visit(ctx.lhs);
        if (ctx.rhs?.length) {
            ctx.rhs.forEach((rhs: any, index: number) => {
                const operator = ctx.MultiOperator[index];
                const rhsValue = this.visit(rhs);
                if (tokenMatcher(operator, Multiply)) {
                    result *= rhsValue;
                } else {
                    result /= rhsValue;
                }
            });
        }
        return result;
    }

    atomicExpression(ctx: any) {
        if (ctx.NumberLiteral) {
            return parseInt(ctx.NumberLiteral[0].image, 10);
        } else if (ctx.Age) {
            return 25;
        } else if (ctx.Salary) {
            return 100;
        } else if (ctx.parenthesisExpression) {
            return this.visit(ctx.parenthesisExpression);
        }
    }

    parenthesisExpression(ctx: any) {
        return this.visit(ctx.expression);
    }

    onKey(ctx: any) {
        queryOptions = {
            select: true,
            table: ctx.Identifier[0].image,
            aggregatePattern:[],
            filterPattern:[]
        };

        if (ctx.minExp) {

            ctx.minExp.forEach((minExp: any) => {
                let minExpOpts = this.visit(minExp);
                if (queryOptions.aggregatePattern) {
                    queryOptions.aggregatePattern.push(minExpOpts)
                }
            })

        }

        if (ctx.opt1) {
            ctx.opt1.forEach((option1:any)=>{
                const opts1 = this.visit(option1);
            })       
        }

        if (ctx.opt2) {
          
            ctx.opt2.forEach((option2:any)=>{
                const opts2 = this.visit(option2);
            }) 
        }
        if (ctx.checkarmsop) {
            const opts3 = this.visit(ctx.checkarmsop);
        }

        console.log('queryOptions -->', queryOptions);

        /**
          
        }
         */

        // prepare query like this `SELECT COUNT(Employee.EmployeeID) FROM Employee WHERE isActiveEmployee` from the above object

        // return generateQuery(queryOptions);
    }

    minimumExpressionIsRequired(ctx: any) {
        return this.visit(ctx.aggregateKey);
    }

    aggregateKey(ctx: any) {
        const aggregatePattern = {aggregatefunct: {}, aggregationColumn: null }
        if (ctx.Aggregate) {
            queryOptions['aggregate'] = true
            aggregatePattern['aggregatefunct'] = this.visit(ctx.aggregateFns)
        }
        if (ctx.LParen) {
            if (ctx.Identifier) {
                // need to check the identifier is presented in the table or not
                aggregatePattern['aggregationColumn'] = ctx.Identifier[0].image
            }
        }
        return aggregatePattern
    }


    checkArthmetics(ctx: any) {

        let operator = this.visit(ctx.checkOperator);
        if (ctx.NumberLiteral) {
            operator += parseInt(ctx.NumberLiteral[0].image, 10);
        }
        return operator
    }
    checkop(ctx: any) {
        let value = this.visit(ctx.checkOperator);
        console.log(value)

    }

    optionalRule(ctx: any) {
        if (ctx && Object.keys(ctx).length === 0) return null;

      
        if (ctx.filterByFn) {
            queryOptions['where'] = true;
            const pattern = this.visit(ctx.filterByFn);
            queryOptions['filterPattern'].push(pattern)
          
        }

        if (ctx.validUntilKey) {
            queryOptions['ValidUntil'] = true;
            this.visit(ctx.validUntilKey);
        }

        return 'Success';
    }

    validUntilKey(ctx: any) {
        return { validUntilOpts: null };
    }

    filterByFn(ctx: any) {
        queryOptions['filter'] =  true
        let opts = { name: null, operator: '' };
        if (ctx.Identifier?.length) {
            opts = {
                name: ctx.Identifier[0].image,
                operator: '='
            }
            // TODO: check identifier is available in the database

        }
        return opts;
    }

    aggregation(ctx: any) {
        const aggregateOpts = this.visit(ctx.aggregateFns);
        const aggregationColumn = ctx.Identifier[0].image;
        return { aggregateOpts, aggregate: true, aggregationColumn };
    }

    aggregateFns(ctx: any) {
        const aggregateFnsOpts = { count: false, sum: false, max: false, min: false, avg: false };
        if (ctx.Count) {
            aggregateFnsOpts.count = true;
        } else if (ctx.Sum) {
            aggregateFnsOpts.sum = true;
        } else if (ctx.Max) {
            aggregateFnsOpts.max = true;
        } else if (ctx.Min) {
            aggregateFnsOpts.min = true;
        } else if (ctx.Avg) {
            aggregateFnsOpts.avg = true;
        }

        return aggregateFnsOpts;
    }
}

/**
 * Tokenize the input string
 * @param input
 * @returns { error: string | null; tokens: any }
 */
export function tokenizeInput(input: string) {
    const lexerResult = lexer.tokenize(input);
    // console.log('lexerResult -->', lexerResult);
    if (lexerResult.errors.length > 0) {
        return { error: lexerResult.errors[0].message, tokens: null };
    }
    return { error: null, tokens: lexerResult.tokens };
}

/**
 *  Parse the tokens
 * @param tokens
 * @returns { error: string | null; cst: any }
 */
export function parseTokens(tokens: any) {
    parser.input = tokens;
    const cst = parser.expression();

    if (parser.errors.length > 0) {
        return { error: parser.errors[0].message, cst: null };
    }
    return { error: 'Valid Formula', cst: cst };
}

/**
 * Visit the CST
 * @param cst
 * @returns  { error: string | null; value: number | null }
 */
export function visitCst(cst: any) {
    const visitor = new ArithmeticCstVisitor();
    const value = visitor.visit(cst);
    return { error: null, value: value };
}

/**
 * Evaluate the arithmetic expression
 * @param input
 * @returns
 */
export function evaluateArithmeticExpression(input: string) {
    const response: { error: string | null; value: number | null } = { error: null, value: null };

    const lexerResult = tokenizeInput(input);
    // console.log('lexerResult -->: ', lexerResult);
    if (lexerResult.error) {
        response.error = lexerResult.error;
        return response;
    }

    const parserResult = parseTokens(lexerResult.tokens);
    // console.log('parserResult -->: ', parserResult);
    if (parserResult.error) {
        response.error = parserResult.error;
        return response;
    }

    const visitorResult = visitCst(parserResult.cst);
    if (visitorResult.error) {
        response.error = visitorResult.error;
        return response;
    }

    console.log('visitorResult -->: ', visitorResult);
    response.value = visitorResult.value;
    return response;
}

// function generateQuery(queryOpts: IQueryOptions) {
//     let query = '';

//     if (queryOpts.select) {
//         query += 'SELECT ';

//         if (queryOpts?.aggregateOpts?.count) {
//             query += `COUNT(${queryOpts.aggregationColumn}) `;
//         }
//     }

//     if (queryOpts.table) {
//         query += `FROM ${queryOpts.table} `;
//     }

//     if (queryOpts.where) {
//         query += `WHERE ${queryOpts?.whereOpts?.identifier}`;
//     }

//     return query;
// }