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

    onInputChange (event, field) {
        this.setState({[field]: event.target.value});
    }

    async onSubmit() {
        notificationController.success('Получилось!');
        const res = await request.get('/login', this.state)
            .catch(e => {
                console.log(e);
                notificationController.error(e.error.responseText);
            });
        if (res.status === 'success') {
            const role = res.response.role;
            auth.setData(res.response);

            const courseRoute = role === 'student' ? 'main' : 'users';

            location.href = `${location.origin}/dashboard/${courseRoute}`;
        }
        notificationController.success('Тоже!');
    }

    render() {
        return (
           <form id={this.props.formId} className={`form ${this.props.className}`} onSubmit={e => e.preventDefault()}>
                <CustomInput key="email" type="email" label="E-mail" onChange={e => this.onInputChange(e, 'email')} required={true}/>
                <CustomInput key="password" type="password" label="Пароль" onChange={e => this.onInputChange(e, 'password')} required={true}/>
                <button form={this.props.formId} type="submit" className="button button_justified button_big button_color_red" onClick={async e => await this.onSubmit(e)}>Войти</button>
           </form>
        )
    }
}