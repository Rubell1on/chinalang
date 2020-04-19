import { LoginWindow } from '../../../JS/components/login-window/login-window.js';

class Header extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const data = auth.getData();
    if (data.role && data.apiKey && location.pathname === '/') location.href = `${location.origin}/dashboard/${data.role === 'student' ? 'main' : 'users'}`;
  }

  render() {
    return /*#__PURE__*/React.createElement("div", {
      className: "header"
    }, /*#__PURE__*/React.createElement("a", {
      href: "/"
    }, /*#__PURE__*/React.createElement("div", {
      className: "logo"
    }, /*#__PURE__*/React.createElement("img", {
      className: "logo-label",
      src: "../public/IMG/header/chinalang_label.png"
    }), /*#__PURE__*/React.createElement("img", {
      className: "logo-img",
      src: "../public/IMG/header/triangle_logo.png"
    }))), /*#__PURE__*/React.createElement(HeaderControls, {
      onLogin: this.props.onLogin,
      onContact: this.props.onContact
    }));
  }

}

function HeaderControls(props) {
  return /*#__PURE__*/React.createElement("div", {
    className: "header-controls"
  }, /*#__PURE__*/React.createElement("div", {
    className: "button-small login",
    type: "button",
    onClick: props.onLogin
  }, "\u0412\u043E\u0439\u0442\u0438"), /*#__PURE__*/React.createElement("div", {
    className: "button-small contacts",
    type: "button",
    onClick: props.onContact
  }, "\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u044B"));
}

class CustomPage extends React.Component {
  constructor(props) {
    super(props);
    this.loginWindow = /*#__PURE__*/React.createElement(LoginWindow, {
      backgroundClick: e => this.removeComponent(e, this.loginWindow)
    });
    this.children = [];
    this.state = {
      children: this.children
    };
    this.addComponent.bind(this);
    this.removeComponent.bind(this);
  }

  addComponent(e, component) {
    const temp = [...this.children];
    temp.push(component);
    this.children = temp;
    this.setState({
      children: temp
    });
  }

  removeComponent(e, component) {
    const temp = [...this.children];
    const i = temp.indexOf(component);
    temp.splice(i, 1);
    this.children = temp;
    this.setState({
      children: temp
    });
  }

  render() {
    const temp = this.children;
    return /*#__PURE__*/React.createElement("div", {
      className: "wrapper"
    }, /*#__PURE__*/React.createElement("div", null, this.state.children), /*#__PURE__*/React.createElement(Header, {
      onLogin: e => this.addComponent(e, this.loginWindow),
      onContact: async e => await createFeedbackWindow()
    }));
  }

}

ReactDOM.render( /*#__PURE__*/React.createElement(CustomPage, null), document.querySelector('.app-wrapper'));