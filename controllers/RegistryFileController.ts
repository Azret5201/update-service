import {Request, Response} from "express";
import {Service} from "../models/src/models/Service";
import {ColumnOrder} from "../models/src/models/ColumnOrder";
import {PathLike, createWriteStream} from "fs";
import {Registry} from "../models/src/models/Registry";
import {RegistryFile} from "../models/src/models/RegistryFile";

export class RegistryFileController {
    public async getRegistryFilePage(req: Request, res: Response): Promise<void> {
        const pageNumber = req.body.page ?? 1
        const pageSize = 100
        const offset = (pageNumber - 1) * pageSize;
        const totalCount = await RegistryFile.count();
        try {
            const totalPages = Math.ceil(totalCount / pageSize);
            const results = await RegistryFile.findAll({
                limit: pageSize,
                offset: offset
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

    public async getRegistryFiles(req: Request, res: Response): Promise<void> {
        try {
            const registryFiles = await RegistryFile.findAll();
            res.json(registryFiles);
        } catch (error) {
            res.status(500).json({error: "Internal server error"});
        }
    }

    public async store(req: Request, res: Response): Promise<void> {
        if (
            !req.body.name
            || !req.body.serviceId
            || !req.body.serverId
            || !req.body.tableHeaders
        ) {
            res.status(400).json({ error: "Required parameters are missing" });
            return;
        }

        try {
            await RegistryFile.create({
                name: req.body.name,
                service_id: req.body.serviceId,
                server_id: req.body.serverId,
                table_headers: req.body.tableHeaders,
                fields: req.body.fields,
                sql_query: req.body.sqlQuery,
            });

            res.json({ message: "Record created" });
        } catch (error) {
            console.error("Create operation failed:", error);
            res.status(500).json({ error: "Create operation failed" });
        }
    }

    public async show(req: Request, res: Response): Promise<void> {
        const fileId = req.params.id;

        RegistryFile.findByPk(fileId)
            .then((registryFile) => {
                if (!registryFile) {
                    res.status(404).json({ error: "Registry file not found" });
                    return;
                }
                res.json(registryFile);
            })
            .catch((error) => {
                console.error("Show operation failed:", error);
                res.status(500).json({ error: "Show operation failed" });
            });
    }

    public async update(req: Request, res: Response): Promise<void> {
        const fileId = req.params.id;
        if (!req.body.serviceId && !req.body.table_headers && !req.body.name && (!req.body.fields || !req.body.sqlQuery)) {
            res.status(400).json({error: "Required parameters are missing"});
            return;
        }

        RegistryFile.findByPk(fileId)
            .then((registryFile) => {
                if (!registryFile) {
                    res.status(404).json({error: "Registry file not found"});
                    return;
                }

                registryFile.name = req.body.name;
                registryFile.service_id = req.body.serviceId;
                registryFile.server_id = req.body.serverId;
                registryFile.table_headers = req.body.tableHeaders;
                registryFile.fields = req.body.fields;
                registryFile.sql_query = req.body.sqlQuery;

                return registryFile.save();
            })
            .then((updatedRegistryFile) => {
                res.json(updatedRegistryFile);
            })
            .catch((error) => {
                console.error("Update operation failed:", error);
                res.status(500).json({error: "Update operation failed"});
            });
    }


    public async destroy(req: Request, res: Response): Promise<void> {
        const fileId = req.params.id;

        RegistryFile.findByPk(fileId)
            .then((registryFile) => {
                if (!registryFile) {
                    res.status(404).json({error: "Registry file not found"});
                    return;
                }

                return registryFile.destroy();
            })
            .then(() => {
                res.json({message: "Registry file deleted successfully"});
            })
            .catch((error) => {
                console.error("Delete operation failed:", error);
                res.status(500).json({error: "Delete operation failed"});
            });
    }

}
