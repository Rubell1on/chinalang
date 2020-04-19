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
    this.onSubmit = this.onSubmit.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
  }

  componentDidMount() {
    const node = this.loginForm.current;
    const addEvent = node.addEventListener || node.attachEvent;
    addEvent("submit", e => this.onSubmit(e), false);
  }

  componentWillUnmount() {
    const node = this.loginForm.current;
    const removeEvent = node.removeEventListener || node.detachEvent;
    removeEvent("submit", e => this.onSubmit(e));
  }

  onInputChange(event, field) {
    this.setState({
      [field]: event.target.value
    });
  }

  async onSubmit(e) {
    e.preventDefault();
    console.log(this);
    notificationController.success('Получилось!');
    const res = await request.get('/login', this.state).catch(e => {
      console.log(e);
      notificationController.error(e.error.responseText);
    });

    if (res.status === 'success') {
      const role = res.response.role;
      auth.setData(res.response);
      const courseRoute = role === 'student' ? 'main' : 'users';
      location.href = `${location.origin}/dashboard/${courseRoute}`;
    }
  }

  render() {
    return (
      /*#__PURE__*/
      React.createElement("form", {
        ref: this.loginForm,
        className: `form ${this.props.className}`
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
        value: "\u0412\u043E\u0439\u0442\u0438"
      }))
    );
  }

}