export class BaseHandler {
    constructor(selector, e) {
        this.jsonContextElement = $('#context-data');
        this.selector = selector;
        this.e = e;
    }

    assignEvent(event) {
        event.target = event.target.closest(this.selector);
        return event;
    }

    parseJsonContext() {
        try {
            var jsonContext = JSON.parse(this.jsonContextElement.text());
            if (jsonContext.length === 0)
                throw new Error('Context is empty.');
            return jsonContext;
        } catch (err) {
            console.error(`App context is unavailable: ${err}`);
        }
    }

    setJsonContext(updates) {
        var scriptElement = $('#context-data');
        console.log(`UPDATES: ${updates}`)
        if (scriptElement.length === 0) {
            console.error('Element with id "context-data" not found.');
            return;
        }
        var contextData;
        try {
            contextData = JSON.parse(scriptElement.text());
        } catch (e) {
            console.error('Error parsing JSON content:', e);
            return;
        }
        $.extend(true, contextData, updates);
        var updatedJson = JSON.stringify(contextData);
        scriptElement.text(updatedJson);
    }

    _getElement() {
        this.element = $(this.selector);
    }

    setupEventHandler() {
        this._getElement();
        this._setupEventHandler();
    }

    // Abstract methods
    eventHandler(event) {
        throw new Error('Abstract method must be implemented.');
    }

    _setupEventHandler() {
        throw new Error('Abstract method must be implemented.');
    }
}


export class BaseDefaultEventHandler extends BaseHandler {
    constructor(selector, e) {
        super(selector, e);
    }

    _setupEventHandler() {
        var self = this;
        $(this.element).on(this.e, (event) => {
            event = self.assignEvent(event);
            self.eventHandler(event);
        });
    }

    // Abstract methods
    eventHandler(event) {
        throw new Error('Abstract method must be implemented.');
    }
}


export class BaseGETEventHandler extends BaseHandler {
    constructor(selector, e) {
        super(selector, e);
    }

    _setupEventHandler() {
        var self = this;
        $(this.element).on(this.e, (event) => {
            event.preventDefault();
            event = self.assignEvent(event);
            self.eventHandler(event);
        });
    }

    // Abstract methods
    eventHandler(event) {
        throw new Error('Abstract method must be implemented.');
    }
}


export class BasePOSTEventHandler extends BaseHandler {
    constructor(selector, e) {
        super(selector, e);
    }

    serializeData(context) {
        var formData = new FormData();
        for (let key in context) {
            if (context.hasOwnProperty(key)) {
                formData.append(key, context[key]);
            }
        }
        let isEmpty = true;
        for (let pair of formData.entries()) {
            isEmpty = false;
            break;
        }
        if (isEmpty) {
            throw new Error('FormData is empty.');
        }
        return formData;
    }

    _setupEventHandler() {
        var self = this;
        $(this.element).on(this.e, (event) => {
            event.preventDefault();
            event = self.assignEvent(event);
            var context = self.getContextData(event);
            var data = self.serializeData(context);
            var endpoint = self.getEndpoint();
            self.eventHandler(event, data, endpoint);
        });
    }

    // Abstract methods
    getContextData(event) {
        throw new Error('Abstract method must be implemented.');
    }

    eventHandler(event, data, endpoint) {
        throw new Error('Abstract method must be implemented.');
    }

    getEndpoint() {
        throw new Error('Abstract method must be implemented.');
    }
}

export class BaseDocumentEventHandler extends BaseHandler {
    constructor(e) {
        var selector = document;
        super(selector, e);
    }

    _setupEventHandler() {
        $(selector).on(this.e, event => {
            this.eventHandler(event);
        });
    }
}


export class BaseFormEventHandler extends BasePOSTEventHandler {
    constructor(selector) {
        super(selector, 'submit');
    }

    getContextData(event) {
        const formData = new FormData(event.target);
        return formData;
    }

    serializeData(context) {
        var formData = context;
        let isEmpty = true;
        for (let pair of formData.entries()) {
            isEmpty = false;
            break;
        }
        if (isEmpty) {
            throw new Error('FormData is empty.');
        }
        return formData;
    }

    eventHandler(event, data, endpoint) {
        $.ajax({
            url: endpoint,
            type: "POST",
            dataType: "JSON",
            processData: false,
            contentType: false,
            data: data,
            success: data => { this.success(data) },
            error: data => this.error(data)
        });
    }

    // Abstract method
    success(data) {
        throw new Error('Abstract method must be implemented.');
    }
    error(data) {
        console.error(data);
    }
}


export class BaseDocumentReadyHandler extends BaseDocumentEventHandler {
    constructor() {
        super('ready');
    }

    _setupEventHandler() {
        var self = this;
        $(this.element).ready((event) => {
            self.eventHandler();
        });
    }

    // Abstract method
    eventHandler() {
        throw new Error('Abstract method must be implemented.');
    }
}


export class BaseAbbreviatedEventHandler extends BaseHandler {
    constructor() {
        super('', '');
        this.selector = undefined;
        this.e = undefined;
    }

    setupEventHandler() {
        return undefined;
    }

    _setupEventHandler(event) {
        return undefined;
    }

    _getElement() {
        this.element = undefined;
    }
}

//* должен устанавливать хэндлер на документ и обработчик на 
