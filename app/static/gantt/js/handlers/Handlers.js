import {
    BaseHandler,
    BaseDefaultEventHandler,
    BasePOSTEventHandler,
    BaseAbbreviatedEventHandler,
    BaseFormEventHandler,
    BaseDocumentReadyHandler,
} from './BaseHandlers.js';

export class ModalBackgroundEventHandler extends BaseDefaultEventHandler {
    constructor(eventType) {
        super('.js-modal-blur', eventType);
    }

    static addBlurHandler() {
        return new ModalBackgroundEventHandler('show.bs.modal');
    }

    static removeBlurHandler() {
        return new ModalBackgroundEventHandler('hide.bs.modal');
    }


    eventHandler = function(event) {
    const action = event.type === 'show.bs.modal' ? 'addClass' : 'removeClass';
    $('.js-main-container')[action]('blur-background');
};
}
/*
 ****************************
*/

// TODO: Implement classes for fields updating
class EditableEventHandler extends BaseAbbreviatedEventHandler {
    constructor() {
        super();
        this.dataFieldName = 'data-field';
        this.documentClickHandlerOn = false;
        this.currentEditingElement = undefined;
        this.endpoint = undefined;
    }

    setupDocumentClickEventHandler() {
        if (!this.documentClickHandlerOn) {
            this.documentClickHandlerOn = true;
            $(document).on('click', event => {
                if (this.currentEditingElement && !$.contains(this.currentEditingElement[0], event.target)) {
                    this.saveAndDisableEditing(this.currentEditingElement);
                    this.currentEditingElement = null;
                }
            });
        }
    }

    setupEventHandler() {
        this.setupDocumentClickEventHandler();
        const editableElement = $('.js-editable');
        $(editableElement).off('click');
        this.setupDocumentClickEventHandler();
        $(editableElement).on('click', event => {
            const target = event.target;
            event.stopPropagation(); // Остановка распространения события

            if (this.currentEditingElement && this.currentEditingElement[0] !== target) {
                this.saveAndDisableEditing(this.currentEditingElement);
            }

            $(target).attr('contenteditable', 'true').addClass('editing');
            this.currentEditingElement = $(target);

            // Помещаем курсор в конец текста
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(target);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        });
    }

    saveAndDisableEditing(element) {
        element.attr('contenteditable', 'false').removeClass('editing');
        this.endpoint = this.getEndpoint(element);
        const data = this.serializeData(element);
        this.sendPatchRequest(data, element);
    }

    getEndpoint(element) {
        const jsonContext = this.parseJsonContext();
        const projectId = jsonContext.project.id;
        let endpoint;
        const entity = $(element).attr('data-entity');
        if (entity === 'project') {
            endpoint = `api/v1/projects/${projectId}/`;
        } else if (entity === 'task') {
            const taskId = $(element).attr('data-entity-id');
            endpoint = `api/v1/projects/${projectId}/tasks/${taskId}/`;
        } else {
            throw new Error('Unexpected entity name');
        }
        return endpoint;
    }

    sendPatchRequest(data, element) {
        if (this.endpoint === undefined) {
            throw new Error('Endpoint must be defined');
        }
        const csrftoken = this.getCSRFToken();
        $.ajax({
            type: 'PATCH',
            url: this.endpoint,
            method: 'PATCH',
            contentType: 'application/json',
            beforeSend: xhr => {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            },
            data: JSON.stringify(Object.fromEntries(data)),
            success: data => this.success(data, element),
            error: data => console.error(data)
        });
    }

    success(data, element) {
        if ($(element).attr('data-entity') === 'project') {
        var abbriviatedProjectNameLoader = new AbbreviatedProjectNameLoader();
        abbriviatedProjectNameLoader.eventHandler(data);
        }
        element.attr('contenteditable', 'false').removeClass('editing');
        this.currentEditingElement = null;
    }

    serializeData(element) {
        const data = {};
        data[$(element).attr(this.dataFieldName)] = $(element).text();
        return Object.entries(data);
    }

    getCSRFToken() {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, 10) === 'csrftoken=') {
                    cookieValue = decodeURIComponent(cookie.substring(10));
                    break;
                }
            }
        }
        return cookieValue;
    }
}

class DropdownEditableEventHandler extends BaseAbbreviatedEventHandler {
    constructor() {
        super();
        this.dataFieldName = 'data-field';
        this.dataValueName = 'data-value';
        this.documentClickHandlerOn = false;
        this.currentEditingElement = undefined;
        this.endpoint = undefined;
    }

    setupDocumentClickEventHandler() {
        if (!this.documentClickHandlerOn) {
            this.documentClickHandlerOn = true;
            $(document).on('click', event => {
                if (this.currentEditingElement && !$.contains(this.currentEditingElement[0], event.target)) {
                    this.hideDropdown();
                }
            });
        }
    }

    hideDropdown() {
        $('.js-editable-dropdown').removeClass('show');
        this.currentEditingElement = null;
    }

    serializeData(element) {
        const data = {};
        data[$(element).attr(this.dataFieldName)] = $(element).attr(this.dataValueName);
        return Object.entries(data);
    }

