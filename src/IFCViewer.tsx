import { useEffect, useRef, useState } from "react";
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";
import Stats from "stats.js";
import * as FRAGS from "../..";

const IFCViewer = () => {
    const fileInputRef = useRef(null)
    const initializeWorld = (container) => {
        const components = new OBC.Components();
        const worlds = components.get(OBC.Worlds);
        const world = worlds.create();

        world.scene = new OBC.SimpleScene(components);
        world.scene.setup();
        world.scene.three.background = null;

        world.renderer = new OBC.SimpleRenderer(components, container);

        world.camera = new OBC.SimpleCamera(components);
        world.camera.controls.setLookAt(74, 16, 0.2, 30, -4, 27); // convenient position for the model we will load

        components.init();

        const grids = components.get(OBC.Grids);
        grids.create(world);
    };
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            console.log("File selected:", selectedFile);
            fileRef.current = selectedFile;

            const container = document.getElementById("container");
            if (!worldRef.current || !fragmentIfcLoaderRef.current) {
                console.log("Initializing world and loader...");
                initializeWorld(container);
            }

            if (worldRef.current && fragmentIfcLoaderRef.current) {
                loadIfc(selectedFile, fragmentIfcLoaderRef.current);
            }
        }
    };

    return (
        <div className="ifc-viewer">
            <input
                type="file"
                accept=".ifc"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
            <button className="upload-button" onClick={() => fileInputRef.current.click()}>
                Upload IFC File
            </button>
        </div>
    )
}
export default IFCViewer;