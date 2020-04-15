function CustomButton(props) {
    return React.createElement("input", { type: "submit", className: "button " + props.className, value: props.value, onClick: props.onClick });
}