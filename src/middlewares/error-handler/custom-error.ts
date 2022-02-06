export abstract class CustomError extends Error {
  abstract statusCode: number;

  constructor(message: string) {
    super(message);

    // Javascript's built-in class Error breaks the prototype chain
    // in TS 2.2, we can restore prototype chain by writing the code below
    // see more detail on TS 2.2 - Support for new.target
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  // define the common structure of all the error response here,
  // and the sub-custom-class to implement it
  abstract serializeErrors(): { message: string; field?: string }[];
}

/*
    // always send the data with consistent structure in the entire app
    // so that the React can handle this data in the same way
    
    // The common respone structure for error in the entire app 
      {
        errors: {message: string, field?: string}[]    // an object array as the value of errors
      }
    
    */
