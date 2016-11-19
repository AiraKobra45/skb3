function canonize (url){
  const re = new RegExp('@?(https?:)?(\/\/)?((\S*)[^\/]*\/)?([@_a-z0-9.]*)', 'i');
  var mat = url.match(re);
  //console.log(mat);
  const username = mat[5];

  if ( username.substring(0, 1) == '@' ) {
    return username;
  } else {
    return '@' + username;
  };
};
