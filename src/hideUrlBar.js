const getScrollTop = () => {
  const scrollTop = window.pageYOffset ||
  document.compatMode === "CSS1Compat" && document.documentElement.scrollTop ||
  document.body.scrollTop || 0;
  return scrollTop === 1 ? 0 : 1;
}

const hideUrlBar = () => {
  if ( !window.location.hash && window.addEventListener ){
    window.addEventListener( "load",function() {
        setTimeout(function(){
            window.scrollTo(0, getScrollTop());
        }, 0);
    });
  }
}

export default hideUrlBar;
