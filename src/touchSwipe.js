function listenTouchSwipe(touchsurface, handleswipe){
  var swipedir,
  startX,
  distX,
  threshold = 75, //required min distance traveled to be considered swipe
  allowedTime = 500, // maximum time allowed to travel that distance
  elapsedTime,
  startTime;

    function handleTouchStart(e){
        var touchobj = e.changedTouches[0]
        swipedir = null
        startX = touchobj.pageX
        startTime = new Date().getTime() // record time when finger first makes contact with surface
        // e.preventDefault()
    }
  touchsurface.addEventListener('touchstart', handleTouchStart, false)

//     function handleTouchMove(e){
//         e.preventDefault() // prevent scrolling when inside DIV
//     }
//   touchsurface.addEventListener('touchmove', handleTouchMove, false)

    function handleTouchEnd(e){
        var touchobj = e.changedTouches[0]
        distX = touchobj.pageX - startX // get horizontal dist traveled by finger while in contact with surface
        elapsedTime = new Date().getTime() - startTime // get time elapsed
        if (elapsedTime <= allowedTime){ // first condition for awipe met
            if (Math.abs(distX) >= threshold){ // 2nd condition for horizontal swipe met
                swipedir = distX < 0 ? { key: 'ArrowRight' } : { key: 'ArrowLeft' };// if dist traveled is negative, it indicates left swipe
            }
        }
        swipedir && handleswipe(swipedir)
        // e.preventDefault()
    }
  touchsurface.addEventListener('touchend', handleTouchEnd, false)

  return [
    {type: 'touchstart', handler: handleTouchStart },
    // {type: 'touchmove', handler: handleTouchMove },
    {type: 'touchend', handler: handleTouchEnd },
  ];
}

export default listenTouchSwipe;