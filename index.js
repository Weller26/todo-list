function createElement(tag, attributes, children, callbacks) {
  const element = document.createElement(tag);

  if (attributes) {
    Object.keys(attributes).forEach((key) => {
      element.setAttribute(key, attributes[key]);
    });
  }

  if (Array.isArray(children)) {
    children.forEach((child) => {
      if (typeof child === "string") {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement) {
        element.appendChild(child);
      }
    });
  } else if (typeof children === "string") {
    element.appendChild(document.createTextNode(children));
  } else if (children instanceof HTMLElement) {
    element.appendChild(children);
  }

  if (callbacks) {
    Object.keys(callbacks).forEach((eventName) => {
      element.addEventListener(eventName, callbacks[eventName]);
    })
  }

  return element;
}

class Component {
  constructor() {
  }

  getDomNode() {
    this._domNode = this.render();
    return this._domNode;
  }

  update () {
    const parent = this._domNode.parentNode;
    const nextDomNode = this.render();

    if (parent) {
      parent.replaceChild(nextDomNode, this._domNode);
    }

    this._domNode = nextDomNode;
    return this._domNode;
  }
}

class TodoList extends Component {
  constructor() {
    super();
    this.state = {
      todos: this.loadTodos(),
      inputValue: "",
    };
  }

  loadTodos() {
    const todos = [];
    let hasAny = false;

    for (const key in localStorage) {
      if (key.startsWith("todo_")) {
        const id = parseInt(key.replace("todo_", ""), 10);
        const text = localStorage.getItem(key);
        const isDone = localStorage.getItem(`todoDone_${id}`) === "true";

        todos.push({ id, text, isDone });
        hasAny = true;
      }
    }

    if (!hasAny) {
      const defaultTodos = [
        { id: 1, text: "Сделать домашку", isDone: false },
        { id: 2, text: "Сделать практику", isDone: false },
        { id: 3, text: "Пойти домой", isDone: false },
      ];

      
      defaultTodos.forEach(todo => this.saveTodo(todo));
      return defaultTodos;
    }

    return todos.sort((a, b) => a.id - b.id);
  }

  saveTodo(todo) {
    localStorage.setItem(`todo_${todo.id}`, todo.text);
    localStorage.setItem(`todoDone_${todo.id}`, todo.isDone);
  }

  deleteTodo(id) {
    localStorage.removeItem(`todo_${id}`);
    localStorage.removeItem(`todoDone_${id}`);
  }

  onAddTask = () => {
    if (this.state.inputValue.trim() === "") return;

    const nextId = this.state.todos.length > 0
        ? this.state.todos[this.state.todos.length - 1].id + 1
        : 1;
    const newTodo = {
      id: nextId,
      text: this.state.inputValue,
      isDone: false,
    }
    this.state.todos.push(newTodo);
    this.saveTodo(newTodo);

    this.state.inputValue = "";
    this.update();
  }

  onAddInputChange = (event) => {
    this.state.inputValue = event.target.value;
  }

  onDeleteTask = (id) => {
    this.state.todos = this.state.todos.filter((item) => item.id !== id);
    this.update();
  }

  onToggleDone = (id) => {
    const todo = this.state.todos.find((item) => item.id === id);
    if (todo) {
      todo.isDone = !todo.isDone;
      this.saveTodo(todo);
      this.update();
    }
  }

  render() {
    return createElement("div", { class: "todo-list" }, [
      createElement("h1", {}, "TODO List"),
      new AddTask(this.onAddTask, this.onAddInputChange, this.state.inputValue).getDomNode(),
      createElement(
        "ul",
        { id: "todos" },
        this.state.todos.map((todo) =>
          new Task(todo, this.onDeleteTask, this.onToggleDone).getDomNode()
        )
      ),
    ]);
  }
}

class AddTask extends Component {
  constructor(onAddTask, onAddInputChange, value) {
    super();
    this.onAddTask = onAddTask;
    this.onAddInputChange = onAddInputChange;
    this.value = value;
  }

  render() {
    return createElement("div", { class: "add-todo" }, [
      createElement(
        "input",
        {
          id: "new-todo",
          type: "text",
          placeholder: "Задание",
          value: this.value,
        },
        null,
        { input: this.onAddInputChange }
      ),

      createElement("button", { id: "add-btn" }, "+", { click: this.onAddTask }),
    ]);
  }
}


class Task extends Component {
  constructor(todo, onDeleteTask, onToggleDone) {
    super();
    this.state = {
      todo: todo,
      onDeleteTask: onDeleteTask,
      onToggleDone: onToggleDone,
      warningReceived: false
    }
  }

  render() {
    return createElement("li", {}, [
      createElement(
        "input",
        { type: "checkbox", ...(this.state.todo.isDone ? {checked: "checked"} : {}) },
        null,
        {
          change: () => this.state.onToggleDone(this.state.todo.id),
        }
      ),
      createElement(
        "label",
        { style: this.state.todo.isDone ? "color: gray;" : "color: black;" },
        this.state.todo.text
      ),
      createElement("button", {style: this.state.warningReceived ? "background-color: red;" : "" }, "🗑️", {
        click: () => {
          if (this.state.warningReceived) {
            this.state.onDeleteTask(this.state.todo.id);
          }
          else {
            this.state.warningReceived = true;
            this.update();
          }
        }
      }),
    ]);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.appendChild(new TodoList().getDomNode());
});
