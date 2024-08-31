// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Create a function to generate a unique task id
function generateTaskId() {
  nextId += 1;
  localStorage.setItem("nextId", JSON.stringify(nextId));
  return nextId;
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
  const lanes = {
    todo: $("#to-do"),
    inProgress: $("#in-progress"),
    done: $("#done"),
  };
  
  // Clear existing tasks
  Object.values(lanes).forEach(lane => {
    if (lane.length === 0) {
      console.error("Element not found for lane:", lane);
    } else {
      lane.empty();
    }
  });


  // Render each task
  taskList.forEach(task => {
    const taskCard = createTaskCard(task);
   if(lanes[task.status]) {
      lanes[task.status].append(taskCard);
    } else {
      console.error("Lane not found for status:", task.status);
    }
  });


  // Make tasks draggable
  $(".task-card").draggable({
    revert: "invalid",
    helper: "clone"
  });
}
// Create a function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  const title = $("#taskTitle").val();
  const description = $("#taskDescription").val();
  const dueDate = $("#taskDeadline").val();

  const id = generateTaskId();

  const newTask = {
    id: id,
    title: title,
    description: description,
    deadline: dueDate, // Change `dueDate` to `deadline` to match other parts of the code
    status: "todo"
  };

  taskList.push(newTask);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();

  // Clear form fields
  $("#taskTitle").val("");
  $("#taskDescription").val("");
  $("#taskDeadline").val("");
}

// Create a function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(event.target).closest(".task-card").data("id");
  taskList = taskList.filter(task => task.id !== taskId);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// Create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  
  const taskId = ui.draggable.data("id");
  const newStatus = $(event.target).data("status");

  taskList = taskList.map(task =>
    task.id === taskId ? { ...task, status: newStatus } : task
  );
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}
// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(taskList));
  localStorage.setItem('nextId', JSON.stringify(nextId));
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  // Initialize task list and nextId if they don't exist in localStorage
  if (!taskList) {
    taskList = [];
    localStorage.setItem("tasks", JSON.stringify(taskList));
  }
  if (!nextId) {
    nextId = 0;
    localStorage.setItem("nextId", JSON.stringify(nextId));
  }

  renderTaskList();
 // Add event listeners
  $("#add-task-form").on("submit", handleAddTask);
  $(document).on("click", ".delete-task", handleDeleteTask);

  // Make lanes droppable
  $(".task-lane").droppable({
    accept: ".task-card",
    drop: handleDrop
  });

  // Make due date field a date picker
  $("#task-due-date").datepicker();
});
