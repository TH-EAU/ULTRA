import { MeshToonMaterial } from "three"
import MeshLoader from "../../loaders/MeshLoader"
import * as THREE from "three";

const basePath = "/assets/models/structures/"




export const LittleTower = ({ position }: { position: [number, number, number] }) => {
    return (
        <MeshLoader path={basePath + "isoled_tower_little2.glb"} position={position} />
    )
}

export const ElficPortal = ({ position }: { position: [number, number, number] }) => {
    return (
        <MeshLoader path={basePath + "eflic_portal_1.glb"} position={position} />
    )
}

export const LittleHouse = ({ position }: { position: [number, number, number] }) => {

    return (
        <MeshLoader
            path={basePath + "little_house.glb"}
            position={position}

        />
    );
};

export const Pillar = ({ position }: { position: [number, number, number] }) => {
    return (
        <MeshLoader
            path={basePath + "pillar.glb"}
            position={position}
            material={new THREE.MeshLambertMaterial({ color: "#aaa" })}
        />
    );
}