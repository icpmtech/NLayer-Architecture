export class AppError {
    constructor(
        public userMessage: string,
        public serverError: any,
        public clientError: Error) {
    }
}