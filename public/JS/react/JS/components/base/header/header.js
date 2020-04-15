function WindowHeader(props) {
    return React.createElement(
        "div",
        { className: "window-header " + props.className },
        props.value
    );
}