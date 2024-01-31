import {Recipient} from "./Recipient";
import {Registry} from "./Registry";
import {RecipientsRegistriesRelation} from "./RecipientsRegistriesRelation";

Recipient.belongsToMany(Registry, {
    through: RecipientsRegistriesRelation,
    foreignKey: 'recipient_id',
    otherKey: 'registry_id',
});

Registry.belongsToMany(Recipient, {
    through: RecipientsRegistriesRelation,
    foreignKey: 'registry_id',
    otherKey: 'recipient_id',
});

export {Recipient, Registry, RecipientsRegistriesRelation};
