function CustomBackground(props) {
    return React.createElement("div", { className: "background " + props.className, onClick: props.onClick });
}