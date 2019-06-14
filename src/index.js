import './styles/index.scss';
import { allPreviews } from './assets/images';
import Router from './router';
import debounce from './utils/debounce';
import throttle from './utils/throttle';
import ContactPageTemplate from './templates/ContactPageTemplate.html';
import MainPageTemplate from './templates/MainPageTemplate.html';
import WorksPageTemplate from './templates/WorksPageTemplate.html';
import listenTouchSwipe from './touchSwipe';
import fixVhUnits from './fixVhUnits';
import { allTiny } from './assets/images';

var mainElement = document.querySelector('main');
var canvas = document.querySelector('.animation-block');
var btnWrapper = document.querySelector('.btn-float-container');
var listeners = [];
var isTouchDevice = false;

if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
  isTouchDevice = true;
}

document.body.classList.add(window.isDesktop ? 'desktop' : 'mobile');

fixVhUnits();

//===========FUNDAMENTAL ADD ELEMENTS FUNCTION================//
var addElement = function(newContent, classList, container) {
  var div = document.createElement('div');//create div for page container
  div.className = classList;//too avoid replacing whole content of <main> tag
  div.innerHTML = newContent;//at one time
  var parent = container || mainElement;
  parent.appendChild(div);
};


var pageAnimationInit = function(oldRoute, transClass) {
  if(transClass) {
    animateRoute(oldRoute, transClass);
  } else {
    Router.isTrainsition = false; // if we don't need tranistion
  }
}

if (!window.turnOnRAF) {
  window.turnOnRAF = () => {}
  window.turnOffRAF = () => {}
}

var handlerMainPage = function(oldRoute, transClass) {
    addElement(MainPageTemplate, "page main-page " + transClass);
    pageAnimationInit(oldRoute, transClass);
    window.turnOnRAF();
    // NOTE: turnOnRAF/turnOffRAF is property of window because it shouldn't be imported into this file,
    // it should be loaded as totally apart part 
    canvas.classList.toggle('active');
    btnWrapper.classList.toggle('active');
}

var willUnmountMainPage = function() {
    if (window.removeSvgInfo) { // if doesn't exists/ it means that svg was removed by itself
      window.removeSvgInfo() // remove svg info "rotate device" / "for mroe fun check on mobile"
    }
    window.turnOffRAF();
    canvas.classList.toggle('active');
    btnWrapper.classList.toggle('active');
}

var listOfDigits = [
  { viewBox: '0 0 72.3 187.5', color1: 'ff0000', color2: '0000ff', points: '8.8,77.7 58.8,27.7 58.8,186.7' },
  { viewBox: '0 0 124.5 185.5', color1: '00ffff', color2: '0000ff', d: 'M17.8,56.4C17.8,31.9,37.6,12,62.1,12s43.1,19.9,44.4,44.4c0.9,18.5-23.6,42.7-40.9,66.5c-13.6,18.8-25.9,33.2-39.5,49.9h98' },
  { viewBox: '0 0 124.5 183.5', color1: 'df3b82', color2: '6517c1', d: 'M22,12.5h69L48,72h14.5c27.3,0,49.5,22.2,49.5,49.5S89.8,171,62.5,171S13,148.8,13,121.5' },
  { viewBox: '0 0 97 188.5', color1: 'ffff00', color2: 'a01506', points: '71,5 18.5,133.5 84.5,133.5 84.5,188' },
  { viewBox: '0 0 127 193', color1: 'ffab80', color2: '482071', d: 'M100,12H29v67h35c28.2,0,51,22.8,51,51s-22.8,51-51,51s-51-22.8-51-51' },
  { viewBox: '0 0 127 196.5', color1: 'ffd100', color2: 'ff0000', d: 'M83.4,86.5c18.3,7.7,31.1,25.9,31.1,47c0,28.2-22.8,51-51,51s-51-22.8-51-51c0-6.2,1.1-12.2,3.2-17.7l0.8-2.3l55-108' },
  { viewBox: '0 0 118.5 195', color1: 'ff3861', color2: '44c5f2', points: '0,12 98,12 14,189' },
  { viewBox: '0 0 126.5 207', color1: '00ccff', color2: '55dd00', d: 'M40.6,61.5c-6.1-6.1-11-16.5-9.2-25.2c3.4-16.8,18-26.6,34.9-23.7c16.9,3,28.1,19,25.2,35.9c-2.2,12.7-14.2,19.4-23.3,26.8l-33.8,28.7c-10.6,10.3-19.6,18.5-21.4,34.1c-3.2,28,16.9,53.3,44.9,56.5c28,3.2,53.3-16.9,56.5-44.9c2.4-21-15.6-33.3-29.6-47.6' },
  { viewBox: '0 0 127 207', color1: '85dcd1', color2: '00318c', d: 'M43.9,110c-18.3-7.7-31.1-25.9-31.1-47c0-28.2,22.8-51,51-51s51,22.8,51,51c0,6.2-1.1,12.2-3.2,17.7l-0.8,2.3L51.8,201.1' },
];

