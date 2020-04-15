function YesNoWindow(props) {
    return (
        <Overlay>
            <Header key="header" className="" value={props.header}/>
            <div style={{display: "flex", flexDirection: "row", width: "fit-content", margin: "0 auto"}}>
                <CustomButton className="button_small button_color_red" value="Да" onClick={props.onYes}/>
                <CustomButton className="button_small button_color_red" value="Нет" onClick={props.onNo}/>
            </div>
        </Overlay>
    )
}