    setupEventHandler() {
        this.setupDocumentClickEventHandler();
        const dropdownItem = $('.js-dropdown-field-item');
        $(dropdownItem).off('click');
        this.setupDocumentClickEventHandler();
        $(dropdownItem).on('click', event => {
            const target = event.target;
            event.stopPropagation();
            this.currentEditingElement = $(target);
            this.saveAndDisableEditing(this.currentEditingElement);
        });
    }

    saveAndDisableEditing(element) {
        var data = this.serializeData(element);
        this.endpoint = this.getEndpoint(element);
        this.sendPatchRequest(data, element);
    }

    getEndpoint(element) {
        const jsonContext = this.parseJsonContext();
        const projectId = jsonContext.project.id;
        let endpoint;
        const entity = $(element).attr('data-entity');
        if (entity === 'project') {
            endpoint = `api/v1/projects/${projectId}/`;
        } else if (entity === 'task') {
            const taskId = $(element).attr('data-entity-id');
            endpoint = `api/v1/projects/${projectId}/tasks/${taskId}/`;
        } else {
            throw new Error('Unexpected entity name');
        }
        return endpoint;
    }

    sendPatchRequest(data, element) {
        if (this.endpoint === undefined) {
            throw new Error('Endpoint must be defined');
        }
        const csrftoken = this.getCSRFToken();
        $.ajax({
            type: 'PATCH',
            url: this.endpoint,
            method: 'PATCH',
            contentType: 'application/json',
            beforeSend: xhr => {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            },
            data: JSON.stringify(Object.fromEntries(data)),
            success: data => this.success(data, element),
            error: data => console.error(data)
        });
    }

    success(data, element) {
        if ($(element).attr('data-entity') === 'project') {
            var projectStatusLoader = new AbbreviatedProjectStatusLoader();
            projectStatusLoader.eventHandler(data);
        }
        else if($(element).attr('data-entity') === 'task') {
            var jsonContext = this.parseJsonContext();
            var task_statuses = jsonContext.content.task_statuses;
            var targetTask = $(`.js-task-badge[data-task-id=${data.id}]`);
            if (!targetTask) {
                throw new Error('No task with specified id found');
            }
            targetTask.text(data.status).removeClass(Object.values(task_statuses).map(s => s.class).join(' '));
            targetTask.addClass(task_statuses[data.status]['class']);
        }
        this.hideDropdown();
    }

    getCSRFToken() {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, 10) === 'csrftoken=') {
                    cookieValue = decodeURIComponent(cookie.substring(10));
                    break;
                }
            }
        }
        return cookieValue;
    }
}



/*
 ****************************
*/

export class SyncScrollHandler extends BaseDefaultEventHandler {
    constructor(selector) {
        super(selector, 'scroll');
        this.scrollElements = $(selector);
    }

    eventHandler(event) {
        const { scrollTop, scrollLeft } = $(event.target);
        this.scrollElements.not(event.target).each(function() {
            $(this).scrollTop(scrollTop).scrollLeft(scrollLeft);
        });
    }
}

/*
 ****************************
*/

export class SingleFieldEventHandler extends BasePOSTEventHandler {
    constructor(endpoint) {
        super('.js-field-submit', endpoint, 'click submit');
        this.dataFieldName = 'data-field';
        this.dataFieldSubmitName = 'data-related';
    }

    eventHandler(event, data) {
        $(event.target).addClass('d-none');
        $('.js-editable').prop('contenteditable', false);
        console.debug(`SingleFieldEventHandler: ${event.target}, ${data}`);
    }

    getContextData(event) {
        const target = event.target;
        const fields = $(`.js-field[${this.dataFormName}="${$(target).attr(this.dataFormName)}"]`);
        const context = {};

        fields.each((_, field) => {
            const fieldName = $(field).attr(this.dataFieldName);
            if (!fieldName) {
                throw new Error('Data field is not defined.');
            }

            context[fieldName] = $(field).attr('value') || $(field).text() || null;
            if (context[fieldName] === null) {
                throw new Error('Context is not defined');
            }
        });

        return context;
    }
}


export class DocumentReadyContentLoader extends BaseDocumentReadyHandler {
    eventHandler() {
        var jsonContext = this.parseJsonContext();
        var projectId = jsonContext.project.id;
        if (!projectId) {
            $.ajax({
                url: '/api/v1/projects/',
                type: 'GET',
                dataType: 'JSON',
                success: (data) => {
                    const modalId = data.count > 0 ? '#modal-project-list' : '#modal-create-project';
                    $(modalId).modal({
                        backdrop: 'static',
                        keyboard: false,
                        show: true
                    });
                },
                error: (data) => {
                    console.error(data);
                }
            });
        }
        else {
            $.ajax({
                url: `/api/v1/projects/${projectId}/`,
                type: 'GET',
                dataType: 'JSON',
                success: (data) => {
                    var abbreviatedProjectLoader = new AbbreviatedProjectLoader(jsonContext.project.id);
                    abbreviatedProjectLoader.eventHandler(data);
                },
                error: (data) => {
                    console.error(data);
                }
            });
        }
    }
}

