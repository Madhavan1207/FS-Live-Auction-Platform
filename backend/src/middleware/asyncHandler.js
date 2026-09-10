// Express 4 doesn't catch rejected promises from async route handlers on
// its own — an error thrown inside an `async function` controller would
// otherwise just hang the request. Wrapping each handler with this at the
// route level forwards any rejection to the centralized error handler in
// app.js via next(err).
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
