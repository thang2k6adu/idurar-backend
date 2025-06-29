/*
  Catch Error Handler

  With async/await, you need some way to catch errors
  Instead of using try catch in each controller, we wrap the function in
  catchError(), catch any errors they throw and pass it along to our express middleware with next

 */

export const catchErrors = (fn) => {
  //   Express tương thích với callback truyền thống (thời chưa có Promise), nên middleware function được định nghĩa như:
  // function(req, res, next) {
  //   // xử lý
  // }
  // Express không tự xem đó là Promise — nên nếu async function bị reject, lỗi bị bỏ qua.
  // So we wrap it in a function that returns a Promise
  return function (req, res, next) {
    return fn(req, res, next).catch((error) => {
      if (error.name == 'ValidationError') {
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Required fields are not supplied',
          controller: fn.name,
          error: error,
        })
      } else {
        // Server Error
        return res.status(500).json({
          success: false,
          result: null,
          message: error.message,
          controller: fn.name,
          error: error,
        })
      }
    })
  }
}

/*
  Not Found Error Handler

  If we hit a route that is not found, we mark it as 404 and pass it along to the next error handler to display
*/
export const notFound = (req, res, next) => {
  return res.status(404).json({
    success: false,
    message: 'Api url does not exist ',
  })
}

/*
  Development Error Handler

  In development we show good error messages so if we hit a syntax error or any other previously un-handled error, we can show good info on what happened
*/
export const developmentErrors = (error, req, res, next) => {
  error.stack = error.stack || ''
  const errorDetails = {
    message: error.message,
    status: error.status,
    stackHighlighted: error.stack.replace(
      /[a-z_-\d]+.js:\d+:\d+/gi,
      '<mark>$&</mark>'
    ),
  }

  return res.status(500).json({
    success: false,
    message: error.message,
    error: error,
  })
}

/*
  Production Error Handler

  No stacktraces are leaked to admin
*/
export const productionErrors = (error, req, res, next) => {
  return res.status(500).json({
    success: false,
    message: error.message,
    error: error,
  })
}
