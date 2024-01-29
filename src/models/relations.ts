import {Recipient} from "./Recipient";
import {Registry} from "./Registry";
import {RecipientRegistry} from "./RecipientRegistry";

Recipient.belongsToMany(Registry, {
    through: RecipientRegistry,
    foreignKey: 'recipientId',
    otherKey: 'registryId',
});

Registry.belongsToMany(Recipient, {
    through: RecipientRegistry,
    foreignKey: 'registryId',
    otherKey: 'recipientId',
});

export {Recipient, Registry, RecipientRegistry};
