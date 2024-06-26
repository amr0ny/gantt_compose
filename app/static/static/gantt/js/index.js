import {
    ModalBackgroundEventHandler,
    ProjectListLoader,
    DocumentReadyContentLoader,
    AddTaskModalShowUpEventHandler,
    ProjectListModalShowUpHandler,
    CreateProjectModalShowUpHandler,
    CreateProjectEventHandler,
    AddTaskEventHandler,
    AddMilestoneShowUpEventHandler,
    AddMemberEventHandler,
    ResetFormEventHandler
} from './handlers/Handlers.js';

$(document).ready(() => {
    var modalBackgroundEventHandler = new ModalBackgroundEventHandler();
    var projectListLoader = new ProjectListLoader();
    var dialogModalShowUpLoader = new DocumentReadyContentLoader();
    var addTaskModalShowUpEventHandler = new AddTaskModalShowUpEventHandler();
    var projectListModalShowUpHandler = new ProjectListModalShowUpHandler();
    var addTaskEventHandler = new AddTaskEventHandler();
    var createProjectModalShowUpHandler = new CreateProjectModalShowUpHandler();
    var addMilestoneShowUpEventHandler = new AddMilestoneShowUpEventHandler();
    var createProjectEventHandler = new CreateProjectEventHandler();
    var addMemberEventHandler = new AddMemberEventHandler();
    var resetFormEventHandler = new ResetFormEventHandler();
    dialogModalShowUpLoader.setupEventHandler();
    projectListLoader.setupEventHandler();
    createProjectEventHandler.setupEventHandler();
    addTaskEventHandler.setupEventHandler();
    addTaskModalShowUpEventHandler.setupEventHandler();
    createProjectModalShowUpHandler.setupEventHandler();
    projectListModalShowUpHandler.setupEventHandler();
    addMilestoneShowUpEventHandler.setupEventHandler();
    addMemberEventHandler.setupEventHandler();
    modalBackgroundEventHandler.setupEventHandler();
    resetFormEventHandler.setupEventHandler();
});

