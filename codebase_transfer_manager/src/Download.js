import axios from "axios";
import React, { Component, useState } from "react"

function Download() {

    const [fileID, setFileID] = useState('')
    const [extension, setExtension] = useState('')

    const onSubmit = (event) => {
        event.preventDefault(); // Prevent entire page from reloading when the Download button is pressed
        console.log('Download Button Pressed')

        // Download stuff
        window.api.send('download', {
            fileID: fileID,
            fileExtension: extension
        })
    }

    const onFileIDChange = (event) => {
        let value = event.target.value;
        setFileID(value);
        console.log('File ID:', fileID)
    }

    const onExtensionChange = (event) => {
        let value = event.target.value;
        setExtension(value);
        console.log('Extension:', extension)
    }

    return (
        <form onSubmit={onSubmit}>
            <input type="text" placeholder="File ID" onChange={onFileIDChange}/>
            <input type="text" placeholder="Extension" onChange={onExtensionChange}/>
            <input type="submit" value="Download" />
        </form>
    );
}

export default Download;