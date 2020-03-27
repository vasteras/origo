class ErrorHandler {
  constructor(options) {
    this.options = options;
  }
  check(...params) {
    const { options } = this;
    params.forEach((param) => {
      if (!(param in options)) {
        throw new Error(`Missing ${param} in options.`);
      }
    });
  }
}

export default ErrorHandler;
