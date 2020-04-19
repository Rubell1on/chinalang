import { CustomInput } from '../../../JS/components/base/input/input.js';
import { CustomButton } from '../../../JS/components/base/button/button.js';
export class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: ''
    };
    this.onInputChange = this.onInputChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
  }

  onInputChange(event, field) {
    this.setState({
      [field]: event.target.value
    });
  }

  async onSubmit(event) {
    event.preventDefault();
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
        className: `form ${this.props.className}`,
        action: "",
        onSubmit: async e => await this.onSubmit(e)
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
      React.createElement("button", {
        type: "submit",
        className: "button button_justified button_big button_color_red"
      }, "\u0412\u043E\u0439\u0442\u0438"))
    );
  }

}