/**
 * Async handler middleware to avoid try-catch blocks in controllers
 * @param {Function} fn Function to execute
 * @returns {Function} Express middleware function
 */
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
  
  module.exports = asyncHandler;