import React, { useEffect, useState } from "react";
function Files(props) {

    let [files, setFiles] = useState([]);

    useEffect(() => {
        // console.log('ipcRenderer', ipcRenderer)
        window.api.receive('allFiles', (res) => {
            setFiles(res)
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