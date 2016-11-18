export default (req,  res, next) => {
  //console.log(req.header, req.headers.user, req.headers.user === 'admin' );
  if (req.headers.user === 'admin') {
    return next();
  }
  return next('access error');
};
