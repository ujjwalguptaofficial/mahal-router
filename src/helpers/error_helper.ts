import { ERROR_TYPE } from "../enums";
import { IError } from "../interfaces";

export class ErrorHelper {
    message: string;
    type: ERROR_TYPE;
    constructor(type: ERROR_TYPE, info?) {
        this.type = type;
        this.message = this.getMsg_(info);
    }

    throw() {
        throw this.get();
    }

    get() {
        return {
            message: this.message,
            type: this.type
        } as IError;
    }

    private getMsg_(info) {
        switch (this.type) {
            case ERROR_TYPE.NavigationAborted:
                return `navigation aborted from "${info.from}", to "${info.from}"`;
            case ERROR_TYPE.NavigationCancelled:
                return `navigation cancelled from "${info.from}", to "${info.from}" with a new navigation "info.path".`;
            case ERROR_TYPE.SameRoute:
                return `navigation cancalled because of same route.`
        }
    }
}