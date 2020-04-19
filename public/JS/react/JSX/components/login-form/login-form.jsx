import { CustomInput } from '../../../JS/components/base/input/input.js';
import { CustomButton } from '../../../JS/components/base/button/button.js';

export class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: ''
        };

        this.onInputChange.bind(this);
        this.onSubmit.bind(this);
        this.onInputChange.bind(this);
    }

    onInputChange (event, field) {
        this.setState({[field]: event.target.value});
    }

    async onSubmit(event) {
        event.preventDefault();

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
    }

    render() {
        return (
           <form className={`form ${this.props.className}`} action="" onSubmit={async (e) => await this.onSubmit(e)}>
                <CustomInput type="email" label="E-mail" onChange={e => this.onInputChange(e, 'email')} required={true}/>
                <CustomInput type="password" label="Пароль" onChange={e => this.onInputChange(e, 'password')} required={true}/>
                <CustomButton className="button_justified button_big button_color_red" value="Войти"/>
           </form>
        )
    }
}