var createSingleWorkPreview = function(preview, index) {
  var id = index + 1;
  var digitDetails = listOfDigits[index];
  var tagName = digitDetails.points ? 'polyline' : 'path';
  var propName = digitDetails.points ? 'points' : 'd';
  return '<li class="preview-'+id+' works-page__list-item" data-preview="'+id+'"><svg class="gradient-digit" xmlns="http://www.w3.org/2000/svg" viewBox="'+digitDetails.viewBox+'"><defs><linearGradient id="gradient'+id+'" x1="80%" y1="0%" x2="20%" y2="100%"><stop offset="0%" stop-color="#'+digitDetails.color1+'" /><stop offset="100%" stop-color="#'+digitDetails.color2+'" /></linearGradient></defs><'+tagName+' '+propName+'="'+digitDetails[propName]+'" stroke="url(/works#gradient'+id+')"  /></svg><img src="'+preview+'"></li>'
}

var worksList = function() {
  return allTiny.map(createSingleWorkPreview).join('')
}

var handlerWorksPreview = function(oldRoute, transClass, id) {
  var workId = id ? parseInt(Router.removeSlashes(id)) : undefined;//currenty unnecessary
    if (workId > 0 && workId <= allTiny.length) {
      window.workID = workId
    }
    var WorkPageTempalteWithImages = WorksPageTemplate.replace('<WorksList>', worksList())
    addElement(WorkPageTempalteWithImages, "page works-page " + transClass);
    pageAnimationInit(oldRoute, transClass);
}

var hideActionPanel = function() {
    var element = mainElement.querySelector('.preview-modal__action-group');
    element.classList.add('deactivate');
    displayActionGroup = false;
}
var debounceHideAction = debounce(hideActionPanel, 2000)

var showActionPanel = function() {
    if(!displayActionGroup) {
        var element = mainElement.querySelector('.preview-modal__action-group');
        element.classList.remove('deactivate');
        displayActionGroup = true;
    }
    debounceHideAction();
}

var freezeTouch = function(e) {
    e.preventDefault();
};

var closePreview = function(event) {
    if(event.target.classList.contains('close-modal-action')) {
        mainElement.querySelector('.preview-modal').classList.add('modal-hidden');
        history.replaceState('works', null, '/works');
        if (isTouchDevice) {
            mainElement.querySelector('.page').removeEventListener("touchmove", freezeTouch, false);
        }
    }
}

var changePreview = function(event) {
    var diff;
    if(event.key) { //keyboard is source of event
        diff = event.key === 'ArrowLeft' ? -1 : (event.key === 'ArrowRight' ? 1 : 0);
        if(diff === 0) return;//is it wasn't left nor right arrow, then prevent changing preview
        var modalNode = mainElement.querySelector('.preview-modal');
        var modalIsHidden = modalNode ? modalNode.classList.contains('modal-hidden') : true;
        if(modalIsHidden) return;//if modal isn't currently visible
    } else {//soruce of event is click on awrrow
        diff = event.target.dataset.diff;
    }
    var newID = currentPreview + parseInt(diff);
    if(newID < 1) {
        newID = allPreviews.length;
    } else if(newID > allPreviews.length) {
        newID = 1;
    }
    showModal(newID);
    showActionPanel();
}

