import { LoginWindow } from '../../../JS/components/login-window/login-window.js';

class Header extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const data = auth.getData();
        
        if (data.role && data.apiKey && location.pathname === '/')
            location.href = `${location.origin}/dashboard/${data.role === 'student' ? 'main' : 'users'}`;
    }

    render() {
        return (
            <div className="header">
                <a href="/">
                    <div className="logo">
                        <img className="logo-label" src="../public/IMG/header/chinalang_label.png"/>
                        <img className="logo-img" src="../public/IMG/header/triangle_logo.png"/>
                    </div>
                </a>
                <HeaderControls onLogin={this.props.onLogin} onContact={this.props.onContact}/>
            </div>
        )
    }
}

function HeaderControls(props) {
    return <div className="header-controls">
                <div className="button-small login" type="button" onClick={props.onLogin}>Войти</div>
                <div className="button-small contacts" type="button" onClick={props.onContact}>Контакты</div>
            </div>
}

class CustomPage extends React.Component {
    constructor(props) {
        super(props);
        this.loginWindow = <LoginWindow backgroundClick={e => this.removeComponent(e, this.loginWindow)}/>;
        this.children = [];
        this.state = {
            children: this.children
        }

        this.addComponent.bind(this);
        this.removeComponent.bind(this);
    }

    addComponent(e, component) {
        const temp = [...this.children];
        temp.push(component);
        this.children = temp;
        this.setState({children: temp});
    }

    removeComponent(e, component) {
        const temp = [...this.children];
        const i = temp.indexOf(component);
        temp.splice(i, 1);
        this.children = temp;
        this.setState({children: temp});
    }

    render() {
        const temp = this.children;
        return (
            <div className="wrapper">
                <div>{this.state.children}</div>
                <Header onLogin={e => this.addComponent(e, this.loginWindow)} onContact={async e => await createFeedbackWindow()}/>
            </div>
        )
    }
}


ReactDOM.render(<CustomPage/>, document.querySelector('.app-wrapper'))