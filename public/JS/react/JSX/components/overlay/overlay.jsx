import { CustomBackground } from '../../../JS/components/base/background/background.js';
import { ReactWindow } from '../../../JS/components/base/window/window.js';

export class Overlay extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={`overlay ${this.props.className}`}>
                <CustomBackground className="overlay__background" onClick={this.props.onBackgroundClick}></CustomBackground>
                <ReactWindow customStyle={this.props.customStyle} className="overlay__window window_centered">{this.props.children}</ReactWindow>
            </div>
        )
    }
}