import React from "react";
function RemoveImageButton({onClick}) {
    return (
        <button className = "remove-button" onClick = {onClick}>
        Remove
        </button>
    );

}
export default RemoveImageButton;