const { app, BrowserWindow, ipcMain, ipcRenderer, Notification, dialog } = require("electron");
const path = require("path");
// const FormData = require('form-data');
// const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
// const fetch = require('node-fetch');
const axios = require('axios');
const request = require('request');
const fs = require('fs');
const isDev = require("electron-is-dev");

let mainWindow;

async function createWindow() {
    if (isDev) {
        try {
            const {
                default: installExtension,
                REACT_DEVELOPER_TOOLS,
            } = require("electron-devtools-installer");
            const name = await installExtension(REACT_DEVELOPER_TOOLS, true);
            console.log(name, "was installed");
        } catch (error) {}
    }
    mainWindow = new BrowserWindow({
        width: 1050,
        height: 625,
        show: false,
        webPreferences: {
            nodeIntegration: true, // is default value after Electron v5
            contextIsolation: true, // protect against prototype pollution
            enableRemoteModule: false, // turn off remote
            preload: path.join(__dirname, "preload.js") // use a preload script
          },      
        icon: path.join(
            isDev ? process.cwd() + "/resources" : process.resourcesPath,
            "media",
            "icon.ico"
        ),
    }); 
    mainWindow.on("ready-to-show", async () => {
        mainWindow.show();
        // if (isDev) mainWindow.webContents.openDevTools({ mode: "undocked" });
    });
    mainWindow.on("closed", () => (mainWindow = null));
    mainWindow.loadURL(
        isDev
            ? "http://localhost:3000"
            : `file://${path.join(__dirname, "../build/index.html")}`
    );


    console.log('TEST')
    setInterval(() => {
        console.log('setInterval')
        axios.get("http://localhost:8080/allfiles")
            .then(res => {
                console.log(res)
                ipcRenderer.send('allFiles', res);
            })
    }, 1000);
}

// Just for testing
ipcMain.on('toMain', (event, data) => {
    console.log('Hello there');
    console.log(data);
});

// Callback for notifications
ipcMain.on('notify', (event, data) => {
    console.log('[Backend] Showing notification:', data)
    new Notification({title: 'Codebase Transfer Manager', body: data}).show();
    mainWindow.webContents.on('did-finish-load', ()=> {
        mainWindow.webContents.send('fromMain', "hello");
    })

});

// Callback for uploading files
ipcMain.on('upload', async (event, data) => {
    console.log('[Backend] Uploading file');
    
    // Show the file upload dialog
    dialog.showOpenDialog({
        properties:['openFile']
    }, )
    .then((files) => {
        console.log('Files:', files) // TODO: handle "cancelling" the file dialog
        let filePaths = files.filePaths
        // This works:
        const options = {
            method: "POST",
            url: "http://localhost:8080/upload",
            formData : {
                "uploadFile" : fs.createReadStream(filePaths[0])
            }
        };
        request(options, function(err, res, body) {
            console.log('body:', body)
            const fileID = body.split(' ')[1];
        });
        // return new Promise((resolve, reject) => {
        //     request(options, function (err, res, body) {
        //         if (err) {
        //             reject(err);
        //         } else {
        //             resolve(body);
        //         }
        //     });
        // });
        // Old approach:
        // let formData = new FormData();
        // filePaths.forEach((fPath) => {
        //     console.log('fPath', fPath)
        //     formData.append('uploadFile', fs.createReadStream(fPath))
        // });
        // var request = new XMLHttpRequest();
        // request.open("POST", "/upload");
        // return request.send(JSON.stringify(formData));

        // return fetch('http://localhost:8080/upload', {
        //     method: 'POST',
        //     body: formData
        // })
    });
});

// Callback for downloading files
ipcMain.on('download', async (event, fileInfo) => {
    console.log('[Backend] Downloading file:', fileID, 'with extension: ', fileExtension);
    
    // Send HTTP GET request to download the file

});

/* 
Add any more callbacks as you see fit
*/

app.on("ready", createWindow);

app.on("activate", () => {
    if (mainWindow === null) createWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