var currentPreview;
var displayActionGroup = false;
var isPreviewTransition = false;

var saveListener = function(element, type, handler) {
    mainElement.querySelector(element).addEventListener(type, handler);
    listeners.push({
        element: element,
        type: type,
        handler: handler
    });
}

var showModal = function(id) {
    if(isPreviewTransition) return;
    if (isTouchDevice) {
        mainElement.querySelector('.page').addEventListener("touchmove", freezeTouch, false);
    }

    var modal = mainElement.querySelector('.preview-modal');
    history.replaceState('works/'+id, null, '/works/' + id);
    
    if(modal) {
        var modalImg = modal.querySelector('.preview-modal__picture');
        if(modal.classList.contains('modal-hidden')) {
            modal.classList.remove('modal-hidden');

            const newImg = document.createElement('IMG');
            newImg.sizes = '(max-width: '+allPreviews[id-1].maxwidth+'px) 100vw, '+allPreviews[id-1].maxwidth+'px';
            newImg.srcset = allPreviews[id-1].srcset;
            newImg.src = allPreviews[id-1].src;
            newImg.classList.add('preview-modal__picture', 'animated');
            modal.insertBefore(newImg, modalImg);
            modal.removeChild(modalImg);


            
            // modalImg.sizes = '(max-width: '+allPreviews[id-1].maxwidth+'px) 100vw, '+allPreviews[id-1].maxwidth+'px';
            // modalImg.srcset = allPreviews[id-1].srcset;
            // modalImg.src = allPreviews[id-1].src;
        } else {
            isPreviewTransition = true;
            var movePreview = function() {
                newImg.removeEventListener('transitionend', movePreview);
                modal.classList.add('loader'); // display loader behind img
                modal.removeChild(modalImg);
                isPreviewTransition = false;
            }
            var direction;
            var calcDirection = currentPreview - id;
            if(calcDirection === allPreviews.length - 1) direction = 'right';
            else if(calcDirection === -(allPreviews.length - 1)) direction = 'left';
            else if(currentPreview < id) direction = 'right';
            else direction = 'left';

            // var newImg = modalImg.cloneNode(true);
            const newImg = document.createElement('IMG');
            newImg.sizes = '(max-width: '+allPreviews[id-1].maxwidth+'px) 100vw, '+allPreviews[id-1].maxwidth+'px';
            newImg.srcset = allPreviews[id-1].srcset;
            newImg.src = allPreviews[id-1].src;
            newImg.classList.add(direction, 'preview-modal__picture', 'animated');
            modal.insertBefore(newImg, modalImg.nextSibling);
            window.getComputedStyle(newImg).opacity;
            newImg.classList.remove(direction);
            var oppositeDirection = direction === 'left' ? 'right' : 'left';
            modalImg.classList.add(oppositeDirection);
            newImg.addEventListener('transitionend', movePreview);
            modal.classList.remove('loader');
        }
    } else {
        displayActionGroup = true;
        var newContent = '<img sizes="(max-width: '+allPreviews[id-1].maxwidth+'px) 100vw, '+allPreviews[id-1].maxwidth+'px" srcset="'+allPreviews[id-1].srcset+'" src="'+allPreviews[id-1].src+'" class="preview-modal__picture animated"/>\
                          <div class="preview-modal__action-group animated">\
                            <i class="preview-modal__close-btn close-modal-action no-selection"></i>\
                            <button class="preview-modal__btn preview-modal__btn--left no-selection" data-diff="-1"></button>\
                            <button class="preview-modal__btn preview-modal__btn--right no-selection" data-diff="1"></button>\
                          </div>';
        addElement(newContent, 'preview-modal modal-hidden close-modal-action animated', mainElement.querySelector('.wrapper'));
        modal = mainElement.querySelector('.preview-modal');

        window.getComputedStyle(modal).opacity;

        modal.classList.remove('modal-hidden');
        if (isTouchDevice) {
            var swipeListeners = listenTouchSwipe(modal, changePreview);
            for(var listener in swipeListeners) {
                listeners.push({
                    element: modal,
                    type: listener.type,
                    handler: listener.handler
                });
            }
        } else {
            saveListener('.preview-modal', 'mousemove', showActionPanel);
        }
        saveListener('.preview-modal', 'click', closePreview);
        saveListener('.preview-modal__btn--left', 'click', changePreview);
        saveListener('.preview-modal__btn--right', 'click', changePreview);
    }
    currentPreview = id;
}



