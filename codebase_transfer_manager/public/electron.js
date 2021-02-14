const { app, BrowserWindow, ipcMain, ipcRenderer, Notification, dialog } = require("electron");
const path = require("path");
const fetch = require('node-fetch');
const request = require('request');
const fs = require('fs');
const isDev = require("electron-is-dev");
// const download = require("downloadjs");


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
}

// Just for testing
ipcMain.on('toMain', (event, data) => {
    // console.log(data);
    setInterval(() => {
        request("http://localhost:8080/allfiles", function(err, res, body) {
            mainWindow.webContents.send('allFiles', body);
        });
        // old aproach:
        // axios.get("http://localhost:8080/allfiles")
        //     .then(res => {
        //         console.log(res)
        //         ipcRenderer.send('allFiles', res);
        //     })  
    }, 1000);
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
    });
});

// Callback for downloading files
ipcMain.on('download', async (event, fileInfo) => {
    const { fileID, fileExtension } = fileInfo;
    console.log('[Backend] Downloading file:', fileID, 'with extension: ', fileExtension);
    
    const download = (url, path, callback) => {
        request.head(url, (err, res, body) => {
            request(url)
            .pipe(fs.createWriteStream(path))
            .on('close', callback)
        })
    }

    const path = `../client_file_downloads/${fileID}.${fileExtension}`
    const url = 'http://localhost:8080/files/?fileId='+fileID;

    download("./tmp/5a326763b71b0182.png", path, () => {
        console.log('Download finished')
    })

    // // Send HTTP GET request to download the file
    // let req = request.defaults({
    //     headers: {
    //         'fileId': fileID,
    //     }
    // });
    
    // req('http://localhost:8080/files/', function(err, res, body) {
    //     console.log(err, body);
    //     const url = "./tmp/" + body.split('\"')[1]
    //     const path = './'
    //     download(url, path, () => {});
 

    // })
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
