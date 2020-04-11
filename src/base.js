export class BaseError extends Error {

}

export class BaseGateway {
    /**
     * @type {Container}
     */
    container = null;

    /**
     * @param container {Container}
     */
    constructor(container) {
      this.container = container;
    }
}

export class BaseResponse {
    /**
     * @type {BaseError}
     */
    error = null;
}

export class BaseRequest {

}

export class BaseUseCase {
    /**
     * @type {Container}
     */
    container = null;

    /**
     * @param container {Container}
     */
    constructor(container) {
      this.container = container;
    }
}
