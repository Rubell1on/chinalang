class Header extends React.Component {
    constructor(props) {
        super(props);
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
                <HeaderControls onLogin={this.props.onLogin} onContacts={this.props.onContacts}/>
            </div>
        )
    }
}

function HeaderControls(props) {
    return <div className="header-controls">
                <div className="button-small login" type="button" onClick={props.onLogin}>Войти</div>
                <div className="button-small contacts" type="button" onClick={props.onContacts}>Контакты</div>
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
    }

    addComponent = (e, component) => {
        const temp = [...this.children];
        temp.push(component);
        this.children = temp;
        this.setState({children: temp});
    }

    removeComponent = (e, component) => {
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
                <Header onLogin={e => this.addComponent(e, this.loginWindow)}/>
            </div>
        )
    }
}

ReactDOM.render(<CustomPage/>, document.querySelector('.app-wrapper'))