import { CustomInput } from '../../../JS/components/base/input/input.js';
import { CustomButton } from '../../../JS/components/base/button/button.js';
export class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: ''
    };
    this.loginForm = React.createRef();
    this.onInputChange = this.onInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
  }

  onInputChange(event, field) {
    this.setState({
      [field]: event.target.value
    });
  }

  handleSubmit(event) {
    // event.preventDefault();
    request.get('/login', this.state).then(res => {
      if (res.status === 'success') {
        const role = res.response.role;
        auth.setData(res.response);
        const courseRoute = role === 'student' ? 'main' : 'users';
        location.href = `${location.origin}/dashboard/${courseRoute}`;
      }
    }).catch(e => {
      console.log(e);
      notificationController.error(e.error.responseText);
    });
  }

  render() {
    return (
      /*#__PURE__*/
      React.createElement("form", {
        ref: this.loginForm,
        action: "",
        className: `form ${this.props.className}`,
        onSubmit: e => e.preventDefault()
      },
      /*#__PURE__*/
      React.createElement(CustomInput, {
        key: "email",
        type: "email",
        label: "E-mail",
        onChange: e => this.onInputChange(e, 'email'),
        required: true
      }),
      /*#__PURE__*/
      React.createElement(CustomInput, {
        key: "password",
        type: "password",
        label: "\u041F\u0430\u0440\u043E\u043B\u044C",
        onChange: e => this.onInputChange(e, 'password'),
        required: true
      }),
      /*#__PURE__*/
      React.createElement(CustomButton, {
        type: "submit",
        className: "button_justified button_big button_color_red",
        value: "\u0412\u043E\u0439\u0442\u0438",
        onClick: this.handleSubmit
      }))
    );
  }

}