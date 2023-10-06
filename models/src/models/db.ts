
import {Recipient} from "./Recipient";
import {Registry} from "./Registry";
import {RecipientsRegistriesRelation} from "./RecipientsRegistriesRelation";

Recipient.belongsToMany(Registry, {
    through: RecipientsRegistriesRelation,
    foreignKey: 'recipientId',
    otherKey: 'registryId',
});

Registry.belongsToMany(Recipient, {
    through: RecipientsRegistriesRelation,
    foreignKey: 'registryId',
    otherKey: 'recipientId',
});

export { Recipient, Registry, RecipientsRegistriesRelation };