var showTagsList = function() {
    mainElement.querySelector('.tags-list').classList.remove('tags-list--hidden');
}

var handlerContact = function(oldRoute, transClass) {
    var tags = [
        {color: '#0077c3', icon: '&#xe800;', text: 'TypeScript', link: 'https://webpack.js.org/'},
        {color: '#5190da', icon: '&#xe80c;', text: 'Webpack', link: 'https://webpack.js.org/'},
        {color: '#e91e63', icon: '&#xe808;', text: 'Pixi.js', link: 'http://www.pixijs.com/'},
        {color: '#137dbf', icon: '&#xe810;', text: 'WebGL', link: 'https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API', className: 'tags-list__tag--push-right'},
        {color: '#614de5', icon: '&#xe80f;', text: 'WebAssembly', link: 'https://webassembly.org/'},
        {color: '#45c3e4', icon: '&#xe809;', text: 'React', link: 'https://reactjs.org/'},
        {color: '#8558ce', icon: '&#xe80a;', text: 'Redux', link: 'https://redux.js.org/'},
        {color: '#e47617', icon: '&#xe804;', text: 'Illustrator', link: 'https://www.adobe.com/Illustrator‎', class: 'icon-tiny'},
        {color: '#5d4ec4', icon: '&#xe802;', text: 'Cinema 4D', link: 'https://www.maxon.net/en-gb/products/cinema-4d/overview/'},
        {color: '#00a1d6', icon: '&#xe807;', text: 'Photoshop', link: 'https://www.adobe.com/Photoshop', class: 'icon-tiny'},
    ]

    if (window.isMobile) {
      tags = [tags[1], tags[5], tags[6], tags[0], tags[4], tags[9], tags[7], tags[2], tags[3], tags[8]]
    }
    var getTags = function() {
        return tags.map( (tag, idx) => {
            var className = tag.className ? tag.className + ' tags-list__tag' : 'tags-list__tag';
            return '<li><a href="'+tag.link+'" class="'+className+'" target="_blank" rel="noopener noreferrer" style="transition-delay: '+(idx/10.0)+'s; color: '+tag.color+'"><span>'+tag.text+'</span><i class="icon'+(tag.class ? ' '+tag.class : '')+'">'+tag.icon+'</i></a></li>';
        }).join('');
    }

    addElement(ContactPageTemplate.replace('<tags>', getTags()), "page contact-page " + transClass);
    pageAnimationInit(oldRoute, transClass);
}


//=====================================================REMVOE ALL ARROW FUNCTIONS=============================================================

var addEventListeners = function() {
    if(Router.currentAddress.events && Router.currentAddress.events.length) {
        Router.currentAddress.events.map( event => {
            var element = (typeof event.element === 'string') ? document.querySelector(event.element) : event.element;
            element.addEventListener(event.type, event.handler);
            listeners.push(event);
        })
    }
}

var removeEventListeners = function() {
    if(listeners.length) {//remove all listeners of previous page
        listeners.map( event => {
            var element = (typeof event.element === 'string') ? document.querySelector(event.element) : event.element;
            element.removeEventListener(event.type, event.handler);
        });
        listeners = [];
    }
} 

