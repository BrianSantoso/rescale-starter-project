import React, { useEffect, useState } from "react";
import axios from "axios";
console.log('TESTESTESTESTSETSET')
function Files(props) {

    let [files, setFiles] = useState([]);

    useEffect(() => {
        console.log('TEST')
        setInterval(() => {
            console.log('setInterval')
            axios.get("http://localhost:8080/allfiles")
                .then(res => {
                    console.log(res)
                    setFiles(res.body)
                })
        }, 1000);
    }, []);

    return (
        <div className=''> 
            <p>Files</p> 
            { files }
        </div>
    );
}

export default Files;