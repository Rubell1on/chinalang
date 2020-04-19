export function ReactWindow(props) {
    return <div style={props.customStyle} className={`window ${props.className}`}>{props.children}</div>
}