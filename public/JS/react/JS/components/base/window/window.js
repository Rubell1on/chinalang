function ReactWindow(props) {
    return React.createElement(
        "div",
        { className: "window " + props.className },
        props.children
    );
}