export class CreateProjectModalShowUpHandler extends BaseDefaultEventHandler {
    constructor() {
        super('#js-modal-btn-create-project', 'click');
    }

    eventHandler() {
        $('#modal-create-project').modal('hide');
        $('#modal-create-project').modal({
            backdrop: true,
            keyboard: true
        });
    }
}

/*
 ****************************
*/

export class ProjectListModalShowUpHandler extends BaseDefaultEventHandler {
    constructor() {
        super('#js-modal-btn-project-list', 'click');
    }

    eventHandler() {
        $('#modal-project-list').modal('hide');
        $('#modal-project-list').modal({
            backdrop: true,
            keyboard: true
        });
    }
}

/*
 ****************************
*/

// Depricated due to a bug blocking access to any input fields
// TODO: Fix it
/*
export class CancelEditableEventHandler extends BaseDocumentEventHandler {
    constructor() {
        super('mousedown');
    }

    eventHandler(event) {
        if (!$(event.target).closest('.js-editable, .js-btn-editable').length) {
            $('.js-btn-editable').addClass('d-none');
        }
    }
}
*/

/*
 ****************************
*/

export class CreateProjectEventHandler extends BaseFormEventHandler {
    constructor() {
        var selector = '.js-form-project';
        super(selector);
    }

    success(data) {
        const abbreviatedProjectLoader = new AbbreviatedProjectLoader(data.id);
        abbreviatedProjectLoader.eventHandler(data);
        $('#modal-create-project').modal('hide');
    }

    getEndpoint() {
        let endpoint = `/api/v1/projects/`;
        return endpoint;
    }
}

/*
 ****************************
*/

export class AddTaskEventHandler extends BaseFormEventHandler {
    constructor() {
        var selector = '.js-form-task';
        super(selector);
    }

    getEndpoint() {
        const jsonContext = this.parseJsonContext();
        const projectId = jsonContext.project.id;
        return `/api/v1/projects/${projectId}/tasks/`;
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

        if (formData.get('type') == 'milestone') {
            formData.append('end_datetime', formData.get('start_datetime'));
        }

        return formData;
    }

    success(data) {
        var gridLayoutTaskLoader = new GridLayoutTaskLoader();
        var editableEventHandler = new EditableEventHandler();
        var dropdownEditableEventHandler = new DropdownEditableEventHandler();
        gridLayoutTaskLoader.eventHandler().then(() => {
            editableEventHandler.setupEventHandler();
            dropdownEditableEventHandler.setupEventHandler();

        });
        $('#modal-create-task').modal('hide');
    }
}

export class AddMemberEventHandler extends BaseFormEventHandler {
    constructor() {
        var selector = '.js-form-member';
        super(selector);
    }

    getEndpoint() {
        const jsonContext = this.parseJsonContext();
        const projectId = jsonContext.project.id;
        return `/api/v1/projects/${projectId}/members/`;
    }

    success(data) {
        var abbreviatedNewMemberLoader = new AbbreviatedNewMemberLoader(data);
        abbreviatedNewMemberLoader.eventHandler();
    }
}

// Probably it's better to generalize it to Base class
export class RemoveMemberEventHandler extends BaseAbbreviatedEventHandler {
    constructor() {
        super();
    }

    eventHandler(event) {
        var target = event.target.closest('.js-member');
        var memeberId = $(target).attr('data-member-id');
        let jsonContext = this.parseJsonContext();
        var projectId = jsonContext.project.id;
        var endpoint = `/api/v1/projects/${projectId}/members/${memeberId}/`;
        var csrftoken = this.getCSRFToken();
        $.ajax({
            type: 'DELETE', 
            url: endpoint,
            beforeSend: function(xhr, settings) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            },
            success: () => this.success(),
            error: data => console.error(data)
        });
    }
    
    success() {
        var membersLoader = new MembersLoader();
        membersLoader.eventHandler();
    }

    getCSRFToken() {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, 10) === 'csrftoken=') {
                    cookieValue = decodeURIComponent(cookie.substring(10));
                    break;
                }
            }
        }
        return cookieValue;
    }
}  
/*
 ****************************
*/

/*
export class BaseAbbreviatedPATCHFieldUpdater() {
    constructor(selector, e) {
        super()
    }
}
*/

export class DocumentPATCHFieldUpdater extends BaseHandler {
    constructor() {
        super(document, 'click');
    }

    _setupEventHandler() {
        var self = this;
        $(this.element).on(this.e, event => {
            event = self.assignEvent(event);
            context = self.getContextData(event);

        });
    }

    getContextData() {
        
    }

    assignEvent(event) {
        return event;
    }
}



