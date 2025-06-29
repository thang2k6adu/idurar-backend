/*
  Catch Error Handler

  With async/await, you need some way to catch errors
  Instead of using try catch in each controller, we wrap the function in
  catchError(), catch any errors they throw and pass it along to our express middleware with next

 */