import ExtendableError from 'es6-error';
export declare class UnexpectedStateError extends ExtendableError {
    code: string;
    constructor(message: string, code?: string);
}
