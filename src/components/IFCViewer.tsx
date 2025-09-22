import React, { useEffect, useRef, useState } from "react";
import * as OBC from "@thatopen/components";
import * as THREE from "three";
const IFCViewer = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const fileRef = useRef<File | null>(null);
    const worldRef = useRef<OBC.World>(null);
    const modelIDRef = useRef<number | null>(null);
    const fragmentIfcLoaderRef = useRef<OBC.IfcLoader>(null);
    const fragmentsRef = useRef<OBC.FragmentsManager>(null);

    const initializeWorld = async (container: HTMLElement | null) => {
        const components = new OBC.Components();
        const worlds = components.get(OBC.Worlds);
        const world = worlds.create();

        world.scene = new OBC.SimpleScene(components);
        // Add lights to the scene
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);

        // @ts-ignore
        world.scene.three.add(ambientLight);
        // @ts-ignore
        world.scene.three.add(directionalLight);

        world.renderer = new OBC.SimpleRenderer(components, container);

        world.camera = new OBC.OrthoPerspectiveCamera(components);
        world.camera.controls.setLookAt(74, 16, 0.2, 30, -4, 27);

        components.init();

        const grids = components.get(OBC.Grids);
        grids.create(world);

        const fragments = components.get(OBC.FragmentsManager);
        const githubUrl =
            "https://thatopen.github.io/engine_fragment/resources/worker.mjs";
        const fetchedUrl = await fetch(githubUrl);
        const workerBlob = await fetchedUrl.blob();
        const workerFile = new File([workerBlob], "worker.mjs", {
            type: "text/javascript",
        });
        const workerUrl = URL.createObjectURL(workerFile);
        await fragments.init(workerUrl);

        world.camera.controls.addEventListener("rest", () =>
            fragments.core.update(true),
        );
        console.log("Fragments: ", fragments)
        fragmentsRef.current = fragments;
        const fragmentIfcLoader = components.get(OBC.IfcLoader);
        await fragmentIfcLoader.setup({
            autoSetWasm: false,
            wasm: {
                path: "https://unpkg.com/web-ifc@0.0.71/",
                absolute: true,
            }
        })
        worldRef.current = world;
        fragmentIfcLoaderRef.current = fragmentIfcLoader;

        // Ensures that once the Fragments model is loaded
        // (converted from the IFC in this case),
        // it utilizes the world camera for updates
        // and is added to the scene.
        fragments.list.onItemSet.add(({ value: model }) => {
            console.log("here");

            // @ts-ignore
            model.useCamera(world.camera.three);
            world.scene.three.add(model.object);
            fragments.core.update(true);
        });

    };

    const loadIfc = async (file, loader: OBC.IfcLoader) => {
        try {
            console.log("Loading file:", file);
            const data = await file.arrayBuffer();
            const buffer = new Uint8Array(data);
            console.log("Buffer length:", buffer.length);
            if (buffer.length === 0) {
                throw new Error("Empty buffer");
            }
            const model = await loader.load(buffer, false, "example", {
                processData: {
                    progressCallback: (progress) => console.log(progress),
                },
            });
        } catch (error) {
            console.error("Error loading IFC model:", error);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            console.log("File selected:", selectedFile);
            fileRef.current = selectedFile;

            const container = document.getElementById("container");
            if (!worldRef.current || !fragmentIfcLoaderRef.current) {
                console.log("Initializing world and loader...");
                initializeWorld(container).then(() => {

                    if (worldRef.current && fragmentIfcLoaderRef.current) {
                        loadIfc(selectedFile, fragmentIfcLoaderRef.current);
                    }
                });

            }

        }
    };

    return (
        <div className="ifc-viewer">
            <div id="container" style={{ width: "100%", height: "500px" }} />
            <input
                type="file"
                accept=".ifc"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
            <button className="upload-button" onClick={() => fileInputRef.current?.click()}>
                Upload IFC File
            </button>
        </div>
    );
};

export default IFCViewer;