/*
 ****************************
*/
export class AbbreviatedNewTaskLoader extends BaseAbbreviatedEventHandler {
    constructor(task, dateObject) {
        super();
        this.task = task;
        this.dateObject = dateObject;
        this.chartLayoutContainer = $('.gantt-chart-container');
        this.gridLayoutContainer = $('.js-grid-layout-container');
        this.gridTableContainer = $('.js-grid-layout-table-container');
        var jsonContext = this.parseJsonContext();
        this.statuses = jsonContext.content.task_statuses;

        if (!this.task || !this.dateObject) {
            throw new Error('Some of the elements are undefined');
        }
        if (!this.chartLayoutContainer.length || !this.gridLayoutContainer.length || !this.gridTableContainer.length) {
            throw new Error('Elements are unavailable');
        }
    }
    

    calculateItemPosition(startDate, endDate, itemWidth) {
        const dateObject = this.dateObject;
        let startOffset = 0;
        let endOffset = 0;
        let startMonthFound = false;
        let endMonthFound = false;
    
        for (const monthObj of dateObject) {
            // Calculate start offset
            if (!startMonthFound) {
                if (monthObj.month === (startDate.getMonth() + 1) && monthObj.year === startDate.getFullYear()) {
                    startOffset += startDate.getDate() - 1;
                    startMonthFound = true;
                } else {
                    startOffset += monthObj.days;
                }
            }
    
            // Calculate end offset
            if (!endMonthFound) {
                if (monthObj.month === (endDate.getMonth() + 1) && monthObj.year === endDate.getFullYear()) {
                    endOffset += endDate.getDate() - 1;
                    endMonthFound = true;
                } else {
                    endOffset += monthObj.days;
                }
            }
    
            // Exit loop if both start and end offsets are found
            if (startMonthFound && endMonthFound) {
                break;
            }
        }
    
        const totalDays = endOffset - startOffset + 1;
        const width = totalDays * itemWidth;
        const leftPosition = startOffset * itemWidth;
    
        return [width, leftPosition];
    }
    
    

    getColor() {
        const r = Math.floor(127 + Math.random() * 128).toString(16).padStart(2, '0');
        const g = Math.floor(127 + Math.random() * 128).toString(16).padStart(2, '0');
        const b = Math.floor(127 + Math.random() * 128).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    }

    renderTaskRow() {
        this.renderTableTaskRow();
        this.renderChartTaskRow();
    }

    renderTableTaskRow() {
        const task = this.task;
        var tableRow = $('<div>');
        var tableTaskCol = $('<div>');
        var tableAssigneeCol = $('<div>');
        var tableStatusCol = $('<div>');
        var statusDropdownMenu = $('<div>');
        var statusInProgressItem = $('<span>').text('in progress');
        var statusOpenItem = $('<span>').text('open');
        var statusClosedItem = $('<span>').text('closed');
        var statusDoneItem = $('<span>').text('done');
        var tableBadgeStatus = $('<div>');
        var tableStartDateCol = $('<div>');
        var tableEndDateCol = $('<div>');
    
        
        if (task.type == 'task') {
            tableRow.addClass('chart-table__task-row task-row').attr('data-task-id', task.id);
            tableTaskCol.addClass('table-row__item col-md-4 js-task-col-name js-editable').attr({'data-entity-id': task.id, 'data-field': 'name', 'data-entity': 'task'}).text(task.name);
            tableAssigneeCol.addClass('table-row__item col-md-3 js-task-col-assignee').text(task.assignees.length > 0 ? task.assignees.join(', ') : 'Не назначен');
            tableStatusCol.addClass('table-row__item col-md-2 js-task-col-status js-dropdown-field').attr({'data-toggle': 'dropdown'});
            tableBadgeStatus.addClass('badge p-1 js-task-badge').text(task.status).addClass(this.statuses[task.status]['class']).attr('data-task-id', task.id);
            statusDropdownMenu.addClass('dropdown-menu js-editable-dropdown dropdown-menu-task');
            statusInProgressItem.addClass('badge badge-warning js-dropdown-field-item').attr({'data-field': 'status', 'data-entity': 'task', 'data-value': 'in progress', 'data-entity-id': task.id});
            statusOpenItem.addClass('badge badge-primary js-dropdown-field-item').attr({'data-field': 'status', 'data-entity': 'task', 'data-value': 'open', 'data-entity-id': task.id});
            statusClosedItem.addClass('badge badge-dark js-dropdown-field-item').attr({'data-field': 'status', 'data-entity': 'task', 'data-value': 'closed', 'data-entity-id': task.id});
            statusDoneItem.addClass('badge badge-success js-dropdown-field-item').attr({'data-field': 'status', 'data-entity': 'task', 'data-value': 'done', 'data-entity-id': task.id});
            statusDropdownMenu.append([statusInProgressItem, statusOpenItem, statusDoneItem, statusClosedItem]);
            $(tableStatusCol).append(tableBadgeStatus);
            tableStatusCol.append(statusDropdownMenu);
            tableStartDateCol.addClass('table-row__item col js-task-col-start-datetime').attr({'data-entity-id': task.id, 'data-field': 'start_datetime', 'data-entity': 'task'}).text(new Date(task.start_datetime).toISOString().split('T')[0]);
            tableEndDateCol.addClass('table-row__item col js-task-col-end-datetime').attr({'data-entity-id': task.id, 'data-field': 'end_datetime', 'data-entity': 'task'}).text(new Date(task.end_datetime).toISOString().split('T')[0]);
        }
        else if (task.type == 'milestone') {
            tableRow.addClass('chart-table__task-row task-row').attr('data-task-id', task.id);
            tableTaskCol.addClass('table-row__item col-md-4 js-task-col-name').attr({'data-entity-id': task.id, 'data-field': 'name', 'data-entity': 'task'}).text(task.name);
            tableAssigneeCol.addClass('table-row__item col-md-3 js-task-col-assignee').text(task.assignees.length > 0 ? task.assignees.join(', ') : 'Не назначен');
            tableStatusCol.addClass('table-row__item col-md-2 js-task-col-status js-dropdown-field').attr({'data-entity-id': task.id, 'data-field': 'status', 'data-entity': 'task'});
            tableStartDateCol.addClass('table-row__item col js-task-col-start-datetime').attr({'data-entity-id': task.id, 'data-field': 'start_datetime', 'data-entity': 'task'}).text(new Date(task.start_datetime).toISOString().split('T')[0]);
            tableEndDateCol.addClass('table-row__item col js-disabled ').attr({'data-entity-id': task.id, 'data-field': 'end_endtime', 'data-entity': 'task'}).text(new Date(task.end_datetime).toISOString().split('T')[0]);
        
        }
        $(tableRow).append([tableTaskCol, tableAssigneeCol, tableStatusCol, tableStartDateCol, tableEndDateCol]);
        $(this.gridTableContainer).append(tableRow);
    }

