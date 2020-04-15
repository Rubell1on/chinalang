class CustomPage extends React.Component {
    constructor(props) {
        super(props);
        this.login = <LoginWindow backgroundClick={e => this.removeComponent(e, this.login)}/>
        // this.yesNoWindow = <YesNoWindow header="Вы уверены" onYes={e => [this.yesNoWindow, this.login].forEach(el => this.removeComponent(e, el))} onNo={e => this.removeComponent(e, this.yesNoWindow)}/>
        this.tempChildren = [
            <CustomButton className="button_medium button_color_blue button_bold" value="Логин" onClick={e => this.addComponent(e, this.login)}/>
        ];

        this.state = {
            children: this.tempChildren
        }
    }

    componentDidMount() {
        console.log(this.login);
        // this.tempChildren.push(this.login);
        // this.setState({children: this.tempChildren})
    }

    addComponent = (e, component) => {
        console.log(this.state.children);
        this.tempChildren.push(component);
        this.setState({children: this.tempChildren});
    }

    removeComponent = (e, component) => {
        const i = this.tempChildren.indexOf(component);
        if (i !== -1) {
            this.tempChildren.splice(i, 1);
            this.setState({children: this.tempChildren});
        }
    }

    render() {
        return (
            <div className={`page ${this.props.className}`}>{this.state.children}</div>
        )
    }
}

// ReactDOM.render(<CustomPage/>, document.querySelector('.app-wrapper'));