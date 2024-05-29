import {
    ModalBackgroundEventHandler,
    SingleFieldEventHandler,
    SyncScrollHandler,
    ProjectListLoader,
    DocumentReadyContentLoader,
    AddTaskModalShowUpEventHandler,
    ProjectListModalShowUpHandler,
    CreateProjectModalShowUpHandler,
    CreateProjectEventHandler,
    AddTaskEventHandler,
    AddMilestoneShowUpEventHandler,
    AddMemberEventHandler,
} from './handlers/Handlers.js';

$(document).ready(() => {
    var modalBackgroundEventHandler = new ModalBackgroundEventHandler();
    // var cancelEditableEventHandler = new CancelEditableEventHandler();
    var fieldFormEventHandler = new SingleFieldEventHandler();
    var syncScrollHandler = new SyncScrollHandler('.js-sync-scrollable');
    var projectListLoader = new ProjectListLoader();
    var dialogModalShowUpLoader = new DocumentReadyContentLoader();
    var addTaskModalShowUpEventHandler = new AddTaskModalShowUpEventHandler();
    var projectListModalShowUpHandler = new ProjectListModalShowUpHandler();
    var addTaskEventHandler = new AddTaskEventHandler();
    var createProjectModalShowUpHandler = new CreateProjectModalShowUpHandler();
    var addMilestoneShowUpEventHandler = new AddMilestoneShowUpEventHandler();
    var createProjectEventHandler = new CreateProjectEventHandler();
    var addMemberEventHandler = new AddMemberEventHandler();
    dialogModalShowUpLoader.setupEventHandler();
    projectListLoader.setupEventHandler();
    createProjectEventHandler.setupEventHandler();
    //cancelEditableEventHandler.setupEventHandler();
    fieldFormEventHandler.setupEventHandler();
    syncScrollHandler.setupEventHandler();
    addTaskEventHandler.setupEventHandler();
    addTaskModalShowUpEventHandler.setupEventHandler();
    createProjectModalShowUpHandler.setupEventHandler();
    projectListModalShowUpHandler.setupEventHandler();
    addMilestoneShowUpEventHandler.setupEventHandler();
    addMemberEventHandler.setupEventHandler();
    modalBackgroundEventHandler.setupEventHandler();
    /*
    $(document).on('mousedown', (event) => cancelEditing(event));
    projectNameEditable.click((event) => projectNameShowHandler(event));
    projectNameButton.click((event) => projectNameHandler(event));
    */
    
});

