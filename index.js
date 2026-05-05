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
      todos: [
        { id: 1, text: "Сделать домашку", isDone: false },
        { id: 2, text: "Сделать практику", isDone: false },
        { id: 3, text: "Пойти домой", isDone: false },
      ],
      inputValue: "",
    };
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

    this.state.inputValue = "";
    this.update();
  }

  onAddInputChange = (event) => {
    this.state.inputValue = event.target.value;
  }

  onRemoveTask = (id) => {
    this.state.todos = this.state.todos.filter((item) => item.id !== id);
    this.update();
  }

  onToggleDone = (id) => {
    const todo = this.state.todos.find((item) => item.id === id);
    if (todo) {
      todo.isDone = !todo.isDone;
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
          new Task(todo, this.onRemoveTask, this.onToggleDone).getDomNode()
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
    this.todo = todo;
    this.onDeleteTask = onDeleteTask;
    this.onToggleDone = onToggleDone;
  }

  render() {
    return createElement("li", {}, [
      createElement(
        "input",
        { type: "checkbox", ...(this.todo.isDone ? {checked: "checked"} : {}) },
        null,
        {
          change: () => this.onToggleDone(this.todo.id),
        }
      ),
      createElement(
        "label",
        { style: this.todo.isDone ? "color: gray;" : "color: black;" },
        this.todo.text
      ),
      createElement("button", {}, "🗑️", {
        click: () => this.onDeleteTask(this.todo.id),
      }),
    ]);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.appendChild(new TodoList().getDomNode());
});
