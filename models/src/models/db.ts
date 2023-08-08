
import {Registry} from "./Registry";
import {RegistryFile} from "./RegistryFile";
import {RegistriesRegistryFilesRelation} from "./RegistriesRegistryFilesRelation";

Registry.belongsToMany(RegistryFile, {
    through: RegistriesRegistryFilesRelation,
    foreignKey: 'registryId',
    otherKey: 'registryFileId',
});

RegistryFile.belongsToMany(Registry, {
    through: RegistriesRegistryFilesRelation,
    foreignKey: 'registryFileId',
    otherKey: 'registryId',
});

export { Registry, RegistryFile, RegistriesRegistryFilesRelation };
