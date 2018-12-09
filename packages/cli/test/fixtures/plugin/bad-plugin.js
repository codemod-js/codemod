module.exports = function() {
  return {
    visitor: {
      NumericLiteral(path) {
        throw new Error('I am a bad plugin');
      }
    }
  };
};
