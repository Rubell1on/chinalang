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

    // componentDidMount() {
    //     const node = this.loginForm.current;
    //     node.addEventListener("submit", async(e) => await this.onSubmit(e));
    // }

    // componentWillUnmount() {
    //     const node = this.loginForm.current;
    //     node.removeEventListener("submit", async (e) => await this.onSubmit(e));
    // }

    onInputChange (event, field) {
        this.setState({[field]: event.target.value});
    }

    async onSubmit(e) {
        e.preventDefault()
        console.log(this);
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
        } else {
            notificationController.error('Ошибка!');
        }
    }

    render() {
        return (
        //    <form ref={this.loginForm} className={`form ${this.props.className}`} >
        //         <CustomInput key="email" type="email" label="E-mail" onChange={e => this.onInputChange(e, 'email')} required={true}/>
        //         <CustomInput key="password" type="password" label="Пароль" onChange={e => this.onInputChange(e, 'password')} required={true}/>
        //         <CustomButton type="submit" className="button_justified button_big button_color_red" value="Войти" />
        //    </form>
            <form ref={this.loginForm} className={`form ${this.props.className}`} onSubmit={async e => await this.onSubmit(e)}>
                <input key="email" type="email" onChange={e => this.onInputChange(e, 'email')} required={true}/>
                <input key="password" type="password" onChange={e => this.onInputChange(e, 'password')} required={true}/>
                <input type="submit" className="button_justified button_big button_color_red" value="Войти" />
           </form>
        )
    }
}