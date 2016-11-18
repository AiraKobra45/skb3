export default (req,  res, next) => {
  if (req.headers.user === 'admin') {
    next();
  }
  next('access error');
};
