import {Recipient} from "./Recipient";
import {Registry} from "./Registry";
import {RecipientRegistry} from "./RecipientRegistry";

Recipient.belongsToMany(Registry, {
    through: RecipientRegistry,
    foreignKey: 'recipient_id',
    otherKey: 'registry_id',
});

Registry.belongsToMany(Recipient, {
    through: RecipientRegistry,
    foreignKey: 'registry_id',
    otherKey: 'recipient_id',
});

export {Recipient, Registry, RecipientRegistry};