    renderChartTaskRow() {
        const taskRowContainer = $('<div>').addClass('row gantt-chart__task-row task-row').attr('data-task-id', this.task.id);
        this.dateObject.forEach(monthObj => {
            const taskColumn = $('<div>').addClass('col task-row__month-col');
            const taskRow = $('<div>').addClass('row h-100');
            for (let i = 1; i <= monthObj.days; i++) {
                $(taskRow).append($('<div>').addClass('task-row__item col'));
            }
            $(taskColumn).append(taskRow);
            $(taskRowContainer).append(taskColumn);
        });
        $(this.gridLayoutContainer).append(taskRowContainer);
    }

    renderTask() {
        var tableItemWidth = $('.task-row__item').outerWidth();
        var [width, leftPosition] = this.calculateItemPosition(new Date(this.task.start_datetime), new Date(this.task.end_datetime), tableItemWidth);
        var taskElement = $('<div>');
        if (this.task.type == 'milestone') {
            width = 20;
            let rot = 45
            taskElement.addClass('rounded')
                .css({
                    position: 'absolute',
                    marginTop: '5px',
                    left: `${leftPosition}px`,
                    width: `${width}px`,
                    height: `${width}px`,
                    backgroundColor: '#D33DAF',
                    boxSizing: 'border-box',
                    transform: `rotate(-${rot}deg)`
                })
            var textElement = $('<div>')
                .css({
                    transform: `rotate(${rot}deg) translate(40px, 28px)`,
                    width: '100px',
                    fontSize: '75%',
                    fontWeight: 700
                })
                .text(this.task.name);
            taskElement.append(textElement);
        }
        else if (this.task.type == 'task') {
            taskElement.addClass('badge')
                .css({
                    position: 'absolute',
                    marginTop: '5px',
                    left: `${leftPosition}px`,
                    width: `${width}px`,
                    backgroundColor: this.getColor(),
                    boxSizing: 'border-box',
                })
                .text(this.task.name);
        }
        $(`.gantt-chart__task-row[data-task-id="${this.task.id}"]`).append(taskElement);
    }

    eventHandler() {
        this.renderTaskRow();
        this.renderTask();
    }
}

export class AbbreviatedNewMemberLoader extends BaseAbbreviatedEventHandler {
    constructor(member) {
        super();
        this.member = member;
        this.membersList = $('.js-members-list');
    }

    eventHandler() {
        var member = this.member;
        var removeMemberEventHandler = new RemoveMemberEventHandler();
        var listGroupItem = $('<li>').addClass('list-group-item js-member').attr('data-member-id', member.person.id);
        var listItemRow = $('<div>').addClass('row');
        var memberFullName = $('<div>').addClass('col members-list__item js-member-full-name').text(`${member.person.first_name} ${member.person.last_name}`);
        var memberRole = $('<div>').addClass('col members-list__item js-mebmer-full-name').text(`${member.role}`)
        var memberEmail = $('<div>').addClass('col members-list__item js-member-email').text(`${member.person.email}`);
        var memberRemove = $('<div>').addClass('col-md-1 text-center members-list__item member-remove-item js-remove-member');
        var removeIcon = $('<i>').addClass('fas fa-trash');
        $(memberRemove).on('click', (event) => {
            removeMemberEventHandler.eventHandler(event);
        });
        memberRemove.append(removeIcon);
        listItemRow.append([memberFullName, memberRole, memberEmail, memberRemove]);
        
        listGroupItem.append(listItemRow);
        $(this.membersList).append(listGroupItem);
    }
}

