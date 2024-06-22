// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Create a function to generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Create a function to create a task card
function createTaskCard(task) {
  const taskCard = $(`
    <div class="card task-card mb-3" data-id="${task.id}">
      <div class="card-body">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">${task.description}</p>
        <p class="card-text"><small class="text-muted">Due: ${dayjs(task.deadline).format('MM/DD/YYYY')}</small></p>
        <button class="btn btn-danger btn-sm delete-task">Delete</button>
      </div>
    </div>
  `);

  // Add color coding for deadlines
  const deadline = dayjs(task.deadline);
  if (dayjs().isAfter(deadline)) {
    taskCard.find('.card-body').css('background-color', 'red');
  } else if (dayjs().add(3, 'day').isAfter(deadline)) {
    taskCard.find('.card-body').css('background-color', 'yellow');
  }

  return taskCard;
}

// Create a function to render the task list and make cards draggable
function renderTaskList() {
  $('#todo-cards').empty();
  $('#in-progress-cards').empty();
  $('#done-cards').empty();

  taskList.forEach(task => {
    const taskCard = createTaskCard(task);
    $(`#${task.status}-cards`).append(taskCard);
  });

  // Make task cards draggable
  $(".task-card").draggable({
    revert: "invalid",
    start: function () {
      $(this).css('opacity', '0.5');
    },
    stop: function () {
      $(this).css('opacity', '1');
    }
  });
}

// Create a function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  const title = $('#taskTitle').val();
  const description = $('#taskDescription').val();
  const deadline = $('#taskDeadline').val();

  if (title && description && deadline) {
    const task = {
      id: generateTaskId(),
      title,
      description,
      deadline,
      status: 'to-do'
    };

    taskList.push(task);
    saveTasks();
    renderTaskList();

    $('#taskForm')[0].reset();
    $('#formModal').modal('hide');
  }
}

// Create a function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(event.target).closest('.task-card').data('id');
  taskList = taskList.filter(task => task.id !== taskId);
  saveTasks();
  renderTaskList();
}

// Create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = ui.draggable.data('id');
  const newStatus = $(this).attr('id').split('-')[0];

  taskList.forEach(task => {
    if (task.id === taskId) {
      task.status = newStatus;
    }
  });

  saveTasks();
  renderTaskList();
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(taskList));
  localStorage.setItem('nextId', JSON.stringify(nextId));
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();

  $('#taskForm').on('submit', handleAddTask);
  $(document).on('click', '.delete-task', handleDeleteTask);

  $(".lane").droppable({
    accept: ".task-card",
    drop: handleDrop
  });

  $("#taskDeadline").datepicker({
    dateFormat: 'yy-mm-dd'
  });
});
