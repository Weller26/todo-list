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

  update() {
    const newDomNode = this.render();
    if (this._domNode) {
      this._domNode.replaceWith(newDomNode);
    }
    this._domNode = newDomNode;
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

    const newTodo = {
      id: this.state.todos[this.state.todos.length - 1].id + 1,
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

  render() {
    return createElement("div", { class: "todo-list" }, [
      createElement("h1", {}, "TODO List"),
      createElement("div", { class: "add-todo" }, [
        createElement("input", {
          id: "new-todo",
          type: "text",
          placeholder: "Задание",
          value: this.state.inputValue
        }, null, {
          input: this.onAddInputChange,
        }),
        createElement("button", { id: "add-btn" }, "+", {
          click: this.onAddTask,
        }),
      ]),
      
      createElement(
        "ul",
        { id: "todos" },
        this.state.todos.map((todo) =>
          createElement("li", {}, [
            createElement("input", { type: "checkbox" }),
            createElement("label", {}, todo.text),
            createElement("button", {}, "🗑️"),
          ])
        )
      ),
    ]);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.appendChild(new TodoList().getDomNode());
});
