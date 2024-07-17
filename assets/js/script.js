const formModalEl = $('#formModal');
const taskTitleInput = $('#task-title-input');
const taskDueDateInput = $('#task-due-date-input');
const taskDescriptionInput = $('#task-description-input');
const addTaskBtn = $('#add-task-button');
const toDoList = $('#todo-cards');
const inProgressList = $('#in-progress-cards');
const doneList = $('#done-cards');

function readTasksFromStorage() {
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  return tasks;
}

function handleTaskFormSubmit(event) {
  event.preventDefault();

  const taskTitle = taskTitleInput.val().trim();
  const taskDueDate = taskDueDateInput.val(); 
  const taskDescription = taskDescriptionInput.val().trim(); 

  if (!taskTitle || !taskDueDate || !taskDescription) {
    alert("Please fill all the content.");
    return;
  }  

  const newTask = {
    id: crypto.randomUUID(),
    title: taskTitle,
    dueDate: taskDueDate,
    description: taskDescription,
    status: 'to-do',
  };

  const tasks = readTasksFromStorage();
  tasks.push(newTask);

  saveTasksToStorage(tasks);
  printTaskData();

  taskTitleInput.val('');
  taskDueDateInput.val('');
  taskDescriptionInput.val('');

  formModalEl.modal('hide');
}

function saveTasksToStorage(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function createTaskCard(task) {
  const taskCard = $('<div>')
    .addClass('card task-card draggable my-3')
    .attr('data-task-id', task.id);
  const cardHeader = $('<div>').addClass('card-header h4').text(task.title);
  const cardBody = $('<div>').addClass('card-body');
  const cardDescription = $('<p>').addClass('card-text').text(task.description);
  const cardDueDate = $('<p>').addClass('card-text').text(task.dueDate);
  const cardDeleteBtn = $('<button>')
    .addClass('btn btn-danger delete')
    .text('Delete')
    .attr('data-task-id', task.id);
  cardDeleteBtn.on('click', handleDeleteTask);

  if (task.dueDate && task.status !== 'done') {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');

    if (now.isSame(taskDueDate, 'day')) {
      taskCard.addClass('bg-warning text-white');
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass('bg-danger text-white');
      cardDeleteBtn.addClass('border-light');
    }
  }

  cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
  taskCard.append(cardHeader, cardBody);

  return taskCard;
}

function printTaskData() {
  const tasks = readTasksFromStorage();

  toDoList.empty();
  inProgressList.empty();
  doneList.empty();

  tasks.forEach(task => {
    if (task.status === 'to-do') {
      toDoList.append(createTaskCard(task));
    } else if (task.status === 'in-progress') {
      inProgressList.append(createTaskCard(task));
    } else if (task.status === 'done') {
      doneList.append(createTaskCard(task));
    }
  });

  $('.draggable').draggable({
    opacity: 0.7,
    zIndex: 100,
    helper: function (e) {
      const original = $(e.target).hasClass('ui-draggable')
        ? $(e.target)
        : $(e.target).closest('.ui-draggable');
      return original.clone().css({
        width: original.outerWidth(),
      });
    },
  });
}

function handleDrop(event, ui) {
  const tasks = readTasksFromStorage();
  const taskId = ui.draggable[0].dataset.taskId;
  const newStatus = event.target.id;

  tasks.forEach(task => {
    if (task.id === taskId) {
      task.status = newStatus;
    }
  });

  saveTasksToStorage(tasks);
  printTaskData();
}

function handleDeleteTask() {
  const taskId = $(this).attr('data-task-id');
  const tasks = readTasksFromStorage();
  
  tasks.forEach((task) => {
    if (task.id === taskId) {
      tasks.splice(tasks.indexOf(task), 1);
    }
  });

  saveTasksToStorage(tasks);
  printTaskData();
}

addTaskBtn.on('click', handleTaskFormSubmit);

$(document).ready(function () {
  printTaskData();

  $('#task-due-date-input').datepicker({
    changeMonth: true,
    changeYear: true,
  });

  $('.lane').droppable({
    accept: '.draggable',
    drop: handleDrop,
  });
});
