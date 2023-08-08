import {Request, Response} from "express";
import {Registry} from "../models/src/models/Registry";
import {RegistriesRegistryFilesRelation} from "../models/src/models/RegistriesRegistryFilesRelation";
import sequelize from "../models/src/sequelize";

export class RegistryController {
    public async getRegistryPage(req: Request, res: Response): Promise<void> {
        const pageNumber = req.body.page ?? 1
        const pageSize = 100
        const offset = (pageNumber - 1) * pageSize;
        const totalCount = await Registry.count();
        try {
            const totalPages = Math.ceil(totalCount / pageSize);
            const results = await Registry.findAll({
                limit: pageSize,
                offset: offset,
                order: [
                    ['id', 'desc']
                ]
            });
            const response = {
                total: totalCount,
                per_page: pageSize,
                current_page: pageNumber,
                last_page: totalPages,
                from: offset + 1,
                to: offset + results.length,
                data: results,
            };
            res.json(response);
        } catch (error) {
            res.status(500).json({error: "Internal server error"});
        }
    }

    public async getRegistries(req: Request, res: Response): Promise<void> {
        try {
            const registryFiles = await Registry.findAll();
            res.json(registryFiles);
        } catch (error) {
            res.status(500).json({error: "Internal server error"});
        }
    }

    public async store(req: Request, res: Response): Promise<void> {
        const { name, type, emails, is_blocked, registry_file_ids } = req.body;
        const t = await sequelize.transaction();
        try {
            const createdRegistry = await Registry.create({
                name,
                type,
                emails,
                is_blocked,
            }, { transaction: t });

            if (Array.isArray(registry_file_ids)) {
                for (const registry_file_id of registry_file_ids) {
                    await RegistriesRegistryFilesRelation.create({
                        registryId: createdRegistry.id,
                        registryFileId: registry_file_id,
                    }, { transaction: t });
                }
            }
            console.log('Record created.');

            await t.commit();

            res.json({ message: 'Record created' });
        } catch (error) {
            console.error('Create operation failed:', error);
            await t.rollback();
            res.status(500).json({ error: 'Create operation failed' });
        }
    }


    public async show(req: Request, res: Response): Promise<void> {
        const registryId = req.params.id;
        try {
            const registry = await Registry.findByPk(registryId);
            const registryFiles = await RegistriesRegistryFilesRelation.findAll({
                where: { registryId: registryId },
            });

            if (!registry) {
                res.status(404).json({ error: "Registry not found" });
                return;
            }

            const registryData = {
                id: registry.id,
                name: registry.name,
                type: registry.type,
                emails: registry.emails,
                is_blocked: registry.is_blocked,

                registry_file_ids: registryFiles.map((file) => ({
                    id: file.registryFileId,
                })),
            };

            res.json(registryData);
        } catch (error) {
            console.error("Get by ID operation failed:", error);
            res.status(500).json({ error: "Get by ID operation failed" });
        }
    }

    public async update(req: Request, res: Response): Promise<void> {
        const registryId = req.params.id;
        const { name, type, emails, is_blocked, registry_file_ids } = req.body;

        try {
            const registry = await Registry.findByPk(registryId);

            if (!registry) {
                res.status(404).json({ error: "Registry not found" });
                return;
            }

            registry.name = name;
            registry.type = type;
            registry.emails = emails;
            registry.is_blocked = is_blocked;

            await registry.save();

            // Update RegistriesRegistryFilesRelation logic here
            if (registry_file_ids.length > 0) {
                // Delete existing relations
                await RegistriesRegistryFilesRelation.destroy({
                    where: {
                        registryId: registry.id,
                    },
                });

                // Create new relations
                for (const registry_file_id of registry_file_ids) {
                    await RegistriesRegistryFilesRelation.create({
                        registryId: registry.id,
                        registryFileId: registry_file_id,
                    });
                }
            }

            res.json(registry);
        } catch (error) {
            console.error("Update operation failed:", error);
            res.status(500).json({ error: "Update operation failed" });
        }
    }

    public async destroy(req: Request, res: Response): Promise<void> {
        const registryId = req.params.id;

        Registry.findByPk(registryId)
            .then((registry) => {
                if (!registry) {
                    res.status(404).json({error: "Registry not found"});
                    return;
                }

                return registry.destroy();
            })
            .then(() => {
                res.json({message: "Registry deleted successfully"});
            })
            .catch((error) => {
                console.error("Delete operation failed:", error);
                res.status(500).json({error: "Delete operation failed"});
            });
    }
}
