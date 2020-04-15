function YesNoWindow(props) {
    return React.createElement(
        Overlay,
        null,
        React.createElement(Header, { key: "header", className: "", value: props.header }),
        React.createElement(
            "div",
            { style: { display: "flex", flexDirection: "row", width: "fit-content", margin: "0 auto" } },
            React.createElement(CustomButton, { className: "button_small button_color_red", value: "\u0414\u0430", onClick: props.onYes }),
            React.createElement(CustomButton, { className: "button_small button_color_red", value: "\u041D\u0435\u0442", onClick: props.onNo })
        )
    );
}