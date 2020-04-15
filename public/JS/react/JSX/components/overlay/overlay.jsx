class Overlay extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={`overlay ${this.props.className}`}>
                <CustomBackground className="overlay__background" onClick={this.props.onBackgroundClick}></CustomBackground>
                <ReactWindow className="overlay__window window_centered">{this.props.children}</ReactWindow>
            </div>
        )
    }
}