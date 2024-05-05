import { Template } from 'meteor/templating'
import { TasksCollection } from '/imports/db/TasksCollection'
import { ReactiveDict } from 'meteor/reactive-dict';
import './App.html';
import './Task.js';
import './Login.js';

// Constants
const HIDE_COMPLETED_STRING = "hideCompleted";

// Gets
const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();

const getTaskFilter = () => {
    const user = getUser();

    const hideCompletedFilter = { isChecked: { $ne: true } };
    const userFilter = user ? { userId: user._id } : {};
    const pendingOnlyFilter = {...hideCompletedFilter, ...userFilter};

    return {userFilter, pendingOnlyFilter};
}

Template.mainContainer.onCreated(function mainContainerOnCreated() {
    this.state = new ReactiveDict();
})

Template.mainContainer.helpers({
    tasks() {
        const instance = Template.instance();
        const hideCompleted = instance.state.get(HIDE_COMPLETED_STRING);

        const hideCompletedFilter = { isChecked: { $ne: true } };

        if (!isUserLogged()) {
            return [];
        };
        
        return TasksCollection.find( hideCompleted 
            ? hideCompletedFilter 
            : {}, { sort: { createdAt: -1 }
        }).fetch();
    },
    hideCompleted() {
        return Template.instance().state.get(HIDE_COMPLETED_STRING)
    },
    incompleteCount() {
        if (!isUserLogged()) {
            return '';
        };
        
        const { pendingOnlyFilter } = getTaskFilter();
        
        const incompleteTaskCount = TasksCollection.find(pendingOnlyFilter).count();
        return incompleteTaskCount && isUserLogged() ? `(${incompleteTaskCount}) rimanenti` : '';
    },
    isUserLogged() {
        return isUserLogged();
    },
    getUser() {
        return getUser();
    },
})

Template.form.events({
    "submit .task-form"(event) {
        event.preventDefault();

        const target = event.target;
        const text = target.text.value;

        Meteor.call('tasks.insert', text)

        target.text.value = '';
        
    }
})

Template.mainContainer.events({
    "click #hide-completed-button"(event, instance) {
        const currentHideCompleted = instance.state.get(HIDE_COMPLETED_STRING);
        instance.state.set(HIDE_COMPLETED_STRING, !currentHideCompleted);
    },
    'click .user-logout'(ev) {
        Meteor.logout();
    },
});