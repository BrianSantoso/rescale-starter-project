import React, { useEffect, useState } from "react";
import axios from "axios";
// import { ipcRenderer } from "electron";
console.log('TESTESTESTESTSETSET')
function Files(props) {

    let [files, setFiles] = useState([]);

    useEffect(() => {
        // console.log('ipcRenderer', ipcRenderer)
        window.api.receive('allFiles', (res) => {
            console.log('RECEIVED')
        })
    }, []);

    return (
        <div className=''> 
            <p>Files</p> 
            { files }
        </div>
    );
}

export default Files;