const logger = {
  error: (message: string, data?: any) => {
    console.error(message, data);
  },
  warn: (message: string, data?: any) => {
    console.warn(message, data);
  },
  info: (message: string, data?: any) => {
    console.info(message, data);
  },
  debug: (message: string, data?: any) => {
    console.debug(message, data);
  }
};

export default logger; 