export class ProjectListLoader extends BaseDocumentReadyHandler {
    constructor() {
        super();
        this.projectListElement = $('.js-project-list');
        this.isEmpty = false;

        if (!this.projectListElement.length) {
            throw new Error('Project list element is unavailable.');
        }
    }

    eventHandler() {
        if (!this.isEmpty) {
            $.ajax({
                url: '/api/v1/projects',
                type: 'GET',
                dataType: 'JSON',
                success: (data) => {
                    if (data.results) {
                        const handler = new AbbreviatedProjectListElementHandler();
                        data.results.forEach(project => {
                            const listItem = $('<li>').addClass('list-group-item project-list__item js-project-list-item').attr('data-project-id', project.id);
                            const projectNameSpan = $('<span>').text(project.name);
                            const projectStartDateSpan = $('<span>').addClass('badge badge-primary').text(project.start_date);
                            $(listItem).append([projectNameSpan, projectStartDateSpan]);
                            $(listItem).on('click', (event) => handler.eventHandler(event));
                            $(this.projectListElement).append(listItem);
                        });
                    }
                },
                error: (data) => {
                    console.error(data);
                }
            });
        }
    }
}


/*
 ****************************
*/

export class AbbreviatedProjectNameLoader extends BaseAbbreviatedEventHandler {
    constructor() {
        super();
        this.element = $('.js-project-name');
        if (this.element.length === 0) {
            throw new Error('Element is unavailable.');
        }
    }

    eventHandler(data) {
        if (!data?.name) {
            throw new Error('Project name is undefined.');
        }
        this.element.text(data.name);
    }
}

export class AbbreviatedProjectStatusLoader extends BaseAbbreviatedEventHandler {
    constructor() {
        super();
        var jsonContext = this.parseJsonContext();
        this.statuses = jsonContext.content.statuses;
        this.element = $('.js-project-status');
        if (this.element.length === 0) {
            throw new Error('Element is unavailable.');
        }
    }

    eventHandler(data, target) {
        if (!data?.status) {
            throw new Error('Project status is undefined.');
        }

        if (!target) {
            this.updateStatusElement(data.status);
        }
    }

    updateStatusElement(status) {
        this.element.removeClass(Object.values(this.statuses).map(s => s.class).join(' '));
        const newStatus = this.statuses[status];
        if (newStatus) {
            this.element.addClass(newStatus.class).text(newStatus.text);
        } else {
            throw new Error(`Status "${status}" not found.`);
        }
    }
}

export class AbbreviatedProjectRoleLoader extends BaseAbbreviatedEventHandler {
    constructor() {
        super();
        this.element = $('.js-project-role');
        var jsonContext = this.parseJsonContext();
        this.roles = jsonContext.content.roles;
        this.userId = jsonContext.user.id;
        if (this.element.length === 0) {
            throw new Error('Element is unavailable.');
        }
    }

    eventHandler(data) {
        if (!data?.members) {
            throw new Error('Project members are undefined.');
        }

        const member = data.members.find(member => member.person.id === this.userId);
        if (!member) {
            throw new Error('Member was not found.');
        }

        this.element.text(this.roles[member.role].text);
    }
}

export class GridLayoutTaskLoader extends BaseAbbreviatedEventHandler {
    constructor() {
        super();
        this.noTasks = false;
        var jsonContext = this.parseJsonContext();
        this.months = jsonContext.content.months;
        this.chartLayoutContainer = $('.gantt-chart-container');
        this.gridLayoutContainer = $('.js-grid-layout-container');
        this.gridTableContainer = $('.js-grid-layout-table-container');
        this.gridLayoutMonthsElement = $('.js-grid-layout-months');
        this.gridLayoutDaysElement = $('.js-grid-layout-days');

        if (!this.gridLayoutMonthsElement.length || !this.gridLayoutDaysElement.length) {
            throw new Error('Elements are unavailable.');
        }
    }

    emptyAll() {
        this.gridLayoutMonthsElement.empty();
        this.gridLayoutDaysElement.empty();
        this.gridLayoutContainer.empty();
        this.gridTableContainer.empty();
    }

    getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    getMonthYearArray(startDate, endDate) {
        let result = [];
        let start = new Date(startDate);
        let end = new Date(endDate);

        // Корректируем даты, чтобы начальная дата была раньше или равна конечной
        if (start > end) {
            [start, end] = [end, start];
        }

        // Проходим по всем месяцам между начальной и конечной датой включительно
        while (start.getFullYear() < end.getFullYear() || (start.getFullYear() === end.getFullYear() && start.getMonth() <= end.getMonth())) {
            result.push([start.getMonth() + 1, start.getFullYear()]); // Добавляем месяц и год в массив
            start.setMonth(start.getMonth() + 1); // Переходим к следующему месяцу
        }

        return result;
    }
    

