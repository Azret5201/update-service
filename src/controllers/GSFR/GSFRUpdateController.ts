import {Request, Response} from 'express';
import {updateGSFR} from "../../services/GSFR/updateGSFR";

export class GSFRUpdateController {

    public async update(req: Request, res: Response) {
        try {
            // Используйте await перед вызовом getDataForReport
            const reportData: any = await updateGSFR()
            console.log(reportData)

        } catch (error) {
            console.error('Ошибка при получении данных для отчета:', error);
            res.status(500).json({success: false, message: 'Ошибка при получении данных для отчета, ' + error});
        }
        console.log('script complete')
    }
}
