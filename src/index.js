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

var mainElement = document.querySelector('main');
var canvas = document.querySelector('.animation-block');
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

if (!window.toggleRFA) {
  window.toggleRFA = () => {}
}

var handlerMainPage = function(oldRoute, transClass) {
    addElement(MainPageTemplate, "page main-page " + transClass);
    pageAnimationInit(oldRoute, transClass);
    window.toggleRFA();
    // NOTE: toggleRFA is property of window because it shouldn't be imported into this file,
    // it should be loaded as totally apart part 
    canvas.classList.toggle('active');
}

var willUnmountMainPage = function() {
    window.toggleRFA();
    canvas.classList.toggle('active');
}

var handlerWorksPreview = function(oldRoute, transClass, id) {
    window.workID = id ? parseInt(Router.removeSlashes(id)) : undefined;//currenty unnecessary
    addElement(WorksPageTemplate, "page works-page " + transClass);
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
                            <i class="preview-modal__close-btn close-modal-action"></i>\
                            <button class="preview-modal__btn preview-modal__btn--left" data-diff="-1"></button>\
                            <button class="preview-modal__btn preview-modal__btn--right" data-diff="1"></button>\
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
        {color: '#5190da', icon: '&#xe80c;', text: 'Webpack', link: 'https://webpack.js.org/'},
        {color: '#e91e63', icon: '&#xe808;', text: 'Pixi.js', link: 'http://www.pixijs.com/'},
        {color: '#2886af', icon: '&#xe801;', text: 'Babylon', link: 'https://www.babylonjs.com/'},
        null,
        {color: '#45c3e4', icon: '&#xe809;', text: 'React', link: 'https://reactjs.org/'},
        {color: '#8558ce', icon: '&#xe80a;', text: 'Redux', link: 'https://redux.js.org/'},
        {color: '#e5712f', icon: '&#xe806;', text: 'Mobx', link: 'https://github.com/mobxjs/mobx'},
        {color: '#24a775', icon: '&#xe80b;', text: 'Vue', link: 'https://vuejs.org/'},
        null,
        {color: '#e47617', icon: '&#xe804;', text: 'Illustrator', link: 'https://www.adobe.com/Illustrator‎', class: 'icon-tiny'},
        {color: '#5d4ec4', icon: '&#xe802;', text: 'Cinema 4D', link: 'https://www.maxon.net/en-gb/products/cinema-4d/overview/'},
        {color: '#00a1d6', icon: '&#xe807;', text: 'Photoshop', link: 'https://www.adobe.com/Photoshop', class: 'icon-tiny'},
        {color: '#2d97fb', icon: '&#xe800;', text: 'Affinity Designer', link: 'https://affinity.serif.com/en-gb/'},
    ]
    var getTags = function() {
        return tags.map( (tag, idx) => {
            if(!tag) return '<li class="tags-list__space"></li>'
            return '<li><a href="'+tag.link+'" class="tags-list__tag" target="_blank" rel="noopener noreferrer" style="transition-delay: '+(idx/10.0)+'s; color: '+tag.color+'"><span>'+tag.text+'</span><i class="icon'+(tag.class ? ' '+tag.class : '')+'">'+tag.icon+'</i></a></li>';
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
    // {y: 5, x: 45 },
    {y: 15, x: 26 },
    {y: 36, x: 51 },
    {y: 45, x: 15 },
    {y: 66, x: 66 },
    {y: 84, x: 25 },
    {y: 112, x: 48 },
    {y: 129, x: 13 },
    {y: 154, x: 47 },
    {y: 176, x: 13 },
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
        end: window.innerHeight * (isMobileResolution ? 1.1 : 0.65),
    }
    for(var i = 0; i < previewPos.length; i++) {
        var previewElement = document.querySelector('.preview-' + (i + 1));
        previewElement.classList.remove('preview--active');
        var offsetY = (isMobileResolution ?
            i * (window.innerWidth * 0.494 + 80) + 315 :
            previewPos[i].y * viewPortWidth)
            - scrollVal + 85;
        if (windowPartHeight.start < offsetY && offsetY < windowPartHeight.end) {
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
  window.floatButtonClickHandler = redirect.bind('/works')
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
                element: '.btn-tablet',
                type: 'click',
                handler: redirect.bind('/works')
            },
            // {
            //     element: '.link',
            //     type: 'click',
            //     handler: redirect.bind('/about')
            // }
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

Router.initialize();
