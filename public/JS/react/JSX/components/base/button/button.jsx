export function CustomButton(props) {
    return (
        <input type={props.type} className={`button ${props.className}`} value={props.value} onClick={props.onClick}/>
    )
}