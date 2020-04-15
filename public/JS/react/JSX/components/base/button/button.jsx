function CustomButton(props) {
    return (
        <input type="submit" className={`button ${props.className}`} value={props.value} onClick={props.onClick}/>
    )
}