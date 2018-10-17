export default {
    routes: [],
    isTrainsition: false,
    currentAddress: undefined,//it's objects which descripe all properties abotu current location
    getAddress: function() {
        var fragment = this.removeSlashes(decodeURI(location.pathname + location.search))
        .replace(/\?(.*)$/, '')
        return this.removeSlashes(fragment);
    },
    removeSlashes: function(path) {
        return path.toString().replace(/\/$/, '').replace(/^\//, '');
    },
    /**
     * @param  {string} nextAddress
     * @param  {boolean|undefined} certain
     * @param  {boolean|undefined} browserAPI
     */
    initialize: function(nextAddress, certain, browserAPI) {//only on app start, it's mean when you type new address too!
        this.isTrainsition = true;
        var address = certain ? nextAddress : this.getAddress();//if address comes form click on button get it, if not, read from browser address
        for(var i=0; i<this.routes.length; i++) {
            var match = address.match(this.routes[i].path);
            if(match) {
                if(!browserAPI) {//const url it's necessary, when you click back/forward button in browser
                    history.pushState(address, null, '/' + address);
                }
                var nextPageClasses = '';
                //Because last time we perform transition only when url changes bu buttons
                // if(certain || browserAPI) {//it's comes from click, it means, we need to perfom transition
                    // 2=> this.routes.length / 2, average of indexes
                    var indexOld = this.currentAddress ? this.currentAddress.index : 2;
                    nextPageClasses = indexOld > this.routes[i].index ? 'trans-left' : 'trans-right';
                // }
                match[0] = nextPageClasses;//match[0] it's page name, for example "works/3", next elements is params, for example "3"
                match.unshift(this.currentAddress);//it's could be undefined, if it's first page
                //but if match[0] will be undefined, its means nextPageClasses it's also undefined
                this.currentAddress = this.routes[i];//set current page
                this.currentAddress.initHandler.apply({}, match);//run current page initialization
                // we pass argumens like this, because quantity of qrguments isn't constantly
                return;//to avoid transition to default page
            }           
        }
        this.navigateToDefault();
    },
    navigate: function(path, browserAPI) {
        path = this.removeSlashes(path);
        if(path.match(this.currentAddress.path)) return;//still the same page
        this.initialize(path, true, browserAPI);
    },
    navigateToDefault: function() {//here we dn't need naimation, because if url is nto valid, it's requal to that user typed new address
        //if new link is '', we should avoid pushState, beacuse now i correct link
        history.pushState(null, null, '/');//==============+TO DO: MAYBE BETTER REPLACE, NOT PUSH NEW STATE
        this.currentAddress = this.routes[0];
        this.currentAddress.initHandler(null, 'trans-right');
    },
};