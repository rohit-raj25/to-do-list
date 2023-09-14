document.addEventListener("DOMContentLoaded", function () {
  const taskInput = document.getElementById("task-input");
  const submitButton = document.querySelector(".submit-button");
  const listContainer = document.getElementById("list-container");
  const dateTimeInput = document.getElementById("datetime-input");
  const dropdown = document.getElementById("dropdown");
  const searchInputField = document.querySelector("#search");

  searchInputField.addEventListener("input", function (e) {
    const searchTerm = e.target.value.toLowerCase();
    displayTasksFromLocalStorage(searchTerm);
  });

  function loadTasksFromLocalStorage() {
    displayTasksFromLocalStorage();
  }

  function displayTasksFromLocalStorage(filter = "") {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const sortedTasks = tasks.sort((a, b) => {
      const dateA = new Date(a.datetime);
      const dateB = new Date(b.datetime);

      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
      return 0;
    });
    const filteredTasks = sortedTasks.filter(
      (task) =>
        task.task.toLowerCase().includes(filter) ||
        task.category.toLowerCase().includes(filter)
    );

    const listContainer = document.getElementById("list-container");

    listContainer.innerHTML = "";

    filteredTasks.forEach((task) => {
      const taskItem = document.createElement("li");
      taskItem.innerHTML = `
              <span class="add-text">${task.task}</span>
              <span class="add-text">${task.category}</span>
              <button class="delete-btn">Delete</button>
          `;

      const taskDateTime = new Date(task.datetime);
      const now = new Date();

      if (taskDateTime < now) {
        taskItem.classList.add("overdue");
      }

      listContainer.appendChild(taskItem);
    });
  }

  setInterval(() => {
    displayTasksFromLocalStorage();
  }, 10000); // Refreshes the task list every minute

  loadTasksFromLocalStorage();

  submitButton.addEventListener("click", function () {
    const taskText = taskInput.value.trim();
    const datetimeValue = dateTimeInput.value;
    const dropdownValue = dropdown.value;

    if (!taskText || !datetimeValue || !dropdownValue) {
      alert("You must fill all fields!");
      return;
    }

    const taskDate = new Date(datetimeValue);
    const now = new Date();

    let taskPriority;
    if (taskDate.toDateString() === now.toDateString()) {
      taskPriority = 1; // Today's Task
    } else if (
      taskDate.toDateString() ===
      new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString()
    ) {
      taskPriority = 2; // Tomorrow's Task
    } else {
      taskPriority = 3; // Other tasks
    }

    const taskItem = document.createElement("li");
    taskItem.innerHTML = `
          <span class="add-text">${taskText}</span>
          <span class="add-text">${dropdownValue}</span>
          <button class="delete-btn">Delete</button>
      `;

    taskItem.setAttribute("data-priority", taskPriority);
    listContainer.appendChild(taskItem);

    const taskObj = {
      task: taskText,
      datetime: datetimeValue,
      category: dropdownValue,
    };
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push(taskObj);
    localStorage.setItem("tasks", JSON.stringify(tasks));

    taskInput.value = "";
    dateTimeInput.value = "";
    dropdown.value = "Work";

    sortListContainer();
  });

  listContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("delete-btn")) {
      const taskText =
        event.target.previousElementSibling.previousElementSibling.textContent;
      removeFromLocalStorage(taskText);

      event.target.parentNode.remove();
      sortListContainer();
    }
  });

  const div = document.getElementById("my-div");
  div.addEventListener("click", () => rotateDiv("my-div"));

  function rotateDiv(divId) {
    const div = document.getElementById(divId);
    const currentTransform = div.style.transform;
    const currentRotation = currentTransform
      ? parseInt(currentTransform.match(/rotate\((\d+)deg\)/)[1])
      : 0;

    const newRotation = (currentRotation + 90) % 360;
    div.style.transform = `rotate(${newRotation}deg)`;
  }

  function sortListContainer() {
    const tasks = Array.from(listContainer.querySelectorAll("li"));
    tasks.sort((a, b) => {
      const priorityA = parseInt(a.getAttribute("data-priority"));
      const priorityB = parseInt(b.getAttribute("data-priority"));

      return priorityA - priorityB;
    });

    listContainer.innerHTML = "";
    tasks.forEach((task) => listContainer.appendChild(task));

    listContainer.addEventListener(
      "click",
      function (e) {
        if (e.target.tagName === "LI") {
          e.target.classList.toggle("checked");
        }
      },
      false
    );

    const liall = document.querySelectorAll("#list-container li");
    const searchInputField = document.querySelector("#search");
    searchInputField.addEventListener("input", function (e) {
      const searchstr = e.target.value.toLowerCase();
      liall.forEach((li) => {
        const text = li.innerText.toLowerCase();
        if (text.includes(searchstr)) {
          li.style.display = "block";
        } else {
          li.style.display = "none";
        }
      });
    });
  }

  function removeFromLocalStorage(taskText) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks = tasks.filter((task) => task.task !== taskText);
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
});

const voiceSearchButton = document.getElementById("voice-search-button");
const searchInputField = document.getElementById("search");

voiceSearchButton.addEventListener("click", startVoiceSearch);

function startVoiceSearch() {
  if ("webkitSpeechRecognition" in window) {
    const recognition = new webkitSpeechRecognition();

    recognition.onresult = function (event) {
      const voiceResult = event.results[0][0].transcript.toLowerCase().trim();
      // Remove dots at the end, if any
      const cleanVoiceResult = voiceResult.replace(/\.$/, "");
      searchInputField.value = cleanVoiceResult;

      // Automatically filter and display tasks based on the voice input
      filterAndDisplayTasks(cleanVoiceResult);
    };

    recognition.start();
  } else {
    alert("Speech recognition is not supported in your browser.");
  }
}

function filterAndDisplayTasks(filterText) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const sortedTasks = tasks.sort((a, b) => {
    const dateA = new Date(a.datetime);
    const dateB = new Date(b.datetime);

    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;
    return 0;
  });

  const filteredTasks = sortedTasks.filter((task) => {
    const taskText = task.task.toLowerCase();
    const category = task.category.toLowerCase();

    // Check if the task description or category includes the filter text
    return taskText.includes(filterText) || category.includes(filterText);
  });

  // Display the filtered tasks
  displayFilteredTasks(filteredTasks);
}

function displayFilteredTasks(filteredTasks) {
  const listContainer = document.getElementById("list-container");
  listContainer.innerHTML = "";

  filteredTasks.forEach((task) => {
    const taskItem = document.createElement("li");
    taskItem.innerHTML = `
      <span class="add-text">${task.task}</span>
      <span class="add-text">${task.category}</span>
      <button class="delete-btn">Delete</button>
    `;

    const taskDateTime = new Date(task.datetime);
    const now = new Date();

    if (taskDateTime < now) {
      taskItem.classList.add("overdue");
    }

    listContainer.appendChild(taskItem);
  });
}