    getDateObjects(gridMonths) {
        return gridMonths.map(([month, year]) => ({
            month,
            year,
            days: this.getDaysInMonth(year, month - 1)
        }));
    }

    setCalendarGrid(dateObject) {
        for (let monthObj of dateObject) {
            let monthHeader = $('<div>').addClass('header-container__item col').text(`${this.months[monthObj.month-1]} ${monthObj.year}`);
            $(this.gridLayoutMonthsElement).append(monthHeader);
            let daysHeader = $('<div>').addClass('header-container__item col');
            let daysRow = $('<div>').addClass('row');
            for (let i=1; i <= monthObj.days; i++) {
                let daysItem = $('<div>').addClass('header-container__item col').text(i);
                $(daysRow).append(daysItem);
                $(daysHeader).append(daysRow);
            }
            $(this.gridLayoutDaysElement).append(daysHeader);
        }
    }

    calculateItemPosition(dateObject, startDate, endDate, itemWidth) {
        const startMonthIndex = dateObject.findIndex(obj => obj.month === startDate.getMonth() + 1 && obj.year === startDate.getFullYear());
        const endMonthIndex = dateObject.findIndex(obj => obj.month === endDate.getMonth() + 1 && obj.year === endDate.getFullYear());

        const startOffset = this.calculateDateOffset(dateObject, startMonthIndex, startDate.getDate() - 1);
        const endOffset = this.calculateDateOffset(dateObject, endMonthIndex, endDate.getDate() - 1);

        const totalDays = endOffset - startOffset + 1;
        const width = totalDays * itemWidth;
        const leftPosition = startOffset * itemWidth;

        return [width, leftPosition];
    }

    calculateDateOffset(dateObject, monthIndex, dayOffset) {
        return dateObject.slice(0, monthIndex).reduce((sum, obj) => sum + obj.days, 0) + dayOffset;
    }

    setProjectBorders(tasks, dateObject) {
        if (!this.noTasks) {
            const tableItemWidth = $('.task-row__item').outerWidth();
            const firstTaskDatetime = new Date(tasks[0].start_datetime);
            const lastTaskDatetime = new Date(tasks[tasks.length - 1].end_datetime);
            const [width, leftPosition] = this.calculateItemPosition(dateObject, firstTaskDatetime, lastTaskDatetime, tableItemWidth);

            const projectPeriodElement = $('<div>').css({
                position: 'absolute',
                left: `${leftPosition}px`,
                width: `${width}px`,
                border: 'solid 2px rgba(33,37,41,1)',
                borderRadius: '5px',
                height: '20px',
                boxSizing: 'border-box'
            });

            $(this.gridLayoutDaysElement).append(projectPeriodElement);
        }
    }

    setGridLayout(tasks, dateObject) {
        this.emptyAll();
        this.chartLayoutContainer.css({ width: `${dateObject.length * 30 * 30}px` });
        this.setCalendarGrid(dateObject);

        tasks.forEach(task => {
            const abbreviatedNewTaskLoader = new AbbreviatedNewTaskLoader(task, dateObject);
            abbreviatedNewTaskLoader.eventHandler();
        });

        this.setProjectBorders(tasks, dateObject);
    }

    eventHandler() {
        console.log(`parseJsonContext method: ${new Date().getTime()}`);
        const jsonContext = this.parseJsonContext();
        const projectId = jsonContext.project.id;

        if (!projectId) {
            throw new Error("Context data doesn't contain project id");
        }

        return new Promise((resolve, reject) => {
            $.ajax({
                type: 'GET',
                url: `/api/v1/projects/${projectId}/`,
                dataType: 'JSON',
                success: (data) => {
                    try {
                        this.success(data);
                        resolve(data);
                    } catch (error) {
                        reject(error);
                    }
                },
                error: (error) => {
                    console.error(error);
                    reject(error);
                }
            });
        });
    }

    success(data) {
        if (!data.hasOwnProperty('tasks')) {
            throw new Error('Server response doesn\'t contain tasks field.');
        }

        const tasks = data.tasks;
        if (!tasks.length) {
            this.noTasks = true;
        }

        let firstTaskDatetime, lastTaskDatetime;
        if (!this.noTasks) {
            firstTaskDatetime = new Date(tasks[0].start_datetime);
            lastTaskDatetime = new Date(tasks[tasks.length - 1].end_datetime);
        } else {
            firstTaskDatetime = new Date(data.start_date);
            lastTaskDatetime = new Date(firstTaskDatetime.getFullYear(), firstTaskDatetime.getMonth() + 2, firstTaskDatetime.getDate());
        }

        const gridMonths = this.getMonthYearArray(firstTaskDatetime, lastTaskDatetime);
        const dateObject = this.getDateObjects(gridMonths);
        this.setGridLayout(tasks, dateObject);
    }
}

/*
 ****************************
*/

export class MembersLoader extends BaseAbbreviatedEventHandler {
    constructor() {
        super();
        let jsonContext = this.parseJsonContext();
        this.projectId = jsonContext.project.id;
        this.membersContainer = $('.js-members-list');
    }

