class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: ''
        };
    }

    onInputChange = (event, field) => {
        this.setState({[field]: event.target.value});
    }

    onSubmit = async event => {
        event.preventDefault();
        console.log(this.state);
    }

    render() {
        return (
           <form className={`form ${this.props.className}`} action="" onSubmit={this.onSubmit}>
                <CustomInput type="text" label="Логин" onChange={e => this.onInputChange(e, 'username')}/>
                <CustomInput type="password" label="Пароль" onChange={e => this.onInputChange(e, 'password')}/>
                <CustomButton className="button_justified button_big button_color_red" value="Отправить"/>
           </form>
        )
    }
}