var animateRoute = function(oldRoute, transClass) {
    removeEventListeners();
    var oldPage = mainElement.children.length === 2 ? mainElement.children[0] : undefined;
    var nextPage = mainElement.children.length === 2 ? mainElement.children[1] : mainElement.children[0];//get second child, which is next page to show
    var mounting = false;
    // oldRoute is routing object
    // oldPage is node element
    var onTransitionEnd = function(event) {
        // when first anamitaion finished
        if(!mounting && Router.currentAddress.mountedHandler) {//mouting variable to make sure to call only once mountedHandler
            Router.currentAddress.mountedHandler();
            mounting = true;
        }
        // when last animation finished
        if(event.target.classList.contains('delay-4')) {//in event.elapsedTime chrome involves delay, firefox doesn't
            nextPage.removeEventListener('transitionend', onTransitionEnd);
            //maybe we can add it to one element, not for whole page
            oldPage && mainElement.removeChild(oldPage);//first url doesn't have oldPage
            nextPage.classList.remove('to-stage');
            oldRoute && oldRoute.unmountedHandler && oldRoute.unmountedHandler();//first url doesn't have oldRoute
            //it user change route durgin tranistion, for example by back/forward button in browser
            Router.isTrainsition = false;
            var address = Router.getAddress();
            var match = address.match(Router.currentAddress.path);
            if(!match) { // when user clicked previous page button
                Router.navigate(address, true);
            } else {//is route is valid, add event listeners to elements
                addEventListeners();
            }
        }
    }
    nextPage.addEventListener('transitionend', onTransitionEnd);//page object doesn't have a "transition" properties in sass
    window.getComputedStyle(nextPage).opacity; // we neet to triger next reflow by reading one properties which need's calculate something by reflow
    oldPage && oldPage.classList.add(transClass === 'trans-right' ? 'trans-left' : 'trans-right');//it's caused by reflow isn't synchronicious
    nextPage.classList.add('to-stage');
    nextPage.classList.remove('trans-left', 'trans-right');
    oldRoute && oldRoute.willUnmountHandler && oldRoute.willUnmountHandler();
}

var showPreview = function(event) {
    var id = event.target.dataset.preview;
    if(id) {
        showModal(parseInt(id));
    }
}


//===================SETTING ROUTER=================//

var redirect = function() {
    if(!Router.isTrainsition) {
        Router.navigate(this);
    }
}

window.addEventListener('popstate', function(e) {
    if(!Router.isTrainsition) {
        Router.navigate(e.state || '/', true);
    }
});

var previewPos = [
    {y: 15, x: 26 },
    {y: 36, x: 51 },
    {y: 45, x: 15 },
    {y: 66, x: 66 },
    {y: 84, x: 25 },
    {y: 112, x: 48 },
    {y: 129, x: 13 },
    // {y: 154, x: 47 },
    // {y: 176, x: 13 },
];

// t: current time, b: begInnIng value, c: change In value, d: duration
var easeInQuad = function (t, b, c, d) {
    return -c *(t/=d)*(t-2) + b;
}

var scrollTo = function (element, currentTime, beginningValue, endValue, duration) {
    if (currentTime >= duration) return;
    setTimeout(function() {
        var newVal = easeInQuad(currentTime, beginningValue, endValue ,duration);
        element.scrollTop = newVal;
        scrollTo(element, currentTime += 10, beginningValue, endValue, duration);
    }, 10);
}

var findWorksNodes = function() {
    if(window.workID) showModal(window.workID);
}


var onScroll = function(e) {
  var scrollVal = e.target.scrollTop;
  var viewPortWidth = window.innerWidth / 100;
  var isMobileResolution = window.innerWidth < 768;
  var windowPartHeight = {
    start: window.innerHeight * 0.1,
    end: window.innerHeight * 0.75,
  }
  if (isMobileResolution) {
    windowPartHeight = {
      start: -window.innerHeight * 0.1,
      end: window.innerHeight * 0.85,
    }
  }
  for (var i = 0; i < previewPos.length; i++) {
      var previewElement = document.querySelector('.preview-' + (i + 1));
      previewElement.classList.remove('preview--active');
      var coordY = isMobileResolution
        ? 239 + (Math.min((window.innerWidth - 50), 400) * 0.57 + 80) * (i)
        : 239 + previewPos[i].y * viewPortWidth;
      if (windowPartHeight.start + scrollVal < coordY && coordY < windowPartHeight.end + scrollVal) {
          previewElement.classList.add('preview--active');
      }
  }
}