    eventHandler() {
        $.ajax({
            url: `/api/v1/projects/${this.projectId}/members/`,
            type: 'GET',
            dataType: 'JSON',
            success: (data) => this.success(data),
            error: (data) => console.error(data)
        });
    }
    success(data) {
        $(this.membersContainer).empty();
        data.forEach(member => {
            var addNewMemberEventHandler = new AbbreviatedNewMemberLoader(member);
            addNewMemberEventHandler.eventHandler(member);
        });
    }
}

/*
 ****************************
*/

// AbbreviatedProjectLoader constructor function
export class AbbreviatedProjectLoader extends BaseAbbreviatedEventHandler {
    constructor(projectId) {
        super();
        this.projectId = projectId;
        this.projectNameLoader = new AbbreviatedProjectNameLoader();
        this.projectStatusLoader = new AbbreviatedProjectStatusLoader();
        this.projectRoleLoader = new AbbreviatedProjectRoleLoader();
        this.gridLayoutLoader = new GridLayoutTaskLoader();
        //members tab
        this.membersLoader = new MembersLoader();
        this.editableEventHandler = new EditableEventHandler();
        this.dropdownEditableEventHandler = new DropdownEditableEventHandler();
    }

    async saveProjectState(projectId) {
        const updates = {
            'project': {
                'id': projectId
            }
        }
        const abbreviatedContextDataUpdater = new AbbreviatedContextDataUpdater(updates);
        await abbreviatedContextDataUpdater.eventHandler();
    }

    // Event handler method
    eventHandler(data) {
        this.saveProjectState(data.id).then(() => {
            this.projectNameLoader.eventHandler(data);
            this.projectStatusLoader.eventHandler(data);
            this.projectRoleLoader.eventHandler(data);
            this.membersLoader.eventHandler();
            this.gridLayoutLoader.eventHandler().then(() => {
                this.editableEventHandler.setupEventHandler();
                this.dropdownEditableEventHandler.setupEventHandler();
            });
        });
        
    }
}

// AbbreviatedProjectListElementHandler constructor function
export class AbbreviatedProjectListElementHandler extends BaseAbbreviatedEventHandler {
    constructor() {
        super();
    }

    // Event handler method
    eventHandler(event) {
        const target = event.target.closest('.js-project-list-item');
        const projectId = $(target).attr('data-project-id');
        const abbreviatedProjectLoader = new AbbreviatedProjectLoader(projectId);
        $.ajax({
            url: `/api/v1/projects/${projectId}`,
            type: 'GET',
            dataType: 'JSON',
            success: (data) => {
                $('#modal-project-list').modal('hide');
                abbreviatedProjectLoader.eventHandler(data);
            },
            error: (error) => {
                console.error(error);
            }
        });
    }
}

// AddTaskModalShowUpEventHandler constructor function
export class AddTaskModalShowUpEventHandler extends BaseDefaultEventHandler {
    constructor() {
        super('.js-add-task', 'click');
    }

    // Event handler method
    eventHandler(event) {
        $('#modal-create-task').modal();
    }
}

export class AddMilestoneShowUpEventHandler extends BaseDefaultEventHandler {
    constructor() {
        super('.js-add-milestone', 'click');
    }

    eventHandler(event) {
        $('#modal-create-milestone').modal();
    }
}

export class AbbreviatedContextDataUpdater extends BasePOSTEventHandler {
    constructor(updates) {
        super();
        this.updates = updates;
    }

    eventHandler() {
        return new Promise((resolve, reject) => {
            var context = this.getContextData(this.updates);
            var data = this.serializeData(context);
            var endpoint = this.getEndpoint();
            var csrftoken = this.getCSRFToken();
            $.ajax({
                url: endpoint,
                type: "POST",
                contentType: "application/json; charset=UTF-8",
                dataType: "JSON",
                processData: false,
                data: data,
                timeout: 5000,  // Таймаут в миллисекундах (5000 мс = 5 секунд)
                beforeSend: function(xhr, settings) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                },
                success: (updated) => {
                    this.success(updated);
                    resolve(updated);
                },
                error: (xhr, textStatus, errorThrown) => {
                    this.error(xhr, textStatus, errorThrown);
                    reject(new Error(textStatus));
                },
            });
        });
    }
    

    serializeData(context) {
        return JSON.stringify(context);
    }

    getEndpoint() {
        return '/api/v1/context/';
    }

    getContextData(event) {
        return event;
    }

    setupEventHandler() {
        return;
    }

    _setupEventHandler() {
        return;
    }

    success(updated) {
        console.log(`success method: ${new Date().getTime()}`);
        this.setJsonContext(updated);
    }
    error(xhr, textStatus, errorThrown) {
        console.log('sad');
        if (textStatus === "timeout") {
            console.error("Request timed out.");
        } else {
            console.error("Request failed: " + textStatus, errorThrown);
        }
    }
    getCSRFToken() {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, 10) === 'csrftoken=') {
                    cookieValue = decodeURIComponent(cookie.substring(10));
                    break;
                }
            }
        }
        return cookieValue;
    }
}