var scrollHandler = throttle(onScroll, 300);

var onMountedWorksPage = function() {
    onScroll({target: { scrollTop: 0 }});
    findWorksNodes();
    // Turn of sear
}

// NOTE: only if it's the mobile view
if (window.isMobile) {
  if (window.floatButtonClickHandler) { // it means that animation was laoded first, and window.floatButtonClickHandler = button node
    window.floatButtonClickHandler.addEventListener('click', redirect.bind('/works'));
  } else {
    window.floatButtonClickHandler = redirect.bind('/works')
  }
}

Router.routes = [
    {
        name: 'MAIN',
        path: /^$/,
        index: 2,
        initHandler: handlerMainPage,
        events: [
            {
                element: '.works-link',
                type: 'click',
                handler: redirect.bind('/works')
            },
            {
                element: '.contact-link',
                type: 'click',
                handler: redirect.bind('/about')
            },
            {
                element: '.btn-desktop',
                type: 'click',
                handler: redirect.bind('/works')
            },
        ],
        willUnmountHandler: willUnmountMainPage
        // unmountedHandler: unmountMainPage
    },
    {
        name: 'WORKS',
        path: /^works(\/(\d{1,2}))?$/,
        index: 1,
        initHandler: handlerWorksPreview,
        mountedHandler: onMountedWorksPage,
        events: [
            {
                element: '.previews-list',
                type: 'click',
                handler: showPreview
            },
            {
                element: '.works-page',
                type: 'scroll',
                handler: scrollHandler
            },
            {
                element: '.main-page-link',
                type: 'click',
                handler: redirect.bind('/')
            },
            {
                element: '.contact-link',
                type: 'click',
                handler: redirect.bind('/about')
            },
            {
                element: document,
                type: 'keydown',
                handler: changePreview
            },
            
        ]
    },
    {
        name: 'ABOUT',
        path: /^about$/,
        index: 0,
        initHandler: handlerContact,
        mountedHandler: showTagsList,
        events: [
            {
                element: '.main-page-link',
                type: 'click',
                handler: redirect.bind('/')
            },
            {
                element: '.works-link',
                type: 'click',
                handler: redirect.bind('/works')
            }
        ]
    }
];

var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)
var isChromeOrSafari = isChrome || isSafari

// Init page and hdie laoder when all styles will be loaded

function checkStyleIsLoaded(name) { // "/index.css"
  if (!isChromeOrSafari) {
    return true; // Firefox doesn't allow you to read 'cssRules' property
  }
  for (var i = 0; i < document.styleSheets.length; i++) {
    if (document.styleSheets[i].href && document.styleSheets[i].href.match(name)) {
        if (document.styleSheets[i].cssRules.length == 0) {
            return false
        } else {
          return true;
        }
    }
  }
}

function initPage() {
  Router.initialize();
  var loaderNode = document.querySelector('.init-loader')
  loaderNode.classList.remove('anim')
  setTimeout(
    function(){
      document.body.removeChild(loaderNode)
    },
    1000
  )
}
var checkStylesWereLoaded = function(callback) {
  if (checkStyleIsLoaded('/index.css')) {
    if (window.isDesktop) {
      if (checkStyleIsLoaded('/index-desktop.css')) {
        initPage()
        callback()
      }
    } else {
      if (window.location.pathname === '/') { // if user is on main page
        if (window.isMobileAnimationLoaded) { // check if aniamtion was laoded
          initPage()
          callback()
        }
      } else { // if not on main page, then run page (animation is not needed)
        initPage()
        callback()
      }
    }
  }
}

var stylesWereLoader = false
checkStylesWereLoaded(
  function() {
    stylesWereLoader = true
  }
)

var intervalId = null
if (!stylesWereLoader) { // if styles werent laoded, then setInterval
  intervalId = window.setInterval(function() { // laoded styles doesn't fire any event on some browser (chrome safari)
    checkStylesWereLoaded(function() {
      window.clearInterval(intervalId)
    })
  }, 300)
}

window.isMainBundleLoader = true
